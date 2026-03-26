import type { PlayerInput } from '../types';

const keys = new Set<string>();

const PREVENT_DEFAULT = new Set([
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ',
]);

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase());
    if (PREVENT_DEFAULT.has(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
  });

  window.addEventListener('blur', () => {
    keys.clear();
  });
}

// W/S (or ArrowUp/Down) = GK + Defense rods
// A/D (or ArrowLeft/Right) = Midfield + Attack rods
export function getInput(): PlayerInput {
  return {
    defUp:   keys.has('w') || keys.has('arrowup'),
    defDown: keys.has('s') || keys.has('arrowdown'),
    atkUp:   keys.has('a') || keys.has('arrowleft'),
    atkDown: keys.has('d') || keys.has('arrowright'),
  };
}

export const EMPTY_INPUT: PlayerInput = {
  defUp: false, defDown: false, atkUp: false, atkDown: false,
};
