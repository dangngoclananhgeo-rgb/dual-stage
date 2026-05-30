import jwt from 'jsonwebtoken';
import { updateContent } from '../../../lib/db';

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { role: pathRole } = req.query;
  if (!['A', 'B'].includes(pathRole)) return res.status(400).json({ error: 'Role không hợp lệ' });

  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Chưa đăng nhập' });

  let decoded;
  try {
    decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }

  if (decoded.role !== pathRole) {
    return res.status(403).json({ error: `Bạn không có quyền chỉnh sửa khu vực ${pathRole}` });
  }

  const { videoUrl, caption } = req.body;
  if (!videoUrl?.trim()) return res.status(400).json({ error: 'Link video không được để trống' });

  const wordCount = countWords(caption || '');
  if (wordCount > 300) return res.status(400).json({ error: `Caption vượt quá 300 từ (hiện tại: ${wordCount} từ)` });

  try {
    updateContent(pathRole, videoUrl.trim(), (caption || '').trim());
    res.status(200).json({ success: true, message: 'Đã cập nhật thành công' });
  } catch (e) {
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
}
