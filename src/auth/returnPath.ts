export function returnPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) return '/'
  const from = state.from
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')
    || from.includes('\\') || /^\/(login|onboarding)(\/|\?|#|$)/.test(from)) return '/'
  return from
}

