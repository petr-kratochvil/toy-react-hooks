// Instances
export function createInstance(Component, props = {}) {
  return { Component, props, hooks: [], hookCount: undefined };
}

let currentInstance = null;
let currentHookIndex = 0;

// The useState hook
export function useState(initialValue) {
  if (currentInstance === null) {
    // React error in case hook is called without instance context
    // (e.g. inside an onClick handler)
    throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component.');
  }
  
  if (currentInstance.hookCount !== undefined && currentHookIndex >= currentInstance.hookCount) {
    // React error when there are more hooks called than at the last render
    // (e.g. in case hook is called inside a conditional or a for-cycle)
    throw new Error('Rendered more hooks than during the previous render.');
  }

  const instance = currentInstance;
  let currentHook = instance.hooks[currentHookIndex];

  // First time to see this hook - create it
  if (currentHook === undefined) {

    const setState = (newValue) => {
      currentHook[0] = typeof newValue === 'function' ?
        newValue(currentHook[0]) : newValue;
      render(instance);
    };

    currentHook = [
      typeof initialValue === 'function' ? initialValue() : initialValue,
      setState
    ];
    instance.hooks[currentHookIndex] = currentHook;
  }
  currentHookIndex++;
  return currentHook;
}

// Rendering
export function render(instance, props = {}) {
  // save context
  const prevInstance = currentInstance;
  const prevIndex = currentHookIndex;

  // update props
  instance.props = {...instance.props, ...props};
  
  try {
    // render
    currentInstance = instance;
    currentHookIndex = 0;
    const output = instance.Component(instance.props);
    
    if (instance.hookCount !== undefined && currentHookIndex < instance.hookCount) {
      // React error when there are less hooks called than at the last render
      // (e.g. in case hook is called inside a conditional or a for-cycle)
      throw new Error('Rendered fewer hooks than expected. This may be caused by an accidental early return statement.');
    }
    instance.hookCount = currentHookIndex;
    console.log(`render <${instance.Component.name}>: ${output}`);
    return output;
  } finally {
    // restore context
    currentInstance = prevInstance;
    currentHookIndex = prevIndex;
  }
}
