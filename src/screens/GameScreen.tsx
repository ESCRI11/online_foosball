import { useRef, useEffect, useCallback, useState } from 'react';
import type { GameState, PlayerInput, Message, Role } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { render } from '../game/renderer';
import { stepPhysics, createInitialState } from '../game/physics';
import { getInput, initInput, EMPTY_INPUT, consumePauseToggle } from '../game/input';
import { STATE_SEND_RATE } from '../game/constants';

interface Props {
  role: Role;
  send: (msg: Message) => void;
  onMessage: (handler: (msg: Message) => void) => void;
  onGameOver: (state: GameState) => void;
  isLocal: boolean; // true = local play (no networking), false = multiplayer
}

export function GameScreen({ role, send, onMessage, onGameOver, isLocal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const guestInputRef = useRef<PlayerInput>(EMPTY_INPUT);
  const lastSendTime = useRef(0);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  // Initialize input handling
  useEffect(() => {
    initInput();
  }, []);

  // Handle incoming messages (multiplayer)
  useEffect(() => {
    if (isLocal) return;

    onMessage((msg: Message) => {
      if (msg.type === 'input' && role === 'host') {
        guestInputRef.current = msg.data;
      }
      if (msg.type === 'state' && role === 'guest') {
        stateRef.current = msg.data;
      }
    });
  }, [isLocal, role, onMessage]);

  // Resize canvas to fit window
  useEffect(() => {
    const handleResize = () => {
      const maxW = window.innerWidth - 40;
      const maxH = window.innerHeight - 80;
      const aspect = 800 / 500;

      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }

      setCanvasSize({ width: Math.floor(w), height: Math.floor(h) });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prevStatusRef = useRef<string>('countdown');

  const gameLoop = useCallback((dt: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pause toggle (P key)
    if (consumePauseToggle()) {
      const s = stateRef.current;
      if (s.status === 'paused') {
        stateRef.current = { ...s, status: prevStatusRef.current as GameState['status'] };
      } else if (s.status === 'playing') {
        prevStatusRef.current = s.status;
        stateRef.current = { ...s, status: 'paused' };
      }
    }

    const localInput = getInput();

    if (isLocal) {
      stateRef.current = stepPhysics(stateRef.current, dt, localInput, localInput);
    } else if (role === 'host') {
      stateRef.current = stepPhysics(stateRef.current, dt, localInput, guestInputRef.current);

      const now = performance.now();
      if (now - lastSendTime.current > 1000 / STATE_SEND_RATE) {
        send({ type: 'state', data: stateRef.current });
        lastSendTime.current = now;
      }
    } else {
      send({ type: 'input', data: localInput });
    }

    render(ctx, stateRef.current, canvas.width, canvas.height);

    // Check game over
    if (stateRef.current.status === 'finished') {
      onGameOver(stateRef.current);
    }
  }, [isLocal, role, send, onGameOver]);

  useGameLoop(gameLoop);

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
      />
      {isLocal && (
        <p className="local-hint">Local mode: you control both sides</p>
      )}
    </div>
  );
}
