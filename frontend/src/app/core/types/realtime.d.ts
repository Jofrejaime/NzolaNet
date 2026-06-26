declare module 'laravel-echo' {
  interface Channel {
    listen(event: string, callback: (event: any) => void): this;
    error(callback: (error: any) => void): this;
    subscribed(callback: () => void): this;
  }

  export default class Echo {
    constructor(options: Record<string, unknown>);
    private(channel: string): Channel;
    channel(channel: string): Channel;
    leave(channel: string): void;
    disconnect(): void;
  }
}

declare module 'pusher-js' {
  export default class Pusher {
    constructor(key: string, options: Record<string, unknown>);
  }
}