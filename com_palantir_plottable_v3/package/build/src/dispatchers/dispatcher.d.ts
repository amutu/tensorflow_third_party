export declare class Dispatcher {
    protected _eventToProcessingFunction: {
        [eventName: string]: (e: Event) => any;
    };
    private _eventNameToCallbackSet;
    private _connected;
    private _hasNoCallbacks();
    private _connect();
    private _disconnect();
    protected _addCallbackForEvent(eventName: string, callback: Function): void;
    protected _removeCallbackForEvent(eventName: string, callback: Function): void;
    protected _callCallbacksForEvent(eventName: string, ...args: any[]): void;
}
