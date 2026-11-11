import type { SupportedTeam } from '../types/backend'
import lg from '../assets/teams/lg.svg'
import doosan from '../assets/teams/doosan.svg'
import kia from '../assets/teams/kia.png'
import samsung from '../assets/teams/samsung.svg'
import lotte from '../assets/teams/lotte.png'
import ssg from '../assets/teams/ssg.svg'
import hanwha from '../assets/teams/hanwha.svg'
import nc from '../assets/teams/nc.png'
import kt from '../assets/teams/kt.svg'
import kiwoom from '../assets/teams/kiwoom.svg'

export const teamEmblems: Partial<Record<SupportedTeam, string>> = {
  LG: lg, DOOSAN: doosan, KIA: kia, SAMSUNG: samsung, LOTTE: lotte,
  SSG: ssg, HANWHA: hanwha, NC: nc, KT: kt, KIWOOM: kiwoom,
}
