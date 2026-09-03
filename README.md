# Toy React Hooks

Experimental model of React hooks for educational purpose.

## Run

```
node test.mjs
```

## Structure

- **framework.mjs**: simple model containing `createInstance`, `render` and `useState`
- **test.mjs**: uses framework.mjs, showing different behavior of the `useState` hook

## Tested behavior

Tested scenarios when the following React hook errors are thrown:

- `Invalid hook call. Hooks can only be called inside of the body of a function component.`
- `Rendered more hooks than during the previous render.`
- `Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`
