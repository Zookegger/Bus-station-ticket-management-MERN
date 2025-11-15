export interface WebsocketOptions {    
    events: Object;
    namespace: string;
    auto_connect: boolean;
    debug: boolean;
    max_reconnect_attempts: number;
    reconnect_delay: number;
}