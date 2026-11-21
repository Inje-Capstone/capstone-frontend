import { aiGameService } from './aiGameService'

// Keep the page-facing API stable while the implementation stays in one adapter.
export const listGames = aiGameService.listGames
export const listTerms = aiGameService.listTerms
export const getTerm = aiGameService.getTerm
export const cards = aiGameService.cards
export const simplify = aiGameService.simplify
export const state = aiGameService.state
export const moment = aiGameService.moment
export const matchup = aiGameService.matchup
export const chat = aiGameService.chat
