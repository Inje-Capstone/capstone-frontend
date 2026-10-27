import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useProgress } from '../state/ProgressContext'
import { teams } from '../data/choices'
import Character from '../components/Character'
import Modal from '../components/Modal'
const types=[['전체','all'],['유니폼','jersey'],['배트','bat'],['야구공','ball']]
export default function ShopPage() {
 const {demo}=useAuth(),{progress,buy,equip}=useProgress()
 const [team,setTeam]=useState('LG'),[type,setType]=useState('all'),[preview,setPreview]=useState('LG-away'),[notice,setNotice]=useState('')
 const [confirm,setConfirm]=useState<{id:string;price:number;kind:string;name:string}|null>(null)
 const products=[
  {id:team+'-home',name:team+' 홈 유니폼',kind:'jersey',price:300},
  {id:team+'-away',name:team+' 원정 유니폼',kind:'jersey',price:300},
  {id:team+'-bat',name:team+' 배트',kind:'bat',price:200},
  {id:team+'-ball',name:team+' 야구공',kind:'ball',price:100},
 ]
 const selected=products.find(p=>p.id===preview)||products[0]
 const owned=progress.inventory.includes(selected.id)
 function purchase(product:typeof selected) {
  if(!demo){setNotice('실제 상점 연결 전이에요. 시연 모드에서 구매 흐름을 확인할 수 있어요.');return}
  if(progress.points<product.price){setNotice('포인트가 부족해요. 퀴즈를 풀어 포인트를 모아보세요.');return}
  setConfirm(product)
 }
 return <main className="page shop-layout"><aside>
  <div className="shop-preview"><Character jersey={selected.kind==='jersey'?selected.id:progress.equipped.jersey} bat={selected.kind==='bat'||Boolean(progress.equipped.bat)} ball={selected.kind==='ball'||Boolean(progress.equipped.ball)}/></div>
  <p className="preview-label">미리보기 · {selected.name}</p>
  <div className="balance between"><span>보유 포인트</span><strong>{progress.points.toLocaleString()}P</strong></div>
  <button className="full-width" disabled={owned&&progress.equipped[selected.kind]===selected.id} onClick={()=>owned?equip(selected.kind,selected.id):purchase(selected)}>{owned?(progress.equipped[selected.kind]===selected.id?'착용 중':'착용하기'):selected.name+' 구매 · '+selected.price+'P'}</button>
 </aside><section><div className="chips">{teams.filter(t=>t.code!=='NONE').map(t=><button key={t.code} className={'chip '+(team===t.code?'active':'')} aria-pressed={team===t.code} onClick={()=>{setTeam(t.code);setPreview(t.code+'-away')}}>{t.short}</button>)}</div>
  <div className="chips">{types.map(([label,value])=><button key={value} className={'chip '+(type===value?'active':'')} aria-pressed={type===value} onClick={()=>setType(value)}>{label}</button>)}</div>
  <div className="products">{products.filter(p=>type==='all'||p.kind===type).map(product=>{
   const has=progress.inventory.includes(product.id),wearing=progress.equipped[product.kind]===product.id
   return <article className="product" key={product.id}><button className="product-picture" aria-label={product.name+' 미리보기'} onClick={()=>setPreview(product.id)}><span className={'product-icon '+product.kind+(product.id.endsWith('away')?' away':'')}>{product.kind==='jersey'?'7':''}</span></button>
    <h2>{product.name}</h2><p className="muted small">{product.price}P{has?' · 보유':''}</p>
    <button className={'full-width small-button '+(preview===product.id?'':'secondary-button')} disabled={wearing} onClick={()=>{setPreview(product.id);if(has)equip(product.kind,product.id);else purchase(product)}}>{wearing?'착용 중':has?'착용하기':'구매'}</button></article>
  })}</div>
  <p className="page-note">{demo?'시연 보상 — 퀴즈 정답 +20P · 시청 30분마다 +10P (하루 최대 60P)':'실제 상품과 포인트 정책은 서버 연결 후 제공됩니다.'}</p><p className="page-note">산 아이템은 캐릭터가 바로 입어요 · 능력치·현금 결제 없음</p>
  {notice&&<p className="inline-notice" role="status">{notice}</p>}
 </section>
 {confirm&&<Modal title="아이템 구매" onClose={()=>setConfirm(null)}><p>{confirm.name}을 {confirm.price}P로 구매할까요?</p><p className="muted small">구매 후 남는 포인트: {(progress.points-confirm.price).toLocaleString()}P</p><div className="row"><button onClick={()=>{buy(confirm.id,confirm.price,confirm.kind);setNotice(confirm.name+'을 구매하고 착용했어요.');setConfirm(null)}}>구매 확정</button><button className="secondary-button" onClick={()=>setConfirm(null)}>취소</button></div></Modal>}
 </main>
}

