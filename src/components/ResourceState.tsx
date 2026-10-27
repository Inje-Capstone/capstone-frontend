export default function ResourceState({loading,error,retry}:{loading:boolean;error:string;retry:()=>void}) {
 if(loading)return <p role="status" className="empty-state">불러오고 있어요…</p>
 if(error)return <div className="empty-state" role="alert"><p>{error}</p><button onClick={retry}>다시 시도</button></div>
 return null
}

