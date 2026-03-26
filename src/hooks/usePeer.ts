import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { Message, Role } from '../types';

interface UsePeerReturn {
  peerId: string | null;
  connected: boolean;
  role: Role | null;
  error: string | null;
  createGame: () => void;
  joinGame: (hostId: string) => void;
  send: (msg: Message) => void;
  onMessage: (handler: (msg: Message) => void) => void;
  disconnect: () => void;
}

export function usePeer(): UsePeerReturn {
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const messageHandlerRef = useRef<((msg: Message) => void) | null>(null);

  const [peerId, setPeerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setupConnection = useCallback((conn: DataConnection) => {
    connRef.current = conn;

    conn.on('open', () => {
      setConnected(true);
    });

    conn.on('data', (data) => {
      if (messageHandlerRef.current) {
        messageHandlerRef.current(data as Message);
      }
    });

    conn.on('close', () => {
      setConnected(false);
      setError('Connection closed');
    });

    conn.on('error', (err) => {
      setError(`Connection error: ${err.message}`);
    });
  }, []);

  const createGame = useCallback(() => {
    const peer = new Peer();
    peerRef.current = peer;
    setRole('host');
    setError(null);

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      setError(`Peer error: ${err.message}`);
    });
  }, [setupConnection]);

  const joinGame = useCallback((hostId: string) => {
    const peer = new Peer();
    peerRef.current = peer;
    setRole('guest');
    setError(null);

    peer.on('open', (id) => {
      setPeerId(id);
      const conn = peer.connect(hostId, { reliable: true });
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      setError(`Peer error: ${err.message}`);
    });
  }, [setupConnection]);

  const send = useCallback((msg: Message) => {
    if (connRef.current?.open) {
      connRef.current.send(msg);
    }
  }, []);

  const onMessage = useCallback((handler: (msg: Message) => void) => {
    messageHandlerRef.current = handler;
  }, []);

  const disconnect = useCallback(() => {
    connRef.current?.close();
    peerRef.current?.destroy();
    connRef.current = null;
    peerRef.current = null;
    setPeerId(null);
    setConnected(false);
    setRole(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      connRef.current?.close();
      peerRef.current?.destroy();
    };
  }, []);

  return { peerId, connected, role, error, createGame, joinGame, send, onMessage, disconnect };
}
