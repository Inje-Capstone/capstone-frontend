import { aiGameService } from './aiGameService'
import type { GameService } from './gameServiceContract'

let selectedService: Promise<GameService> | undefined
function getService(): Promise<GameService> {
 if (!selectedService) {
  // Keep the compile-time flag inline so Vite excludes demo modules from real builds.
  const loading = import.meta.env.VITE_AI_DEMO_MODE === 'true'
   ? import('../demo/gameService').then(module => module.demoGameService)
   : Promise.resolve(aiGameService)
  selectedService = loading
  // A failed lazy load may be retried; real API failures never select demo data.
  void loading.catch(() => { if (selectedService === loading) selectedService = undefined })
 }
 return selectedService
}

// Pages depend on this stable interface, not on a particular data source.
export const listGames: GameService['listGames'] = async (...args) => (await getService()).listGames(...args)
export const listTerms: GameService['listTerms'] = async (...args) => (await getService()).listTerms(...args)
export const getTerm: GameService['getTerm'] = async (...args) => (await getService()).getTerm(...args)
export const cards: GameService['cards'] = async (...args) => (await getService()).cards(...args)
export const simplify: GameService['simplify'] = async (...args) => (await getService()).simplify(...args)
export const state: GameService['state'] = async (...args) => (await getService()).state(...args)
export const moment: GameService['moment'] = async (...args) => (await getService()).moment(...args)
export const matchup: GameService['matchup'] = async (...args) => (await getService()).matchup(...args)
export const chat: GameService['chat'] = async (...args) => (await getService()).chat(...args)
