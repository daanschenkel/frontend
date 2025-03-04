
const OpCodes = {
    Hello: 0, // Worker > Client
    Hey: 1, // Client > Worker
    Heartbeat: 2, // Worker > Client
    Heartbeated: 3, // Client > Worker
};

/**
 * @type {{ miniSession: string, interval: NodeJS.Timeout, lastHeartbeat: number, lastHeartbeated: number }[]}
 */
let intervals = [];

onmessage = (event) => {
    /**
     * @type {[keyof typeof OpCodes, number]}
    */
    const [eventName] = Object.entries(OpCodes).find(([_, value]) => value === event.data.op);

    const { interval, session } = event.data.data;

    switch (eventName) {
        case 'Hey': {
            postMessage({ op: OpCodes.Hello });

            intervals.push({
                miniSession: session,
                interval: setInterval(() => {
                    const intervalOfSession = intervals.find((x) => x.miniSession === session);

                    if (!intervalOfSession) {
                        clearInterval(intervalOfSession.interval);
                        return;
                    }

                    if (intervalOfSession.lastHeartbeated - intervalOfSession.lastHeartbeat > 10000) {
                        clearInterval(intervalOfSession.interval);
                        return;
                    }

                    postMessage({ op: OpCodes.Heartbeat });

                    intervalOfSession.lastHeartbeat = Date.now();
                }, interval),
            });

            break;

        }
        case 'Heartbeated': {
            const intervalOfSession = intervals.find((x) => x.miniSession === session);

            if (!intervalOfSession) {
                clearInterval(intervalOfSession.interval);
                return;
            }

            intervalOfSession.lastHeartbeated = Date.now();

            break;
        }

        default: {
            console.warn(`Unknown event name: ${eventName}`);

            break;
        }
    }
};