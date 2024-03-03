// Uses IIFE (Immediately Invoked Function Expression) and Factory pattern to guarantee to get the same instance

export let ListenerHandlerSingleton = (() => {

    let instance;

    class ListenerHandler {

        constructor() {
            this._eventHandlers = {};
        }

        addListener(node, event, handler, capture = false) {
            if (!(event in this._eventHandlers)) {
                this._eventHandlers[event] = [];
            }
            // Here we track the events and their nodes (note that we cannot
            // Use node as Object keys, as they'd get coerced into a string
            this._eventHandlers[event].push({ node: node, handler: handler, capture: capture })
            node.addEventListener(event, handler, capture)
        }

        removeAllListeners (targetNode, event) {
            if (this._eventHandlers[event]) {
                // Remove listeners from the matching nodes
                const filteredEvent = this._eventHandlers[event].filter(({ node }) => node === targetNode);
                for (const { node, handler, capture } of filteredEvent) {
                    node.removeEventListener(event, handler, capture);
                }

                // Update _eventHandlers global
                this._eventHandlers[event] = this._eventHandlers[event].filter(
                    ({ node }) => node !== targetNode,
                );
            }
        }
    }

    return {
        getInstance: () => {
          if (!instance) {
            instance = new ListenerHandler();
          }
          return instance;
        },
    };

})();