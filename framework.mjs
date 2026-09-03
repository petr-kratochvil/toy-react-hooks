import {render as renderWithContext} from './render.mjs';
import {useState as useStateWithContext} from './useState.mjs';
import {useEffect as useEffectWithContext, cancelEffects} from './useEffect.mjs';

// Create component instance - use initial values
export function createInstance(Component, props = {}) {
  return {Component, props, hooks: [], hookCount: undefined};
}

// Unmount instance
// - drop the effects still queued for it, then call the stored effect cleanups
function unmountInstanceWithContext(context, instance) {
  cancelEffects(context, instance);
  instance.hooks.forEach((hook) => {
    if (hook && typeof hook.cleanup === 'function') hook.cleanup();
  });
  instance.hooks = [];
  instance.hookCount = undefined;
}

// A renderer owns the global context
// - the instance that is currently rendering
// - the number of hooks processed so far in the current instance
// - the effects queued by the current render
export function createRenderer() {
  const context = {
    currentInstance: null,
    currentHookIndex: 0,
    pendingEffects: [],
  };

  return {
    render: (instance, props = {}) => renderWithContext(context, instance, props),
    useState: (initialValue) => useStateWithContext(context, initialValue),
    useEffect: (callback, deps) => useEffectWithContext(context, callback, deps),
    unmountInstance: (instance) => unmountInstanceWithContext(context, instance),
  };
}

// The default renderer
export const {render, useState, useEffect, unmountInstance} = createRenderer();
