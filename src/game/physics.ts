import type { GameState, PlayerInput, Ball, Rod } from '../types';
import {
  TABLE_WIDTH, TABLE_HEIGHT, BORDER_WIDTH, GOAL_WIDTH,
  BALL_RADIUS, BALL_MAX_SPEED, BALL_FRICTION, BALL_INITIAL_SPEED,
  ROD_SLIDE_RANGE, ROD_SLIDE_SPEED, SHOOT_IMPULSE,
  PLAYER_WIDTH, PLAYER_HEIGHT, MIN_PLAYER_SPACING, ROD_CONFIGS,
  WIN_SCORE, GOAL_PAUSE_DURATION,
} from './constants';

export function createInitialState(): GameState {
  return {
    ball: {
      x: TABLE_WIDTH / 2,
      y: TABLE_HEIGHT / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * BALL_INITIAL_SPEED,
      vy: (Math.random() - 0.5) * BALL_INITIAL_SPEED,
    },
    rods: ROD_CONFIGS.map(cfg => ({
      x: cfg.x,
      y: 0,
      angle: 0,
      playerCount: cfg.playerCount,
      side: cfg.side,
      group: cfg.group,
      kicking: false,
    })),
    score: [0, 0],
    status: 'countdown',
    goalPauseTimer: 0,
    countdownTimer: 3,
    lastScorer: null,
  };
}

function resetBall(): Ball {
  return {
    x: TABLE_WIDTH / 2,
    y: TABLE_HEIGHT / 2,
    vx: (Math.random() > 0.5 ? 1 : -1) * BALL_INITIAL_SPEED,
    vy: (Math.random() - 0.5) * BALL_INITIAL_SPEED,
  };
}

function clampSpeed(vx: number, vy: number): [number, number] {
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > BALL_MAX_SPEED) {
    const scale = BALL_MAX_SPEED / speed;
    return [vx * scale, vy * scale];
  }
  return [vx, vy];
}

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

// Check ball vs player figure collision
function checkPlayerCollision(
  ball: Ball,
  playerX: number,
  playerY: number,
): boolean {
  const halfW = PLAYER_WIDTH / 2;
  const halfH = PLAYER_HEIGHT / 2;

  const dx = Math.abs(ball.x - playerX);
  const dy = Math.abs(ball.y - playerY);

  return dx < halfW + BALL_RADIUS && dy < halfH + BALL_RADIUS;
}

export function stepPhysics(
  state: GameState,
  dt: number,
  hostInput: PlayerInput,
  guestInput: PlayerInput,
): GameState {
  const newState = structuredClone(state);

  // Handle countdown
  if (newState.status === 'countdown') {
    newState.countdownTimer -= dt;
    if (newState.countdownTimer <= 0) {
      newState.status = 'playing';
      newState.countdownTimer = 0;
    }
    return newState;
  }

  // Handle goal pause
  if (newState.status === 'goal') {
    newState.goalPauseTimer -= dt;
    if (newState.goalPauseTimer <= 0) {
      if (newState.score[0] >= WIN_SCORE || newState.score[1] >= WIN_SCORE) {
        newState.status = 'finished';
      } else {
        newState.ball = resetBall();
        newState.status = 'countdown';
        newState.countdownTimer = 2;
      }
    }
    return newState;
  }

  if (newState.status === 'finished' || newState.status === 'paused') return newState;

  // Apply inputs to rods — each player controls two groups independently
  for (const rod of newState.rods) {
    const input = rod.side === 'host' ? hostInput : guestInput;
    const up   = rod.group === 'defense' ? input.defUp   : input.atkUp;
    const down = rod.group === 'defense' ? input.defDown : input.atkDown;

    if (up)   rod.y -= ROD_SLIDE_SPEED * dt;
    if (down) rod.y += ROD_SLIDE_SPEED * dt;
    rod.y = Math.max(-ROD_SLIDE_RANGE, Math.min(ROD_SLIDE_RANGE, rod.y));
  }

  const ball = newState.ball;

  // Ball movement
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Friction
  ball.vx *= BALL_FRICTION;
  ball.vy *= BALL_FRICTION;

  // Wall collisions (top/bottom)
  if (ball.y - BALL_RADIUS < BORDER_WIDTH) {
    ball.y = BORDER_WIDTH + BALL_RADIUS;
    ball.vy = Math.abs(ball.vy) * 0.9;
  }
  if (ball.y + BALL_RADIUS > TABLE_HEIGHT - BORDER_WIDTH) {
    ball.y = TABLE_HEIGHT - BORDER_WIDTH - BALL_RADIUS;
    ball.vy = -Math.abs(ball.vy) * 0.9;
  }

  // Goal detection & side wall collisions
  // Blue (guest) defends LEFT goal, Red (host) defends RIGHT goal
  const goalTop = (TABLE_HEIGHT - GOAL_WIDTH) / 2;
  const goalBottom = (TABLE_HEIGHT + GOAL_WIDTH) / 2;

  if (ball.x - BALL_RADIUS < BORDER_WIDTH) {
    if (ball.y > goalTop && ball.y < goalBottom) {
      // Ball entered left goal -> Red (host) scores
      newState.score[0]++;
      newState.status = 'goal';
      newState.goalPauseTimer = GOAL_PAUSE_DURATION;
      newState.lastScorer = 'host';
      return newState;
    } else {
      ball.x = BORDER_WIDTH + BALL_RADIUS;
      ball.vx = Math.abs(ball.vx) * 0.9;
    }
  }

  if (ball.x + BALL_RADIUS > TABLE_WIDTH - BORDER_WIDTH) {
    if (ball.y > goalTop && ball.y < goalBottom) {
      // Ball entered right goal -> Blue (guest) scores
      newState.score[1]++;
      newState.status = 'goal';
      newState.goalPauseTimer = GOAL_PAUSE_DURATION;
      newState.lastScorer = 'guest';
      return newState;
    } else {
      ball.x = TABLE_WIDTH - BORDER_WIDTH - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx) * 0.9;
    }
  }

  // Rod/player collisions - angle depends on where the ball hits the figure
  for (const rod of newState.rods) {
    const playerYs = getPlayerPositions(rod);
    for (const py of playerYs) {
      if (checkPlayerCollision(ball, rod.x, py)) {
        const shootDir = rod.side === 'host' ? -1 : 1;

        // Where did the ball hit? Normalized offset from player center: -1 (top edge) to +1 (bottom edge)
        const hitZone = PLAYER_HEIGHT / 2 + BALL_RADIUS;
        const hitOffset = Math.max(-1, Math.min(1, (ball.y - py) / hitZone));

        ball.x = rod.x + shootDir * (PLAYER_WIDTH / 2 + BALL_RADIUS + 1);

        // Edge hits trade forward speed for steep lateral deflection
        const edgeFactor = Math.abs(hitOffset);
        const forwardSpeed = SHOOT_IMPULSE * (1 - 0.35 * edgeFactor);
        const lateralSpeed = hitOffset * SHOOT_IMPULSE * 0.9;

        ball.vx = shootDir * forwardSpeed;
        ball.vy = lateralSpeed;

        [ball.vx, ball.vy] = clampSpeed(ball.vx, ball.vy);
        break;
      }
    }
  }

  [ball.vx, ball.vy] = clampSpeed(ball.vx, ball.vy);

  return newState;
}
