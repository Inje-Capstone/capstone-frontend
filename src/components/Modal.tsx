import { useEffect,useId,useRef } from 'react'
import type { ReactNode } from 'react'
export default function Modal({title,children,onClose,className=''}:{title:string;children:ReactNode;onClose:()=>void;className?:string}) {
 const ref=useRef<HTMLDialogElement>(null),id=useId()
 useEffect(()=>{
  const dialog=ref.current
  dialog?.showModal()
  return ()=>dialog?.close()
 },[])
 return <dialog ref={ref} className={'modal '+className} aria-labelledby={id}
  onCancel={event=>{event.preventDefault();onClose()}}
  onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)onClose()}}}>
  <header className="modal-heading"><h2 id={id}>{title}</h2><button className="icon-button" aria-label="닫기" onClick={onClose}>×</button></header>
  {children}
 </dialog>
}

