# Toy React Hooks

Experimental model of React hooks for educational purpose.

The original goal was to model the behavior of hook counting for consistency between renders and what happens, when a hook is called from outside of a component body. The key to understanding the principles is to examine function closures - what they capture and when are the closures updated.

At first, only the `useState` hook was modeled, which was sufficient for the given goal. Later the `useEffect` hook was added, to better understand the timing of effect callback and cleanups.

## Run

Run the test using node:

```
node test.mjs
```

It goes throw the `test.mjs` module, runs the tests and writes to the console their output.

## Structure

- **framework.mjs**: simple model of React rendering loop and basic hooks:
  - `createInstance` - initializes the components instance, takes optional `props`
  - `render` - render component instance
  - `unmountInstance` - runs cleanup and marks instance as unmounted
  - `useState` hook
  - `useEffect` hook
- **test.mjs**: uses framework.mjs, showing different behavior of the `useState` and `useEffect` hooks, render loop and scenarios when React throws hook errors.

## Tested behavior

Tested scenarios when the following React hook errors are thrown:

- `Invalid hook call. Hooks can only be called inside of the body of a function component.`
- `Rendered more hooks than during the previous render.`
- `Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`

This was a warning in React prior to version 18; it is a no-op in React 18 and later, and also in this project:

- `Can't perform a React state update on an unmounted component.`

## Rendering

Render is modeled just as:
- run the component body function
- write to the console its output

