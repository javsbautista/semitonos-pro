export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return res.status(500).json({ error: 'FAL_KEY no configurada en Vercel' });

  try {
    const { image_data, scale = 2 } = req.body;
    if (!image_data) return res.status(400).json({ error: 'Falta image_data' });

    const response = await fetch('https://queue.fal.run/fal-ai/esrgan', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: image_data,
        scale: Number(scale) === 4 ? 4 : 2,
        model: 'RealESRGAN_x4plus'
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    return res.status(200).json({ request_id: data.request_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
