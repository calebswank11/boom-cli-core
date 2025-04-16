type Hook = (ctx: any) => Promise<void>;

const beforeHooks: Record<string, Hook[]> = {};
const afterHooks: Record<string, Hook[]> = {};

export function onBeforeStep(step: string, fn: Hook) {
  beforeHooks[step] = beforeHooks[step] || [];
  beforeHooks[step].push(fn);
}

export function onAfterStep(step: string, fn: Hook) {
  afterHooks[step] = afterHooks[step] || [];
  afterHooks[step].push(fn);
}

export async function runWithHooks(
  stepName: string,
  fn: Hook,
  ctx: any
) {
  for (const hook of beforeHooks[stepName] || []) {
    await hook(ctx);
  }

  await fn(ctx);

  for (const hook of afterHooks[stepName] || []) {
    await hook(ctx);
  }
}
