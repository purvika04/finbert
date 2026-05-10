import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

start_marker = "    <div className=\"flex min-h-screen bg-[#04060C] text-[#E2E8F0] font-sans\">"
end_marker = "      {/* Main Content Area */}"

old_nav = """    <div style={{
      background:"#080B14",minHeight:"100vh",
      fontFamily:sans, color:"#E2E8F0",
      display:"flex",flexDirection:"column",
    }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.3}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        input[type=number]::-webkit-inner-spin-button{opacity:0.3}
        select option{background:#0e1120}
      `}</style>

      {/* Top Nav */}
      <header style={{
        borderBottom:"0.5px solid rgba(255,255,255,0.07)",
        background:"rgba(8,11,20,0.95)",
        backdropFilter:"blur(10px)",
        padding:"0 24px",
        display:"flex",alignItems:"center",
        position:"sticky",top:0,zIndex:100,
        minHeight:52,flexShrink:0,
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginRight:32}}>
          <div style={{
            width:22,height:22,borderRadius:6,
            background:"linear-gradient(135deg,#1D9E75,#4B7AC7)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,fontWeight:700,color:"#fff",fontFamily:mono,
          }}>F</div>
          <span style={{fontSize:14,fontWeight:600,fontFamily:mono,letterSpacing:0.5,color:"#fff"}}>
            FinGuard
          </span>
          <span style={{fontSize:9,fontFamily:mono,color:"rgba(255,255,255,0.2)",letterSpacing:2,marginLeft:2}}>
            AI
          </span>
        </div>

        {/* Nav */}
        <nav style={{display:"flex",gap:2,flex:1,overflowX:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} style={{
              padding:"6px 14px",borderRadius:7,fontSize:11,fontFamily:mono,
              cursor:"pointer",whiteSpace:"nowrap",
              background:view===n.id?"rgba(255,255,255,0.08)":"transparent",
              border:view===n.id?"0.5px solid rgba(255,255,255,0.12)":"0.5px solid transparent",
              color:view===n.id?"#fff":"rgba(255,255,255,0.4)",
              transition:"all 0.15s",
            }}>
              <span style={{marginRight:6,opacity:0.7}}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Status */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:16}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#1D9E75",boxShadow:"0 0 4px #1D9E75"}}/>
          <span style={{fontSize:9,fontFamily:mono,color:"rgba(255,255,255,0.25)",letterSpacing:1}}>
            API LIVE
          </span>
        </div>
      </header>

      {/* Page */}
"""

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + old_nav + content[end_idx + len(end_marker):]

# Also fix the end of the <main>
content = content.replace("""      <main className="flex-1 ml-64 p-8 w-[calc(100%-16rem)]">
        <div className="max-w-[1200px] mx-auto">
          {content[view]}
        </div>
      </main>""", """      <main style={{flex:1,padding:"28px 24px",maxWidth:1100,margin:"0 auto",width:"100%"}}>
        {content[view]}
      </main>""")

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)
