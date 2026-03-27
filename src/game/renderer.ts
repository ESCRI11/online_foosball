import type { GameState, Rod } from '../types';
import {
  TABLE_WIDTH, TABLE_HEIGHT, BORDER_WIDTH, GOAL_WIDTH,
  BALL_RADIUS, PLAYER_WIDTH, PLAYER_HEIGHT, MIN_PLAYER_SPACING,
} from './constants';

const FIELD_COLOR_LIGHT = '#2f8e50';
const FIELD_COLOR_DARK = '#2a7e46';
const FIELD_LINES = '#3da564';
const GRASS_STRIP_COUNT = 12;
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
  const playArea = TABLE_HEIGHT - BORDER_WIDTH * 2;
  const naturalSpacing = playArea / (rod.playerCount + 1);
  const spacing = Math.max(naturalSpacing, MIN_PLAYER_SPACING);
  const totalSpan = spacing * (rod.playerCount - 1);
  const startY = TABLE_HEIGHT / 2 - totalSpan / 2 + rod.y;

  const positions: number[] = [];
  for (let i = 0; i < rod.playerCount; i++) {
    positions.push(startY + spacing * i);
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

  // Field with alternating grass strips
  const fieldLeft = BORDER_WIDTH;
  const fieldTop = BORDER_WIDTH;
  const fieldW = TABLE_WIDTH - BORDER_WIDTH * 2;
  const fieldH = TABLE_HEIGHT - BORDER_WIDTH * 2;
  const stripW = fieldW / GRASS_STRIP_COUNT;
  for (let i = 0; i < GRASS_STRIP_COUNT; i++) {
    ctx.fillStyle = i % 2 === 0 ? FIELD_COLOR_LIGHT : FIELD_COLOR_DARK;
    ctx.fillRect(fieldLeft + stripW * i, fieldTop, stripW, fieldH);
  }

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

  // Penalty area and goal area box markings
  const midY = TABLE_HEIGHT / 2;
  const penaltyBoxW = 120;
  const penaltyBoxH = 260;
  const goalBoxW = 50;
  const goalBoxH = 160;

  // Left penalty area
  ctx.strokeRect(fieldLeft, midY - penaltyBoxH / 2, penaltyBoxW, penaltyBoxH);
  // Left goal area (small box)
  ctx.strokeRect(fieldLeft, midY - goalBoxH / 2, goalBoxW, goalBoxH);
  // Left penalty spot
  ctx.fillStyle = FIELD_LINES;
  ctx.beginPath();
  ctx.arc(fieldLeft + penaltyBoxW - 20, midY, 3, 0, Math.PI * 2);
  ctx.fill();
  // Left penalty arc
  ctx.beginPath();
  ctx.arc(fieldLeft + penaltyBoxW - 20, midY, 40, -0.7, 0.7);
  ctx.stroke();

  // Right penalty area
  ctx.strokeRect(fieldLeft + fieldW - penaltyBoxW, midY - penaltyBoxH / 2, penaltyBoxW, penaltyBoxH);
  // Right goal area (small box)
  ctx.strokeRect(fieldLeft + fieldW - goalBoxW, midY - goalBoxH / 2, goalBoxW, goalBoxH);
  // Right penalty spot
  ctx.fillStyle = FIELD_LINES;
  ctx.beginPath();
  ctx.arc(fieldLeft + fieldW - penaltyBoxW + 20, midY, 3, 0, Math.PI * 2);
  ctx.fill();
  // Right penalty arc
  ctx.beginPath();
  ctx.arc(fieldLeft + fieldW - penaltyBoxW + 20, midY, 40, Math.PI - 0.7, Math.PI + 0.7);
  ctx.stroke();

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
  const scoreW = 200;
  const scoreH = 28;
  const scoreX = TABLE_WIDTH / 2;
  const scoreY = scoreH / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(scoreX - scoreW / 2, 0, scoreW, scoreH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Team labels
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = HOST_ROD_COLOR;
  ctx.fillText('RED', scoreX - 70, scoreY);
  ctx.fillStyle = GUEST_ROD_COLOR;
  ctx.fillText('BLUE', scoreX + 70, scoreY);

  // Score numbers
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${state.score[0]}`, scoreX - 30, scoreY);
  ctx.fillText('-', scoreX, scoreY);
  ctx.fillText(`${state.score[1]}`, scoreX + 30, scoreY);

  // Pause hint (always visible)
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'right';
  ctx.fillText('P = Pause', TABLE_WIDTH - BORDER_WIDTH - 4, BORDER_WIDTH + 12);

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

  // Pause overlay
  if (state.status === 'paused') {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(BORDER_WIDTH, BORDER_WIDTH, TABLE_WIDTH - BORDER_WIDTH * 2, TABLE_HEIGHT - BORDER_WIDTH * 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', TABLE_WIDTH / 2, TABLE_HEIGHT / 2);
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Press P to resume', TABLE_WIDTH / 2, TABLE_HEIGHT / 2 + 40);
  }

  ctx.restore();
}
