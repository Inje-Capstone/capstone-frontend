import { useState } from 'react'
import { useProgress } from '../state/ProgressContext'
import { teams } from '../data/choices'
import Character from '../components/Character'
const types=[['전체','all'],['유니폼','jersey'],['배트','bat'],['야구공','ball']]
export default function ShopPage() {
 const {progress}=useProgress()
 const [team,setTeam]=useState('LG'),[type,setType]=useState('all'),[preview,setPreview]=useState('LG-away')
 const products=[
  {id:team+'-home',name:team+' 홈 유니폼',kind:'jersey'},
  {id:team+'-away',name:team+' 원정 유니폼',kind:'jersey'},
  {id:team+'-bat',name:team+' 배트',kind:'bat'},
  {id:team+'-ball',name:team+' 야구공',kind:'ball'},
 ]
 const selected=products.find(p=>p.id===preview)||products[0]
 return <main className="page shop-layout"><aside>
  <div className="shop-preview"><Character jersey={selected.kind==='jersey'?selected.id:progress.equipped.jersey} bat={selected.kind==='bat'||Boolean(progress.equipped.bat)} ball={selected.kind==='ball'||Boolean(progress.equipped.ball)}/></div>
  <p className="preview-label">미리보기 · {selected.name}</p>
  <div className="balance between"><span>보유 포인트</span><strong>{progress.pointsBalanceConfirmed?progress.points.toLocaleString()+'P':'확인 준비 중'}</strong></div>
  <button className="full-width" disabled>상점 준비 중</button>
 </aside><section><div className="chips">{teams.filter(t=>t.code!=='NONE').map(t=><button key={t.code} className={'chip '+(team===t.code?'active':'')} aria-pressed={team===t.code} onClick={()=>{setTeam(t.code);setPreview(t.code+'-away')}}>{t.short}</button>)}</div>
  <div className="chips">{types.map(([label,value])=><button key={value} className={'chip '+(type===value?'active':'')} aria-pressed={type===value} onClick={()=>setType(value)}>{label}</button>)}</div>
  <div className="products">{products.filter(p=>type==='all'||p.kind===type).map(product=>{
   return <article className="product" key={product.id}><button className="product-picture" aria-label={product.name+' 미리보기'} onClick={()=>setPreview(product.id)}><span className={'product-icon '+product.kind+(product.id.endsWith('away')?' away':'')}>{product.kind==='jersey'?'7':''}</span></button>
    <h2>{product.name}</h2><p className="muted small">가격 준비 중</p>
    <button className="full-width small-button secondary-button" disabled>구매 준비 중</button></article>
  })}</div>
  <p className="page-note">실제 상품과 포인트 정책은 서버 연결 후 제공됩니다.</p>
 </section>
 </main>
}

