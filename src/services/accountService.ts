import { backendPort } from '../integrations/backendPorts'
export async function deleteAccount() {
 const receipt = await backendPort('deleteCurrentAccount')()
 if(receipt?.deleted !== true) throw Error('탈퇴가 확인되지 않았어요. 다시 시도해주세요.')
}
