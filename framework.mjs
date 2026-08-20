// Instances
export function createInstance(Component, props = {}) {
  return { Component, props, hooks: [] };
}

let currentInstance = null;
let currentHookIndex = 0;

// The useState hook
export function useState(initialValue) {
  const instance = currentInstance;
  let currentHook = instance.hooks[currentHookIndex];
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

  // render
  currentInstance = instance;
  currentHookIndex = 0;
  const output = instance.Component(instance.props);
  console.log(`render <${instance.Component.name}>: ${output}`);

  // restore context
  currentInstance = prevInstance;
  currentHookIndex = prevIndex;
  return output;
}
