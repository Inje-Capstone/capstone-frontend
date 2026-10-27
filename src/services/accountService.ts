import { isDemoSession } from '../demo/demoAccount'
import { backendPort } from '../integrations/backendPorts'
export async function deleteAccount() {
 // The demo account belongs to this browser only. Real deletion requires confirmed server success.
 const receipt = isDemoSession() ? await Promise.resolve({deleted:true}) : await backendPort('deleteCurrentAccount')()
 if(receipt?.deleted !== true) throw Error('탈퇴가 확인되지 않았어요. 다시 시도해주세요.')
}
