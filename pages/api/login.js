import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Thiếu mật khẩu' });

  const secret = process.env.JWT_SECRET;
  let role = null;

  if (password === process.env.ADMIN_PASSWORD_A) role = 'A';
  else if (password === process.env.ADMIN_PASSWORD_B) role = 'B';

  if (!role) return res.status(401).json({ error: 'Mật khẩu không đúng' });

  const token = jwt.sign({ role }, secret, { expiresIn: '8h' });
  res.status(200).json({ role, token });
}
