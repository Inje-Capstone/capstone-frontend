export default function Character({jersey='LG-home',bat=true,ball=true}:{jersey?:string;bat?:boolean;ball?:boolean}) {
 const away=jersey.endsWith('away')
 return <div className={'character-scene '+(away?'away':'')} role="img" aria-label="등번호 7번 루키 캐릭터">
  <div className="rookie"><div className="rk-cap"/><div className="rk-brim"/>
   <div className="rk-head"><i/><i/></div>
   <div className="rk-arm left"/><div className="rk-body">7</div><div className="rk-arm right"/>
   <div className="rk-leg left"/><div className="rk-leg right"/>
  </div>
  {bat&&<div className="rk-bat"/>}{ball&&<div className="rk-ball"/>}
 </div>
}

