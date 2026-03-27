import type { GameState, Role } from '../types';

interface Props {
  state: GameState;
  role: Role;
  isLocal: boolean;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

function StatRow({ label, red, blue }: { label: string; red: string | number; blue: string | number }) {
  return (
    <div className="stat-row">
      <span className="stat-val stat-red">{red}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-val stat-blue">{blue}</span>
    </div>
  );
}

export function GameOverScreen({ state, role, isLocal, onPlayAgain, onNewGame }: Props) {
  const hostWon = state.score[0] > state.score[1];
  const winner = hostWon ? 'Red' : 'Blue';
  const isWinner = isLocal || (hostWon && role === 'host') || (!hostWon && role === 'guest');

  return (
    <div className="screen gameover">
      <h1>{isLocal ? `${winner} Wins!` : isWinner ? 'You Win!' : 'You Lose!'}</h1>

      <div className="stats-card">
        <div className="stats-header">
          <span className="stats-team-red">RED</span>
          <span className="stats-title">Match Stats</span>
          <span className="stats-team-blue">BLUE</span>
        </div>

        <StatRow label="Goals" red={state.score[0]} blue={state.score[1]} />
        <StatRow label="Power Moves" red={state.powerMovesUsed[0]} blue={state.powerMovesUsed[1]} />
        <StatRow label="⚡ Goals" red={state.powerMoveGoals[0]} blue={state.powerMoveGoals[1]} />
      </div>

      <div className="actions">
        <button className="btn primary" onClick={onPlayAgain}>Play Again</button>
        <button className="btn secondary" onClick={onNewGame}>New Game</button>
      </div>
    </div>
  );
}
