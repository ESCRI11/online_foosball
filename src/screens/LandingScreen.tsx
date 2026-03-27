import { useState } from 'react';

interface Props {
  onCreateGame: () => void;
  onJoinGame: (hostId: string) => void;
  initialJoinId?: string;
}

function Football() {
  return (
    <svg className="landing-ball" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#333" strokeWidth="3"/>
      <circle cx="50" cy="50" r="46" fill="url(#ballShade)"/>
      {/* Pentagon panels */}
      <path d="M50 18 L62 30 L58 45 L42 45 L38 30 Z" fill="#333"/>
      <path d="M22 42 L30 30 L38 30 L42 45 L32 54 Z" fill="#333"/>
      <path d="M78 42 L70 30 L62 30 L58 45 L68 54 Z" fill="#333"/>
      <path d="M32 54 L42 45 L58 45 L68 54 L64 68 L50 74 L36 68 Z" fill="none" stroke="#333" strokeWidth="2"/>
      <path d="M28 66 L32 54 L36 68 Z" fill="#333"/>
      <path d="M72 66 L68 54 L64 68 Z" fill="#333"/>
      <path d="M50 82 L36 68 L50 74 L64 68 Z" fill="#333"/>
      <circle cx="42" cy="38" r="8" fill="rgba(255,255,255,0.35)"/>
      <defs>
        <radialGradient id="ballShade" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

export function LandingScreen({ onCreateGame, onJoinGame, initialJoinId }: Props) {
  const [joinId, setJoinId] = useState(initialJoinId || '');
  const [showJoin, setShowJoin] = useState(!!initialJoinId);

  return (
    <div className="screen landing">
      <Football />

      <div className="landing-title">
        <h1>Online Foosball</h1>
        <p className="subtitle">Peer-to-peer table football in your browser</p>
      </div>

      <div className="landing-card">
        <div className="actions">
          <button className="btn primary large" onClick={onCreateGame}>
            Create Game
          </button>

          {!showJoin ? (
            <button className="btn secondary large" onClick={() => setShowJoin(true)}>
              Join Game
            </button>
          ) : (
            <div className="join-form">
              <input
                type="text"
                placeholder="Enter Game ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinId && onJoinGame(joinId)}
                autoFocus
              />
              <button
                className="btn primary"
                onClick={() => joinId && onJoinGame(joinId)}
                disabled={!joinId}
              >
                Join
              </button>
            </div>
          )}
        </div>

        <div className="controls-grid">
          <div className="control-item">
            <kbd>W</kbd><kbd>S</kbd> <span className="control-alt">↑ ↓</span>
            <span>GK + Defense</span>
          </div>
          <div className="control-item">
            <kbd>A</kbd><kbd>D</kbd> <span className="control-alt">← →</span>
            <span>Mid + Attack</span>
          </div>
          <div className="control-item">
            <kbd>Space</kbd>
            <span>⚡ Power Move</span>
          </div>
          <div className="control-item">
            <kbd>P</kbd>
            <span>Pause</span>
          </div>
        </div>
      </div>

      <p className="landing-footer">First to 5 goals wins · 2 power moves per team</p>
    </div>
  );
}
