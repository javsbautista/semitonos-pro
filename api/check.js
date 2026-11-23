export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return res.status(500).json({ error: 'FAL_KEY no configurada en Vercel' });

  try {
    const { request_id } = req.body;
    if (!request_id) return res.status(400).json({ error: 'Falta request_id' });

    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/esrgan/requests/${request_id}/status`,
      { headers: { 'Authorization': `Key ${FAL_KEY}` } }
    );
    const statusData = await statusRes.json();

    if (statusData.status !== 'COMPLETED') {
      return res.status(200).json({ status: statusData.status || 'IN_PROGRESS' });
    }

    const resultRes = await fetch(
      `https://queue.fal.run/fal-ai/esrgan/requests/${request_id}`,
      { headers: { 'Authorization': `Key ${FAL_KEY}` } }
    );
    const resultData = await resultRes.json();

    return res.status(200).json(resultData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
