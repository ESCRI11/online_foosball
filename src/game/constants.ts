// Table dimensions (logical pixels)
export const TABLE_WIDTH = 800;
export const TABLE_HEIGHT = 500;
export const BORDER_WIDTH = 20;
export const GOAL_WIDTH = 120; // vertical opening for the goal

// Ball
export const BALL_RADIUS = 8;
export const BALL_MAX_SPEED = 600;
export const BALL_FRICTION = 0.998; // per-frame multiplier
export const BALL_INITIAL_SPEED = 200;

// Rods
export const ROD_SLIDE_RANGE = 80; // max pixels a rod can slide left/right from center
export const ROD_SLIDE_SPEED = 400; // pixels per second
export const SHOOT_IMPULSE = 400; // velocity added to ball when touching a player
export const PLAYER_WIDTH = 10;
export const PLAYER_HEIGHT = 30;

// Rod layout: x position (from left), player count, side
// Left side = host, Right side = guest
import type { RodGroup } from '../types';

export interface RodConfig {
  x: number;
  playerCount: number;
  side: 'host' | 'guest';
  group: RodGroup;
}

// Rod order left to right (blue=guest defends left, red=host defends right):
// blue_GK, blue_DEF, red_ATK, blue_MID, red_MID, blue_ATK, red_DEF, red_GK
export const ROD_CONFIGS: RodConfig[] = [
  { x: 55,  playerCount: 1, side: 'guest', group: 'defense' },  // Blue Goalkeeper
  { x: 150, playerCount: 2, side: 'guest', group: 'defense' },  // Blue Defense
  { x: 250, playerCount: 3, side: 'host',  group: 'attack' },   // Red Attack
  { x: 350, playerCount: 5, side: 'guest', group: 'attack' },   // Blue Midfield
  { x: 450, playerCount: 5, side: 'host',  group: 'attack' },   // Red Midfield
  { x: 550, playerCount: 3, side: 'guest', group: 'attack' },   // Blue Attack
  { x: 650, playerCount: 2, side: 'host',  group: 'defense' },  // Red Defense
  { x: 745, playerCount: 1, side: 'host',  group: 'defense' },  // Red Goalkeeper
];

// Scoring
export const WIN_SCORE = 10;
export const GOAL_PAUSE_DURATION = 2; // seconds to pause after a goal

// Network
export const STATE_SEND_RATE = 30; // Hz
