import type { GameState, PlayerInput, Ball, Rod } from '../types';
import {
  TABLE_WIDTH, TABLE_HEIGHT, BORDER_WIDTH, GOAL_WIDTH,
  BALL_RADIUS, BALL_MAX_SPEED, BALL_FRICTION, BALL_INITIAL_SPEED,
  ROD_SLIDE_RANGE, ROD_SLIDE_SPEED, SHOOT_IMPULSE,
  PLAYER_WIDTH, PLAYER_HEIGHT, MIN_PLAYER_SPACING, ROD_CONFIGS,
  WIN_SCORE, GOAL_PAUSE_DURATION, POWER_MOVE_SPEED, POWER_MOVES_PER_TEAM,
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
    powerMoveBannerTimer: 0,
    powerMoveActiveTimer: 0,
    powerMovesLeft: [POWER_MOVES_PER_TEAM, POWER_MOVES_PER_TEAM],
    powerMovesUsed: [0, 0],
    powerMoveGoals: [0, 0],
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

  // Handle power move banner freeze
  if (newState.status === 'powermove') {
    newState.powerMoveBannerTimer -= dt;
    if (newState.powerMoveBannerTimer <= 0) {
      newState.status = 'playing';
      newState.powerMoveBannerTimer = 0;
      newState.powerMoveActiveTimer = 3;
      const speed = Math.sqrt(newState.ball.vx ** 2 + newState.ball.vy ** 2);
      if (speed > 0) {
        const scale = POWER_MOVE_SPEED / speed;
        newState.ball.vx *= scale;
        newState.ball.vy *= scale;
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

  if (newState.powerMoveActiveTimer > 0) {
    newState.powerMoveActiveTimer -= dt;
    if (newState.powerMoveActiveTimer < 0) newState.powerMoveActiveTimer = 0;
  }

  // Ball movement
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Friction (reduced during power move for sustained speed)
  const friction = newState.powerMoveActiveTimer > 0 ? 1.0 : BALL_FRICTION;
  ball.vx *= friction;
  ball.vy *= friction;

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
      newState.score[0]++;
      if (newState.powerMoveActiveTimer > 0) newState.powerMoveGoals[0]++;
      newState.status = 'goal';
      newState.goalPauseTimer = GOAL_PAUSE_DURATION;
      newState.lastScorer = 'host';
      newState.powerMoveActiveTimer = 0;
      return newState;
    } else {
      ball.x = BORDER_WIDTH + BALL_RADIUS;
      ball.vx = Math.abs(ball.vx) * 0.9;
    }
  }

  if (ball.x + BALL_RADIUS > TABLE_WIDTH - BORDER_WIDTH) {
    if (ball.y > goalTop && ball.y < goalBottom) {
      newState.score[1]++;
      if (newState.powerMoveActiveTimer > 0) newState.powerMoveGoals[1]++;
      newState.status = 'goal';
      newState.goalPauseTimer = GOAL_PAUSE_DURATION;
      newState.lastScorer = 'guest';
      newState.powerMoveActiveTimer = 0;
      return newState;
    } else {
      ball.x = TABLE_WIDTH - BORDER_WIDTH - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx) * 0.9;
    }
  }

  // Rod/player collisions (skipped while power move ball is active)
  if (newState.powerMoveActiveTimer <= 0) {
    for (const rod of newState.rods) {
      const input = rod.side === 'host' ? hostInput : guestInput;
      const playerYs = getPlayerPositions(rod);
      for (const py of playerYs) {
        if (checkPlayerCollision(ball, rod.x, py)) {
          const shootDir = rod.side === 'host' ? -1 : 1;

          const hitZone = PLAYER_HEIGHT / 2 + BALL_RADIUS;
          const hitOffset = Math.max(-1, Math.min(1, (ball.y - py) / hitZone));

          // Easter egg: space held + defense rod = POWER MOVE (limited uses)
          const sideIdx = rod.side === 'host' ? 0 : 1;
          if (rod.group === 'defense' && input.powerMove && newState.powerMovesLeft[sideIdx] > 0) {
            newState.powerMovesLeft[sideIdx]--;
            newState.powerMovesUsed[sideIdx]++;
            ball.x = rod.x + shootDir * (PLAYER_WIDTH / 2 + BALL_RADIUS + 1);
            const edgeFactor = Math.abs(hitOffset);
            ball.vx = shootDir * SHOOT_IMPULSE * (1 - 0.35 * edgeFactor);
            ball.vy = hitOffset * SHOOT_IMPULSE * 0.9;
            newState.status = 'powermove';
            newState.powerMoveBannerTimer = 1.2;
            return newState;
          }

          ball.x = rod.x + shootDir * (PLAYER_WIDTH / 2 + BALL_RADIUS + 1);

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
  }

  if (newState.powerMoveActiveTimer <= 0) {
    [ball.vx, ball.vy] = clampSpeed(ball.vx, ball.vy);
  }

  return newState;
}
