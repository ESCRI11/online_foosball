export type RodGroup = 'defense' | 'attack';

export interface Rod {
  x: number;          // fixed horizontal position on table
  y: number;          // current lateral offset (slide position, -ROD_SLIDE_RANGE to +ROD_SLIDE_RANGE)
  angle: number;      // unused, kept for compatibility
  playerCount: number;
  side: 'host' | 'guest';
  group: RodGroup;    // defense = GK+DEF, attack = MID+ATK
  kicking: boolean;   // unused, kept for compatibility
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GameState {
  ball: Ball;
  rods: Rod[];
  score: [number, number]; // [host, guest]
  status: 'playing' | 'goal' | 'countdown' | 'finished' | 'paused';
  goalPauseTimer: number;
  countdownTimer: number;
  lastScorer: 'host' | 'guest' | null;
}

export interface PlayerInput {
  defUp: boolean;
  defDown: boolean;
  atkUp: boolean;
  atkDown: boolean;
}

export type Message =
  | { type: 'input'; data: PlayerInput }
  | { type: 'state'; data: GameState }
  | { type: 'start' }
  | { type: 'rematch' };

export type Screen = 'landing' | 'lobby' | 'game' | 'gameover';
export type Role = 'host' | 'guest';
