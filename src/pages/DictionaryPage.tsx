import { useCallback,useState } from 'react'
import { Link,useLocation,useSearchParams } from 'react-router-dom'
import { useResource } from '../hooks/useResource'
import { listTerms,getTerm } from '../services/gameService'
import ResourceState from '../components/ResourceState'
import RewardStrip from '../components/RewardStrip'
export default function DictionaryPage() {
 const location=useLocation(),[params,setParams]=useSearchParams()
 const [query,setQuery]=useState(''),[category,setCategory]=useState('전체'),[ascending,setAscending]=useState(true)
 const terms=useResource(useCallback((signal:AbortSignal)=>listTerms(signal),[]))
 const selected=params.get('term')||terms.data?.[0]?.id||''
 const detail=useResource(useCallback((signal:AbortSignal)=>selected?getTerm(selected,'BEGINNER',signal):Promise.resolve(null),[selected]))
 const filters=['전체','기본 룰','구종 · 투구','전술 · 기록','응원 문화']
 const filtered=terms.data?.filter(t=>(category==='전체'||t.category_label===category)&&[t.name,...t.aliases].some(n=>n.toLowerCase().includes(query.trim().toLowerCase()))).sort((a,b)=>(ascending?1:-1)*a.name.localeCompare(b.name,'ko'))
 const fromWatch=typeof location.state?.watch==='string'?location.state.watch:null
 return <>
  <main className="page dictionary-layout"><section aria-label="용어 목록">
   <label className="search-box"><span className="sr-only">용어 검색</span><input type="search" placeholder="용어 검색" value={query} onChange={e=>setQuery(e.target.value)}/><span aria-hidden="true">⌕</span></label>
   <div className="chips">{filters.map(c=><button key={c} className={'chip '+(category===c?'active':'')} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
   <div className="dictionary-sort"><button className="chip" aria-label={ascending?'가나다순 오름차순, 내림차순으로 변경':'가나다순 내림차순, 오름차순으로 변경'} aria-pressed={!ascending} onClick={()=>setAscending(v=>!v)}>가나다순 <span aria-hidden="true">{ascending?'↑':'↓'}</span></button></div>
   <ResourceState {...terms}/>
   <div className="term-list">{filtered?.length===0&&<div className="empty-state">검색 결과가 없어요.<button className="text-button" onClick={()=>{setQuery('');setCategory('전체')}}>검색 초기화</button></div>}
    {filtered?.map(term=><button key={term.id} className={'term-row '+(selected===term.id?'selected':'')} onClick={()=>setParams({term:term.id},{state:location.state})} aria-pressed={selected===term.id}><span><strong>{term.name}</strong><small>{term.summary}</small></span><span>›</span></button>)}</div>
  </section>
  <section className="term-detail" aria-label="용어 상세"><ResourceState {...detail}/>
   {detail.data&&<><div className="row"><h1>{detail.data.name}</h1><span className="tag">{detail.data.category_label}</span></div>
    <p className="term-body">{detail.data.body}</p>
    <h2>쉬운 설명</h2><div className="example-box">{detail.data.levels['입문']||detail.data.summary}</div>
    <h2>관련 용어</h2><div className="chips">{detail.data.related.length?detail.data.related.map(t=><button className="chip" key={t.id} onClick={()=>setParams({term:t.id},{state:location.state})}>{t.name}</button>):<span className="muted">관련 용어가 없어요.</span>}</div>
    <div className="between">{fromWatch?<Link className="button secondary-button small-button" to={'/watch/'+encodeURIComponent(fromWatch)}>← 보던 경기로</Link>:<span/>}<Link className="button small-button" to="/quiz">퀴즈 풀기</Link></div>
   </>}
  </section></main><RewardStrip/>
 </>
}

