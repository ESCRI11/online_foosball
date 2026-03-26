interface Props {
  peerId: string | null;
  connected: boolean;
  role: 'host' | 'guest';
  error: string | null;
  onCancel: () => void;
}

export function LobbyScreen({ peerId, connected, role, error, onCancel }: Props) {
  const shareUrl = peerId
    ? `${window.location.origin}${window.location.pathname}?join=${peerId}`
    : '';

  const copyId = () => {
    if (peerId) navigator.clipboard.writeText(peerId);
  };

  const copyLink = () => {
    if (shareUrl) navigator.clipboard.writeText(shareUrl);
  };

  if (error) {
    return (
      <div className="screen lobby">
        <h2>Connection Error</h2>
        <p className="error">{error}</p>
        <button className="btn secondary" onClick={onCancel}>Back</button>
      </div>
    );
  }

  if (role === 'guest') {
    return (
      <div className="screen lobby">
        <h2>{connected ? 'Connected!' : 'Connecting...'}</h2>
        {!connected && <div className="spinner" />}
        {connected && <p>Starting game...</p>}
        <button className="btn secondary" onClick={onCancel}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="screen lobby">
      <h2>Waiting for Opponent</h2>

      {!peerId ? (
        <div className="spinner" />
      ) : connected ? (
        <p className="connected-text">Opponent connected! Starting...</p>
      ) : (
        <>
          <p>Share this Game ID with your opponent:</p>
          <div className="peer-id-display">
            <code>{peerId}</code>
            <button className="btn small" onClick={copyId}>Copy ID</button>
          </div>
          <button className="btn small" onClick={copyLink}>Copy Link</button>
          <div className="spinner" />
          <p className="waiting">Waiting for opponent to join...</p>
        </>
      )}

      <button className="btn secondary" onClick={onCancel}>Cancel</button>
    </div>
  );
}
