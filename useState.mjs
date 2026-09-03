import {render} from './render.mjs';
import {assertHookInRender, assertNoAddedHooks} from './assertHooks.mjs';

// Saved hook structure in instance.hooks:
// [currentValue, setFunction]

// Run function in a new microtask (for async evaluation of a hook)
const defer = (fun) => Promise.resolve().then(fun);

// The setState function
const applyStateUpdate = (context, instance, currentHook, newValue) =>
  defer(() => {
    const newEvaluated = typeof newValue === 'function' ? newValue(currentHook[0]) : newValue;

    if (!Object.is(currentHook[0], newEvaluated)) {
      // If value changed, update it and rerender instance
      currentHook[0] = newEvaluated;
      render(context, instance);
    }
  });

// The useState hook
export function useState(context, initialValue) {
  assertHookInRender(context);
  assertNoAddedHooks(context);

  // Process the next hook in the current instance.
  // The instance and currentHook are captured by the closure of setState().
  const instance = context.currentInstance;
  let currentHook = instance.hooks[context.currentHookIndex];

  if (currentHook === undefined) {
    // If the hook was not processed in previous renders (i.e. it is the first render
    // of the instance), create its initial value and setter.
    const initialEvaluated = typeof initialValue === 'function' ? initialValue() : initialValue;
    const setState = (newValue) => applyStateUpdate(context, instance, currentHook, newValue);
    currentHook = [initialEvaluated, setState];
    instance.hooks[context.currentHookIndex] = currentHook;
  }
  context.currentHookIndex++;
  return currentHook;
}
