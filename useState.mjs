import {render} from './render.mjs';

// Run function in a new microtask (for async evaluation of a hook)
const defer = (fun) => Promise.resolve().then(fun);

// The useState hook
export function useState(context, initialValue) {
  if (context.currentInstance === null) {
    // React error in case hook is called without instance context
    // (e.g. inside an onClick handler)
    throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component.');
  }

  if (
    context.currentInstance.hookCount !== undefined &&
    context.currentHookIndex >= context.currentInstance.hookCount
  ) {
    // React error when there are more hooks called than at the last render
    // (e.g. in case hook is called inside a conditional or a for-cycle)
    throw new Error('Rendered more hooks than during the previous render.');
  }

  // Process the next hook in the current instance.
  // The instance and currentHook are captured by the closure of setState().
  const instance = context.currentInstance;
  let currentHook = instance.hooks[context.currentHookIndex];

  if (currentHook === undefined) {
    // If the hook was not processed in previous renders (i.e. it is the first render
    // of the instance), create its initial value and setter.
    const setState = (newValue) =>
      defer(() => {
        const newEvaluated = typeof newValue === 'function' ? newValue(currentHook[0]) : newValue;

        if (!Object.is(currentHook[0], newEvaluated)) {
          // If value changed, update it and rerender instance
          currentHook[0] = newEvaluated;
          render(context, instance);
        }
      });

    const initialEvaluated = typeof initialValue === 'function' ? initialValue() : initialValue;

    currentHook = [initialEvaluated, setState];
    instance.hooks[context.currentHookIndex] = currentHook;
  }
  context.currentHookIndex++;
  return currentHook;
}
