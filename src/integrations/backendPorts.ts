import type { QuizRepository } from '../types/quiz'
// No endpoint paths are assumed here. Register implementations when backend contracts are agreed.
export interface BackendPorts {
 quiz: QuizRepository
 deleteCurrentAccount: () => Promise<{ deleted: true }>
}
let ports: Partial<BackendPorts> = {}
export function configureBackendPorts(next: Partial<BackendPorts>) { ports = { ...ports, ...next } }
export function backendPort<K extends keyof BackendPorts>(key: K): BackendPorts[K] {
 const port = ports[key]
 if (!port) throw new Error(key === 'quiz' ? '퀴즈 서버 연결을 준비 중이에요.' : '회원 탈퇴 서버 연결을 준비 중이에요. 계정은 삭제되지 않았어요.')
 return port
}
