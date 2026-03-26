import type { GameState, Rod } from '../types';
import {
  TABLE_WIDTH, TABLE_HEIGHT, BORDER_WIDTH, GOAL_WIDTH,
  BALL_RADIUS, PLAYER_WIDTH, PLAYER_HEIGHT,
} from './constants';

const FIELD_COLOR = '#2d8a4e';
const FIELD_LINES = '#3da564';
const BORDER_COLOR = '#5c3a1e';
const BORDER_HIGHLIGHT = '#7a5230';
const HOST_ROD_COLOR = '#cc3333';
const GUEST_ROD_COLOR = '#3366cc';
const HOST_PLAYER_COLOR = '#e04040';
const GUEST_PLAYER_COLOR = '#4080e0';
const BALL_COLOR = '#ffffff';
const BALL_SHADOW = 'rgba(0,0,0,0.3)';
const GOAL_AREA_COLOR = 'rgba(0,0,0,0.25)';

function getPlayerPositions(rod: Rod): number[] {
  const positions: number[] = [];
  const playArea = TABLE_HEIGHT - BORDER_WIDTH * 2;
  const spacing = playArea / (rod.playerCount + 1);
  for (let i = 0; i < rod.playerCount; i++) {
    positions.push(BORDER_WIDTH + spacing * (i + 1) + rod.y);
  }
  return positions;
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number,
) {
  const scaleX = canvasWidth / TABLE_WIDTH;
  const scaleY = canvasHeight / TABLE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (canvasWidth - TABLE_WIDTH * scale) / 2;
  const offsetY = (canvasHeight - TABLE_HEIGHT * scale) / 2;

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Dark background around table
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Field
  ctx.fillStyle = FIELD_COLOR;
  ctx.fillRect(BORDER_WIDTH, BORDER_WIDTH, TABLE_WIDTH - BORDER_WIDTH * 2, TABLE_HEIGHT - BORDER_WIDTH * 2);

  // Field markings
  ctx.strokeStyle = FIELD_LINES;
  ctx.lineWidth = 2;

  // Center line
  ctx.beginPath();
  ctx.moveTo(TABLE_WIDTH / 2, BORDER_WIDTH);
  ctx.lineTo(TABLE_WIDTH / 2, TABLE_HEIGHT - BORDER_WIDTH);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(TABLE_WIDTH / 2, TABLE_HEIGHT / 2, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = FIELD_LINES;
  ctx.beginPath();
  ctx.arc(TABLE_WIDTH / 2, TABLE_HEIGHT / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Goal areas
  const goalTop = (TABLE_HEIGHT - GOAL_WIDTH) / 2;
  const goalBottom = (TABLE_HEIGHT + GOAL_WIDTH) / 2;

  // Left goal area
  ctx.fillStyle = GOAL_AREA_COLOR;
  ctx.fillRect(0, goalTop, BORDER_WIDTH, GOAL_WIDTH);

  // Right goal area
  ctx.fillRect(TABLE_WIDTH - BORDER_WIDTH, goalTop, BORDER_WIDTH, GOAL_WIDTH);

  // Goal nets (darker)
  ctx.fillStyle = '#111';
  ctx.fillRect(0, goalTop, BORDER_WIDTH / 2, GOAL_WIDTH);
  ctx.fillRect(TABLE_WIDTH - BORDER_WIDTH / 2, goalTop, BORDER_WIDTH / 2, GOAL_WIDTH);

  // Borders (wood texture look)
  ctx.fillStyle = BORDER_COLOR;
  // Top border
  ctx.fillRect(0, 0, TABLE_WIDTH, BORDER_WIDTH);
  // Bottom border
  ctx.fillRect(0, TABLE_HEIGHT - BORDER_WIDTH, TABLE_WIDTH, BORDER_WIDTH);
  // Left border (except goal)
  ctx.fillRect(0, 0, BORDER_WIDTH, goalTop);
  ctx.fillRect(0, goalBottom, BORDER_WIDTH, TABLE_HEIGHT - goalBottom);
  // Right border (except goal)
  ctx.fillRect(TABLE_WIDTH - BORDER_WIDTH, 0, BORDER_WIDTH, goalTop);
  ctx.fillRect(TABLE_WIDTH - BORDER_WIDTH, goalBottom, BORDER_WIDTH, TABLE_HEIGHT - goalBottom);

  // Border highlights
  ctx.fillStyle = BORDER_HIGHLIGHT;
  ctx.fillRect(0, 0, TABLE_WIDTH, 3);
  ctx.fillRect(0, 0, 3, TABLE_HEIGHT);

  // Rods and player figures
  for (const rod of state.rods) {
    const isHost = rod.side === 'host';
    const rodColor = isHost ? HOST_ROD_COLOR : GUEST_ROD_COLOR;
    const playerColor = isHost ? HOST_PLAYER_COLOR : GUEST_PLAYER_COLOR;

    // Rod track (subtle line)
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rod.x, BORDER_WIDTH);
    ctx.lineTo(rod.x, TABLE_HEIGHT - BORDER_WIDTH);
    ctx.stroke();

    // Rod bar
    ctx.strokeStyle = rodColor;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(rod.x, BORDER_WIDTH);
    ctx.lineTo(rod.x, TABLE_HEIGHT - BORDER_WIDTH);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Player figures
    const playerYs = getPlayerPositions(rod);
    for (const py of playerYs) {
      ctx.save();
      ctx.translate(rod.x, py);

      // Body
      ctx.fillStyle = playerColor;
      ctx.fillRect(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2, PLAYER_WIDTH, PLAYER_HEIGHT);

      // Head (circle on top)
      ctx.fillStyle = playerColor;
      ctx.beginPath();
      ctx.arc(0, -PLAYER_HEIGHT / 2 - 4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Body outline
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2, PLAYER_WIDTH, PLAYER_HEIGHT);

      ctx.restore();
    }
  }

  // Ball shadow
  ctx.fillStyle = BALL_SHADOW;
  ctx.beginPath();
  ctx.arc(state.ball.x + 2, state.ball.y + 2, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Ball
  ctx.fillStyle = BALL_COLOR;
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Ball highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(state.ball.x - 2, state.ball.y - 2, BALL_RADIUS * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Score display
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(TABLE_WIDTH / 2 - 70, 0, 140, 24);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${state.score[0]}  -  ${state.score[1]}`, TABLE_WIDTH / 2, 13);

  // Side labels
  ctx.font = '11px monospace';
  ctx.fillStyle = HOST_ROD_COLOR;
  ctx.fillText('RED', TABLE_WIDTH / 2 - 40, 13);
  ctx.fillStyle = GUEST_ROD_COLOR;
  ctx.fillText('BLUE', TABLE_WIDTH / 2 + 40, 13);

  // Goal flash
  if (state.status === 'goal' && state.goalPauseTimer > 1.5) {
    ctx.fillStyle = `rgba(255,255,255,${(state.goalPauseTimer - 1.5) * 2})`;
    ctx.fillRect(BORDER_WIDTH, BORDER_WIDTH, TABLE_WIDTH - BORDER_WIDTH * 2, TABLE_HEIGHT - BORDER_WIDTH * 2);
  }

  // Goal text
  if (state.status === 'goal') {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('GOAL!', TABLE_WIDTH / 2, TABLE_HEIGHT / 2);
    ctx.shadowBlur = 0;
  }

  // Countdown
  if (state.status === 'countdown') {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(BORDER_WIDTH, BORDER_WIDTH, TABLE_WIDTH - BORDER_WIDTH * 2, TABLE_HEIGHT - BORDER_WIDTH * 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const num = Math.ceil(state.countdownTimer);
    ctx.fillText(num > 0 ? String(num) : 'GO!', TABLE_WIDTH / 2, TABLE_HEIGHT / 2);
  }

  ctx.restore();
}
