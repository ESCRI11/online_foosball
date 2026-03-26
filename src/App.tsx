import { useState, useCallback, useRef } from 'react';
import type { Screen, GameState } from './types';
import { usePeer } from './hooks/usePeer';
import { LandingScreen } from './screens/LandingScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import './App.css';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [isLocal, setIsLocal] = useState(false);
  const [finalState, setFinalState] = useState<GameState | null>(null);
  const peer = usePeer();
  const hasStartedRef = useRef(false);

  // Check URL for join param
  const urlParams = new URLSearchParams(window.location.search);
  const joinId = urlParams.get('join') || undefined;

  const handleCreateGame = useCallback(() => {
    peer.createGame();
    setIsLocal(false);
    setScreen('lobby');
  }, [peer]);

  const handleJoinGame = useCallback((hostId: string) => {
    peer.joinGame(hostId);
    setIsLocal(false);
    setScreen('lobby');
  }, [peer]);

  const handleLocalPlay = useCallback(() => {
    setIsLocal(true);
    setScreen('game');
  }, []);

  const handleCancel = useCallback(() => {
    peer.disconnect();
    setScreen('landing');
  }, [peer]);

  const handleGameOver = useCallback((state: GameState) => {
    setFinalState(state);
    setScreen('gameover');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setFinalState(null);
    setScreen('game');
  }, []);

  const handleNewGame = useCallback(() => {
    peer.disconnect();
    setFinalState(null);
    setScreen('landing');
    window.history.replaceState({}, '', window.location.pathname);
  }, [peer]);

  // Auto-transition from lobby to game when connected
  if (screen === 'lobby' && peer.connected && !hasStartedRef.current) {
    hasStartedRef.current = true;
    setTimeout(() => setScreen('game'), 1000);
  }
  if (screen === 'landing') {
    hasStartedRef.current = false;
  }

  const noopSend = useCallback(() => {}, []);
  const noopOnMessage = useCallback(() => {}, []);

  return (
    <div className="app">
      {screen === 'landing' && (
        <>
          <LandingScreen
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            initialJoinId={joinId}
          />
          <button className="btn local-play" onClick={handleLocalPlay}>
            Local Play (Solo)
          </button>
        </>
      )}

      {screen === 'lobby' && (
        <LobbyScreen
          peerId={peer.peerId}
          connected={peer.connected}
          role={peer.role!}
          error={peer.error}
          onCancel={handleCancel}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          role={isLocal ? 'host' : peer.role!}
          send={isLocal ? noopSend : peer.send}
          onMessage={isLocal ? noopOnMessage : peer.onMessage}
          onGameOver={handleGameOver}
          isLocal={isLocal}
        />
      )}

      {screen === 'gameover' && finalState && (
        <GameOverScreen
          state={finalState}
          role={isLocal ? 'host' : peer.role!}
          isLocal={isLocal}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}

export default App;
