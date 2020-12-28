const events = {};

function on(eventName, fn) {
    events[eventName] = events[eventName] || [];
    events[eventName].push(fn);
}

function off(eventName, fn) {
    if (events[eventName]) {
        for (let i = 0; i < events[eventName].length; i++) {
            if (events[eventName][i] === fn) {
                events[eventName].splice(i,1)
                break;
            }
        }
    }
}

function emit(eventName, data) {
    if (events[eventName]) {
        events[eventName].forEach(function(fn) {
            fn(data);
        });
    }
}

export {on, off, emit};