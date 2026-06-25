declare module 'laravel-echo' {
  export default class Echo {
    constructor(options: Record<string, unknown>);
    private(channel: string): {
      listen(event: string, callback: (event: any) => void): unknown;
    };
    leave(channel: string): void;
    disconnect(): void;
  }
}

declare module 'pusher-js' {
  export default class Pusher {
    constructor(key: string, options: Record<string, unknown>);
  }
}
