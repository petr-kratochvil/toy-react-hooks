export function assertHookInRender(context) {
  if (context.currentInstance === null) {
    // React error in case hook is called without instance context
    // (e.g. inside an onClick handler)
    throw new Error(
      'Invalid hook call. Hooks can only be called inside of the body of a function component.',
    );
  }
}

export function assertNoAddedHooks(context) {
  if (
    context.currentInstance.hookCount !== undefined &&
    context.currentHookIndex >= context.currentInstance.hookCount
  ) {
    // React error when there are more hooks called than at the last render
    // (e.g. in case hook is called inside a conditional or a for-cycle)
    throw new Error('Rendered more hooks than during the previous render.');
  }
}

export function assertNoMissingHooks(context) {
  if (
    context.currentInstance.hookCount !== undefined &&
    context.currentHookIndex < context.currentInstance.hookCount
  ) {
    // React error when there are less hooks called than at the last render
    // (e.g. in case hook is called inside a conditional or a for-cycle)
    throw new Error(
      'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.',
    );
  }
}
