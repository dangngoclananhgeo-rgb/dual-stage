import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'content.json');

const DEFAULT = {
  videoUrlA: '', captionA: '', updatedAtA: '',
  videoUrlB: '', captionB: '', updatedAtB: '',
};

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getContent() {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT, null, 2));
    return { ...DEFAULT };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { ...DEFAULT };
  }
}

export function updateContent(role, videoUrl, caption) {
  ensureDir();
  const content = getContent();
  const now = new Date().toISOString();
  content[`videoUrl${role}`] = videoUrl;
  content[`caption${role}`] = caption;
  content[`updatedAt${role}`] = now;
  fs.writeFileSync(DB_PATH, JSON.stringify(content, null, 2));
}
