import { getContent } from '../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const content = getContent();
    res.status(200).json(content);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
