import { isDemoSession } from '../demo/demoAccount'

export function isAiDemoMode(): boolean {
    return isDemoSession() || import.meta.env.VITE_AI_DEMO_MODE === 'true'
}