// AI fallback is an explicit deployment choice, independent of authentication.
export function isAiDemoMode(): boolean {
 return import.meta.env.VITE_AI_DEMO_MODE === 'true'
}
