import type {
  ClientMessage,
  ServerMessage,
} from '../../shared/protocol';

interface ClientHandlers {
  onOpen?: () => void;
  onMessage?: (message: ServerMessage) => void;
  onError?: (message: string) => void;
  onClose?: () => void;
}

export class LanClient {
  private socket: WebSocket | null = null;

  constructor(
    private readonly url: string,
    private readonly handlers: ClientHandlers,
  ) {}

  connect(): void {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      this.handlers.onOpen?.();
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data)) as ServerMessage;
        this.handlers.onMessage?.(message);
      } catch {
        this.handlers.onError?.('The server sent an invalid response.');
      }
    });

    this.socket.addEventListener('close', () => {
      this.handlers.onClose?.();
    });

    this.socket.addEventListener('error', () => {
      this.handlers.onError?.(`Unable to connect to ${this.url}.`);
    });
  }

  send(message: ClientMessage): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      this.handlers.onError?.('The LAN connection is not ready yet.');
      return;
    }

    this.socket.send(JSON.stringify(message));
  }

  close(): void {
    this.socket?.close();
    this.socket = null;
  }
}
