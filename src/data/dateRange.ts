import { seoulDay } from './choices'
import type { DateRange } from '../types/quiz'
export function addDays(day:string, count:number) { const date=new Date(day+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+count);return date.toISOString().slice(0,10) }
export function rangeDays(range:DateRange) { return Math.round((Date.parse(range.end+'T00:00:00Z')-Date.parse(range.start+'T00:00:00Z'))/86400000)+1 }
export function recentWeek():DateRange { const end=seoulDay();return {start:addDays(end,-6),end} }
