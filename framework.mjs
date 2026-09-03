import {useState as useStateWithContext} from './useState.mjs';
import {render as renderWithContext} from './render.mjs';

// Component instance
export function createInstance(Component, props = {}) {
  return {Component, props, hooks: [], hookCount: undefined};
}

// A renderer owns the global context
// - the instance that is currently rendering
// - the number of hooks processed so far in the current instance
export function createRenderer() {
  const context = {
    currentInstance: null,
    currentHookIndex: 0,
  };

  return {
    useState: (initialValue) => useStateWithContext(context, initialValue),
    render: (instance, props = {}) => renderWithContext(context, instance, props),
  };
}

// The default renderer
export const {useState, render} = createRenderer();
