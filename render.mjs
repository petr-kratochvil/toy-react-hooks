// The render function
export function render(context, instance, props = {}) {
  // save context
  const prevInstance = context.currentInstance;
  const prevIndex = context.currentHookIndex;

  // update props
  instance.props = {...instance.props, ...props};

  try {
    // render
    context.currentInstance = instance;
    context.currentHookIndex = 0;
    const output = instance.Component(instance.props);

    if (instance.hookCount !== undefined && context.currentHookIndex < instance.hookCount) {
      // React error when there are less hooks called than at the last render
      // (e.g. in case hook is called inside a conditional or a for-cycle)
      throw new Error(
        'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.',
      );
    }
    instance.hookCount = context.currentHookIndex;
    console.log(`render <${instance.Component.name}>: ${output}`);
    return output;
  } finally {
    // restore context
    context.currentInstance = prevInstance;
    context.currentHookIndex = prevIndex;
  }
}
