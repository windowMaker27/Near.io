'use strict';

// DOMException
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
      this.code = 0;
    }
  };
}

// AbortSignal.timeout
if (typeof global.AbortSignal !== 'undefined' && typeof global.AbortSignal.timeout !== 'function') {
  global.AbortSignal.timeout = function timeout(ms) {
    const controller = new global.AbortController();
    const id = setTimeout(function () {
      controller.abort(
        new global.DOMException('The operation timed out', 'TimeoutError')
      );
    }, ms);
    const signal = controller.signal;
    signal.addEventListener('abort', function () { clearTimeout(id); }, { once: true });
    return signal;
  };
}

// Event read-only guard
if (typeof global.Event !== 'undefined') {
  const _def = Object.defineProperty;
  Object.defineProperty = function (obj, prop, descriptor) {
    if (
      obj === global.Event &&
      (prop === 'NONE' || prop === 'CAPTURING_PHASE' ||
       prop === 'AT_TARGET' || prop === 'BUBBLING_PHASE')
    ) {
      return obj;
    }
    return _def(obj, prop, descriptor);
  };
}
