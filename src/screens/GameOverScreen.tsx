import type { GameState, Role } from '../types';

interface Props {
  state: GameState;
  role: Role;
  isLocal: boolean;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GameOverScreen({ state, role, isLocal, onPlayAgain, onNewGame }: Props) {
  const hostWon = state.score[0] >= state.score[1];
  const winner = hostWon ? 'Red' : 'Blue';
  const isWinner = isLocal || (hostWon && role === 'host') || (!hostWon && role === 'guest');

  return (
    <div className="screen gameover">
      <h1>{isLocal ? `${winner} Wins!` : isWinner ? 'You Win!' : 'You Lose!'}</h1>
      <div className="final-score">
        <span className="score-host">{state.score[0]}</span>
        <span className="score-divider">-</span>
        <span className="score-guest">{state.score[1]}</span>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={onPlayAgain}>Play Again</button>
        <button className="btn secondary" onClick={onNewGame}>New Game</button>
      </div>
    </div>
  );
}
