import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sweet Catch — Four et Délices",
  description: "Catch the sweets, dodge the bombs. A mini arcade game by Four et Délices.",
};

export default function GamePage() {
  return (
    <div className="game-page">
      <div className="game-page__back-bar">
        <a href="/" className="game-page__back-link">
          ← Four et Délices
        </a>
        <span className="game-page__title">Sweet Catch</span>
      </div>
      <div className="game-page__frame-wrap">
        <iframe
          src="/sweet-catch-v2.html"
          title="Sweet Catch — arcade game"
          className="game-page__iframe"
          allow="autoplay"
        />
      </div>
      <style>{`
        html, body { margin: 0; padding: 0; background: #FDF8F3; height: 100%; overflow: hidden; }
        .game-page {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          background: #FDF8F3;
          overflow: hidden;
        }
        .game-page__back-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(26,18,8,0.08);
          background: #FDF8F3;
          flex-shrink: 0;
          height: 44px;
        }
        .game-page__back-link {
          font-family: "Courier New", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #1a1208;
          text-decoration: none;
          padding: 4px 0;
        }
        .game-page__back-link:hover { opacity: 0.7; }
        .game-page__title {
          font-family: "Courier New", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #F4A62A;
        }
        .game-page__frame-wrap {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .game-page__iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
          background: #FDF8F3;
        }
      `}</style>
    </div>
  );
}
