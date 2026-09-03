import {assertNoMissingHooks, assertNoUnmounted} from './assertHooks.mjs';
import {runEffects} from './useEffect.mjs';

// The render function
export function render(context, instance, props = {}) {
  assertNoUnmounted(instance);

  // save context
  const prevInstance = context.currentInstance;
  const prevIndex = context.currentHookIndex;
  const isTopLevel = prevInstance === null;

  // Run effects still pending from the previous render
  // (in case some were added mid-render, so their cleanup is called and not overwriten)
  if (isTopLevel) runEffects(context);

  // effects queued so far - everything pushed below belongs to this render
  const pendingEffectsStartIndex = context.pendingEffects.length;

  // update props
  instance.props = {...instance.props, ...props};

  let output;

  try {
    // rendering new instance - reset context
    context.currentInstance = instance;
    context.currentHookIndex = 0;

    // call component body
    output = instance.Component(instance.props);

    // Update hook count for the instance with assert (after calling the component body)
    assertNoMissingHooks(context);
    instance.hookCount = context.currentHookIndex;

    // "Commit to DOM"
    console.log(`render <${instance.Component.name}>: ${output}`);
  } catch (error) {
    // Clean pending effects for a failed render, prevent leaking them into the next render
    context.pendingEffects.splice(pendingEffectsStartIndex);
    throw error;
  } finally {
    // restore context
    context.currentInstance = prevInstance;
    context.currentHookIndex = prevIndex;
  }

  // Run effects only after the whole component tree is "commited to DOM"
  if (isTopLevel && context.pendingEffects.length > 0) {
    setTimeout(() => runEffects(context), 0);
  }
  return output;
}
