export function convertToEmbedUrl(url) {
  if (!url) return null;

  // YouTube
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  }

  // TikTok
  const ttRegex = /tiktok\.com\/@[^/]+\/video\/(\d+)/;
  const ttMatch = url.match(ttRegex);
  if (ttMatch) {
    return { type: 'tiktok', embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`, originalUrl: url };
  }

  // TikTok embed URL already
  if (url.includes('tiktok.com/embed')) {
    return { type: 'tiktok', embedUrl: url, originalUrl: url };
  }

  return { type: 'unknown', embedUrl: null, originalUrl: url };
}
