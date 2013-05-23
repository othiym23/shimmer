'use strict';

function isFunction(funktion) {
  return funktion && {}.toString.call(funktion) === '[object Function]';
}

// Default to complaining loudly when things don't go according to plan.
var logger = console.error.bind(console);

// Keep initialization idempotent.
function shimmer(options) {
  if (options && options.logger) {
    if (!isFunction(options.logger)) logger("new logger isn't a function, not replacing");
    else logger = options.logger;
  }
}

function wrap(nodule, name, wrapper) {
  if (!nodule || !nodule[name]) {
    logger("no original function to wrap");
    return;
  }

  if (!wrapper) {
    logger("no wrapper function");
    return;
  }

  if (!isFunction(nodule[name]) || !isFunction(wrapper)) {
    logger("original object and wrapper must be functions");
    return;
  }

  var original = nodule[name]
    , wrapped = wrapper(original)
    ;

  wrapped.__unwrap = function () {
    if (nodule[name] === wrapped) nodule[name] = original;
  };
  wrapped.__wrapped = true;

  nodule[name] = wrapped;

  return wrapped;
}

function unwrap(nodule, name) {
  if (!nodule || !nodule[name]) {
    logger("no function to unwrap.");
    return;
  }

  if (!nodule[name].__unwrap) {
    logger("no original to unwrap to -- has this already been unwrapped?");
  }
  else {
    return nodule[name].__unwrap();
  }
}

shimmer.wrap = wrap;
shimmer.unwrap = unwrap;

module.exports = shimmer;
