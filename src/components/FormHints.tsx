import { useEffect,useState } from 'react'
function hint(input:HTMLInputElement,invalid=false) {
 if(input.autocomplete==='new-password'&&input.getAttribute('aria-label')?.includes('확인'))return '앞에서 입력한 비밀번호와 동일하게 입력해주세요.'
 if(invalid&&input.validity.valueMissing)return '필수 입력 항목이에요.'
 if(invalid&&input.validity.typeMismatch)return '이메일 주소 형식을 확인해주세요.'
 if(invalid&&input.validity.tooShort)return `${input.minLength}자 이상 입력해주세요.`
 if(invalid&&input.validity.patternMismatch)return input.type==='password'?'8~20자, 숫자를 포함해주세요.':'입력 형식을 확인해주세요.'
 return input.type==='password'?(input.autocomplete==='new-password'?'8~20자, 숫자를 포함해주세요. 특수문자는 선택이에요.':'비밀번호를 입력해주세요.'):input.type==='email'?'이메일 주소를 입력해주세요.':input.placeholder
}
export default function FormHints() {
 const [tip,setTip]=useState<{text:string;x:number;y:number}|null>(null)
 useEffect(()=>{
  const show = (event: Event) => {
   const input = event.target
   if (
       !(input instanceof HTMLInputElement) ||
       !['email', 'password', 'text'].includes(input.type) ||
       !input.closest('form')
   ) return

   if (event.type !== 'invalid' && input.form?.classList.contains('login-form')) {
    setTip(null)
    return
   }

   const rect = input.getBoundingClientRect()
   setTip({
    text: hint(input, event.type === 'invalid'),
    x: Math.max(12, Math.min(rect.left, window.innerWidth - 332)),
    y: rect.bottom + 8,
   })
  }
  const hide=()=>setTip(null)
  const invalid=(event:Event)=>{event.preventDefault();const input=event.target;if(!(input instanceof HTMLInputElement)||input.form?.querySelector('input:invalid')!==input)return;input.focus();show(event)}
  document.addEventListener('mouseover',show);document.addEventListener('focusin',show);document.addEventListener('invalid',invalid,true);document.addEventListener('input',show);document.addEventListener('mouseout',hide);document.addEventListener('focusout',hide);window.addEventListener('scroll',hide,true)
  return ()=>{document.removeEventListener('mouseover',show);document.removeEventListener('focusin',show);document.removeEventListener('invalid',invalid,true);document.removeEventListener('input',show);document.removeEventListener('mouseout',hide);document.removeEventListener('focusout',hide);window.removeEventListener('scroll',hide,true)}
 },[])
 return tip?<div className="form-tooltip" role="tooltip" style={{left:tip.x,top:tip.y}}><span className="hint-warning" aria-hidden="true">!</span>{tip.text}</div>:null
}
