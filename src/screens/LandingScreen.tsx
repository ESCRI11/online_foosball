import { useState } from 'react';

interface Props {
  onCreateGame: () => void;
  onJoinGame: (hostId: string) => void;
  initialJoinId?: string;
}

export function LandingScreen({ onCreateGame, onJoinGame, initialJoinId }: Props) {
  const [joinId, setJoinId] = useState(initialJoinId || '');
  const [showJoin, setShowJoin] = useState(!!initialJoinId);

  return (
    <div className="screen landing">
      <h1>Online Foosball</h1>
      <p className="subtitle">Peer-to-peer table football</p>

      <div className="actions">
        <button className="btn primary" onClick={onCreateGame}>
          Create Game
        </button>

        {!showJoin ? (
          <button className="btn secondary" onClick={() => setShowJoin(true)}>
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

      <div className="controls-info">
        <h3>Controls</h3>
        <p><strong>W / S</strong> or <strong>↑ / ↓</strong> — Goalkeeper + Defense</p>
        <p><strong>A / D</strong> or <strong>← / →</strong> — Midfield + Attack</p>
        <p><strong>Space</strong> + Defender hit — ⚡ Power Move (2 per match)</p>
        <p><strong>P</strong> — Pause</p>
      </div>
    </div>
  );
}
