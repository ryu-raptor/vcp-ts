# VCP TypeScript Reference Implementation

A reference implementation of [Virtual Communication Protocol](https://github.com/ryu-raptor/VCP) in TypeScript.

## What is VCP?

See [my VCP repo](https://github.com/ryu-raptor/VCP).

## How to use?

The implementation is still WIP and this repository is placed for a reference usage.

If you want to use this implementation, just copy files in /vcp to your project.

### Dependencies
- THREE.js (in `vcp-extension.js`)
- JavaScript WebSocket

### Examples

1. Open connection to a server and process HeadPose API messages.

``` typescript
import { SinkClient } from 'vcp/vcp-websocket';
import { SinkClient, HeadPose } from 'vcp/vcp-api';

// Create API WebSocket client
let client = new SinkClient('ws://localhost:3000');

// Create API Processor
let headPoseSink = new SinkClient(HeadPose);

// Define custom process
headPoseSink.onMessage = (m) => {
    console.log(m.rotation);
    console.log(m.position);
}

// Attach to the client
client.addProcessor(headPoseSink);

/* 
 * That's it!
 * Check a console to see arrived head pose messages.
*/
```

## License

MIT License