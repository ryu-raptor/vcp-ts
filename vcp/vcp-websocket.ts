/** 
 * Virtual Communication Protocol WebSocket Clients
*/

import { APIType, APIProcessor, RawAPI, Handshake } from "./vcp-api";

/**
 * Reference https://typescript-jp.gitbook.io/deep-dive/type-system/generics
 * @classdec Handmade Queue implementation
 */
class Queue<T> {
    private data: T[] = [];
    push(item:T) { this.data.push(item); }
    pop(): T | undefined { return this.data.shift(); }
    get count(): number {
        return this.data.length;
    }
}

/**
 * @classdesc Data sink client
 * Attach APISink to this to process arrival messages.
 */
export class SinkClient
{
    protected socket: WebSocket | null = null;
    protected processors: {[key:string] : APIProcessor[];};
    protected opened: boolean = false;
    debugMode: boolean = false;
    
    private pqueue: Queue<()=>void>
    /**
     * @property
     * Set true to queue processing messages and process them at once.
     * Otherwise, APIProcessor is called on message arrival.
     */
    syncProcessMode: boolean = false;

    /**
     * Create new instance and immediately connect to a server.
     * @param url An URL to connect to
     */
    constructor(url:string)
    {
        this.open(url);
        this.processors = {};
        this.pqueue = new Queue<()=>void>();
    }

    /**
     * @deprecated
     * Manually request a server to send data.
     * Latest VCP specification does not support this protocol.
     */
    manualRequest()
    {
        if (this.opened) {
            this.socket?.send('request');
        }
    }

    /**
     * @protected
     * connect to a server.
     * @param url An URL to connect to
     */
    protected open(url:string)
    {
        this.socket = new WebSocket(url);
        this.socket.addEventListener("message", (ev) => this.onMessage(ev));
        this.socket.addEventListener("open", (ev) => {
            this.socket?.send(JSON.stringify(new Handshake("sink")));
            this.opened = true
        });
        this.socket.addEventListener("error", (ev) => {
            setTimeout(() => {
                this.retry(url);
            }, 5000);
        });
        this.socket.addEventListener("close", (e) => {
            setTimeout(() => {
                this.retry(url);
            }, 5000);
        });
    }

    /**
     * @protected
     * Retry server connection.
     * @param url An URL to connect to
     */
    protected retry(url:string)
    {
        this.opened = false;
        this.socket?.close();
        this.open(url);
    }

    /**
     * @private
     * (recursively called from @see addProcessor)
     * Attach APIProcessor to process arrival messages.
     * @param api APIType to process
     * @param processor A APIProcessor instance to process messages
     */
    private addProcessor_recursive(api:APIType, processor:APIProcessor)
    {
        if (!(api in this.processors)) {
            this.processors[api] = [];
        }
        this.processors[api].push(processor);
    }

    /**
     * Attach APIProcessor to process arrival messages.
     * @param processor A APIProcessor instance to process messages
     */
    addProcessor(processor:APIProcessor)
    {
        console.log(this.processors);
        for (let api of processor.getSupportedAPI())
        {
            this.addProcessor_recursive(api, processor);
        }
    }

    /**
     * @protected
     * WebSocket "message" event handler.
     * Analyze message then pass to API processors.
     * @param e WebSocket message event
     */
    protected onMessage(e:MessageEvent)
    {
        try {
            if (this.debugMode) {
                console.log(e.data);
            }

            let raw = JSON.parse(e.data) as RawAPI;
            if (raw.type in this.processors) {
                let ps = this.processors[raw.type];
                for (let p of ps) {
                    if (this.syncProcessMode) {
                        this.pqueue.push(()=>p.process(raw));
                    }
                    else {
                        p.process(raw);
                    }
                }
            }
        }
        catch {

        }
    }

    /**
     * Process syncronized message queues.
     * This method has effects if syncProcessMode is true.
     * @see {syncProcessMode}
     */
    processQueue()
    {
        while (this.pqueue.count != 0)
        {
            let p = this.pqueue.pop();
            if (p) {
                p();
            }
        }
    }
}
