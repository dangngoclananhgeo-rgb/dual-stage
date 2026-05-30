import { useState, useEffect } from 'react';
import Head from 'next/head';
import { convertToEmbedUrl } from '../lib/video';

export async function getServerSideProps() {
  const { getContent } = await import('../lib/db');
  const content = getContent();
  return { props: { initialContent: content } };
}

function VideoPanel({ label, videoUrl, caption, side }) {
  const videoInfo = convertToEmbedUrl(videoUrl);
  const accentColor = side === 'A' ? '#e8c547' : '#47c5e8';
  const isEmpty = !videoUrl;

  return (
    <div className={`panel panel-${side}`}>
      <div className="panel-label">
        <span className="label-badge" style={{ '--accent': accentColor }}>
          {label}
        </span>
      </div>

      <div className="video-wrapper">
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon">◻</div>
            <p>Chưa có nội dung</p>
          </div>
        ) : videoInfo?.type === 'unknown' ? (
          <div className="external-link-state">
            <p>Video không thể nhúng trực tiếp.</p>
            <a href={videoInfo.originalUrl} target="_blank" rel="noopener noreferrer" className="open-btn" style={{ '--accent': accentColor }}>
              Mở video ↗
            </a>
          </div>
        ) : (
          <iframe
            src={videoInfo.embedUrl}
            title={`Video ${label}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        )}
      </div>

      <div className="caption-area">
        {caption ? (
          <p className="caption-text">{caption}</p>
        ) : (
          <p className="caption-empty">Chưa có caption</p>
        )}
      </div>

      <style jsx>{`
        .panel {
          display: flex;
          flex-direction: column;
          width: 50%;
          min-height: 100vh;
          padding: 2rem 2.5rem;
          box-sizing: border-box;
          position: relative;
        }
        .panel-A { border-right: 1px solid rgba(255,255,255,0.06); }

        .panel-label {
          margin-bottom: 1.5rem;
        }
        .label-badge {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 0.3rem 0.9rem;
          display: inline-block;
          opacity: 0.85;
        }

        .video-wrapper {
          flex: 1;
          position: relative;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          min-height: 300px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }
        .video-wrapper iframe {
          width: 100%;
          aspect-ratio: 16/9;
          display: block;
          border: none;
          min-height: 300px;
        }

        .empty-state, .external-link-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 280px;
          gap: 0.75rem;
          color: rgba(255,255,255,0.25);
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
        }
        .empty-icon {
          font-size: 2rem;
          opacity: 0.2;
        }
        .open-btn {
          display: inline-block;
          margin-top: 0.5rem;
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 0.5rem 1.2rem;
          text-decoration: none;
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          transition: background 0.2s;
        }
        .open-btn:hover { background: rgba(255,255,255,0.05); }

        .caption-area {
          margin-top: 1.5rem;
          min-height: 5rem;
        }
        .caption-text {
          font-size: 0.95rem;
          line-height: 1.75;
          color: rgba(255,255,255,0.75);
          margin: 0;
          font-family: 'Lora', serif;
        }
        .caption-empty {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.2);
          font-family: 'DM Mono', monospace;
          margin: 0;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .panel {
            width: 100%;
            min-height: auto;
            padding: 1.5rem 1.25rem;
          }
          .panel-A {
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
        }
      `}</style>
    </div>
  );
}

export default function Home({ initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [showAdminHint, setShowAdminHint] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch('/api/content');
        if (r.ok) setContent(await r.json());
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Dual Stage</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Lora:ital,wght@0,400;0,500;1,400&family=Unbounded:wght@300;400&display=swap" rel="stylesheet" />
      </Head>

      <main>
        <header>
          <h1>DUAL <span>STAGE</span></h1>
          <div className="header-line" />
        </header>

        <div className="panels">
          <VideoPanel
            label="Zone A"
            videoUrl={content.videoUrlA}
            caption={content.captionA}
            side="A"
          />
          <VideoPanel
            label="Zone B"
            videoUrl={content.videoUrlB}
            caption={content.captionB}
            side="B"
          />
        </div>

        <button
          className="admin-btn"
          onClick={() => window.location.href = '/admin'}
          onMouseEnter={() => setShowAdminHint(true)}
          onMouseLeave={() => setShowAdminHint(false)}
          title="Trang quản trị"
        >
          ⚙
          {showAdminHint && <span className="admin-hint">Admin</span>}
        </button>
      </main>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        body {
          background: #0a0a0a;
          color: #f0f0f0;
          font-family: 'Lora', serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        ::selection { background: #e8c54740; }
      `}</style>

      <style jsx>{`
        main { min-height: 100vh; display: flex; flex-direction: column; }

        header {
          padding: 1.75rem 2.5rem 0;
          position: relative;
        }
        h1 {
          font-family: 'Unbounded', sans-serif;
          font-weight: 300;
          font-size: clamp(1rem, 2vw, 1.4rem);
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.9);
        }
        h1 span { color: rgba(255,255,255,0.3); }
        .header-line {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.15), transparent);
          margin-top: 1.25rem;
        }

        .panels {
          display: flex;
          flex: 1;
          align-items: flex-start;
        }

        .admin-btn {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 100;
        }
        .admin-btn:hover {
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
        }
        .admin-hint {
          position: absolute;
          right: 110%;
          background: rgba(20,20,20,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.25rem 0.6rem;
          font-size: 0.7rem;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.1em;
          white-space: nowrap;
          color: rgba(255,255,255,0.6);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          header { padding: 1.25rem 1.25rem 0; }
          .panels { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
