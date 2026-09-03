import {assertHookInRender, assertNoAddedHooks} from './assertHooks.mjs';

// Saved hook structure in instance.hooks:
// {deps, cleanup}

// pendingEffects structure:
// {type, instance, run}

// Discard the effects still queued for an instance (used on unmount)
export function cancelEffects(context, instance) {
  context.pendingEffects = context.pendingEffects.filter((effect) => effect.instance !== instance);
}

// Check if dependencies changed
function depsChanged(prev, next) {
  if (next === undefined) return true; // every render
  if (prev === undefined) return true; // first render
  if (prev.length !== next.length) return true;
  return next.some((nextDep, index) => !Object.is(nextDep, prev[index]));
}

// The useEffect hook
export function useEffect(context, callback, deps) {
  assertHookInRender(context);
  assertNoAddedHooks(context);
  const instance = context.currentInstance;
  const hookIndex = context.currentHookIndex;

  // take out the current effect hook, instantiate if needed
  let currentHook = instance.hooks[hookIndex];
  if (currentHook === undefined) {
    currentHook = {deps: undefined, cleanup: undefined};
    instance.hooks[hookIndex] = currentHook;
  }

  // check and update dependencies
  const changed = depsChanged(currentHook.deps, deps);
  currentHook.deps = deps;

  if (changed) {
    if (typeof currentHook.cleanup === 'function') {
      context.pendingEffects.push({type: 'cleanup', instance, run: currentHook.cleanup});
      currentHook.cleanup = undefined;
    }
    context.pendingEffects.push({
      type: 'callback',
      instance,
      run: () => {
        currentHook.cleanup = callback();
      },
    });
  }

  context.currentHookIndex++;
}

// Run the effects queued by the last render
export function runEffects(context) {
  const queue = context.pendingEffects;
  context.pendingEffects = [];

  const runAll = (type) =>
    queue
      .filter((effect) => effect.type === type)
      .forEach((effect) => {
        try {
          effect.run();
        } catch (error) {
          // An error in effect does not prevent other effects in running
          console.error(`Uncaught error in effect ${type}: ${error.message}`);
        }
      });

  runAll('cleanup');
  runAll('callback');
}
