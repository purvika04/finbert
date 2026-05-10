import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Update Scorecard with Education, Sector, and Timeline
# We will insert them right after the Ratios Card, before the SHAP values Card

ratios_end = "          {/* SHAP values */}"

new_cards = """
          {/* Understand This Score */}
          <Card style={{gridColumn:"1/-1"}}>
            <Label>Understand This Score (Financial Literacy)</Label>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:200,background:"rgba(255,255,255,0.02)",padding:12,borderRadius:8,border:"0.5px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#4B7AC7",fontFamily:mono,marginBottom:6}}>NPA Ratio (Non-Performing Assets)</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>Loans that have stopped generating income. <strong>Dangerous Range:</strong> Above 5% indicates severe distress.</div>
              </div>
              <div style={{flex:1,minWidth:200,background:"rgba(255,255,255,0.02)",padding:12,borderRadius:8,border:"0.5px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#1D9E75",fontFamily:mono,marginBottom:6}}>CAR (Capital Adequacy Ratio)</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>A bank's capital vs its risk. RBI requires min 9%. <strong>Dangerous Range:</strong> Approaching 9% means capital starvation.</div>
              </div>
              <div style={{flex:1,minWidth:200,background:"rgba(255,255,255,0.02)",padding:12,borderRadius:8,border:"0.5px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#EF9F27",fontFamily:mono,marginBottom:6}}>Liquidity Coverage</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>High Quality Liquid Assets vs outflows over 30 days. <strong>Dangerous Range:</strong> Below 100% means extreme vulnerability to bank runs.</div>
              </div>
            </div>
          </Card>

          {/* Sector Exposure Visualization */}
          <Card style={{gridColumn:"1/-1"}}>
             <Label>Sector Exposure Visualization</Label>
             <div style={{display:"flex",gap:16,alignItems:"center"}}>
               <div style={{flex:1}}>
                 <div style={{marginBottom:10}}>
                   <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:mono,color:"rgba(255,255,255,0.6)",marginBottom:4}}><span>Real Estate Exposure</span><span>31%</span></div>
                   <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{width:"31%",background:"#E24B4A",height:"100%",borderRadius:3}}/></div>
                 </div>
                 <div style={{marginBottom:10}}>
                   <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:mono,color:"rgba(255,255,255,0.6)",marginBottom:4}}><span>MSME Exposure</span><span>22%</span></div>
                   <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{width:"22%",background:"#EF9F27",height:"100%",borderRadius:3}}/></div>
                 </div>
                 <div style={{marginBottom:10}}>
                   <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:mono,color:"rgba(255,255,255,0.6)",marginBottom:4}}><span>Infrastructure Exposure</span><span>18%</span></div>
                   <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{width:"18%",background:"#1D9E75",height:"100%",borderRadius:3}}/></div>
                 </div>
               </div>
               <div style={{flex:1,padding:16,background:"rgba(226,75,74,0.05)",borderLeft:"2px solid #E24B4A",borderRadius:4}}>
                 <div style={{fontSize:13,color:"#fff",lineHeight:1.5}}>
                   High <span style={{color:"#E24B4A",fontFamily:mono}}>Real Estate & Infrastructure</span> concentration historically increases distress probability due to long gestation periods and vulnerability to market cycles.
                 </div>
               </div>
             </div>
          </Card>

          {/* Governance Risk Timeline */}
          <Card style={{gridColumn:"1/-1"}}>
            <Label>Governance Risk Timeline & Causal Storytelling</Label>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:12,paddingLeft:8,borderLeft:"1.5px solid rgba(255,255,255,0.1)",marginLeft:8}}>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:-13,top:4,width:8,height:8,borderRadius:"50%",background:"#E24B4A"}}/>
                <div style={{fontSize:10,fontFamily:mono,color:"rgba(255,255,255,0.3)"}}>Q3 2018</div>
                <div style={{fontSize:13,color:"#fff",fontWeight:500}}>CEO Resignation Announced</div>
                <div style={{fontSize:11,color:"#E24B4A",fontFamily:mono}}>↓ Negative Sentiment Spike (Score: -0.84)</div>
              </div>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:-13,top:4,width:8,height:8,borderRadius:"50%",background:"#EF9F27"}}/>
                <div style={{fontSize:10,fontFamily:mono,color:"rgba(255,255,255,0.3)"}}>Q4 2018</div>
                <div style={{fontSize:13,color:"#fff",fontWeight:500}}>Audit highlights massive NPA divergence</div>
                <div style={{fontSize:11,color:"#EF9F27",fontFamily:mono}}>↓ FinGuard Score Deterioration Accelerated (-15 pts)</div>
              </div>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:-13,top:4,width:8,height:8,borderRadius:"50%",background:"#1D9E75"}}/>
                <div style={{fontSize:10,fontFamily:mono,color:"rgba(255,255,255,0.3)"}}>Q1 2019</div>
                <div style={{fontSize:13,color:"#fff",fontWeight:500}}>RBI imposes prompt corrective action (PCA)</div>
                <div style={{fontSize:11,color:"#1D9E75",fontFamily:mono}}>✓ Interventions started. Liquidity crisis managed.</div>
              </div>
            </div>
          </Card>

          {/* SHAP values */}"""

content = content.replace(ratios_end, new_cards)

# 2. Update InvestorTool
# We will replace the entire InvestorTool component.

investor_start = "function InvestorTool() {"
# Find the end of InvestorTool by finding the next component header
investor_end = "// ═══════════════════════════════════════════════════════════════════════════════\n// VIEW 6"

new_investor = """function InvestorTool() {
  const { data:banks } = useFetch(`${API}/banks`,[]);
  const [bank, setBank] = useState("");
  const [type, setType] = useState("fd");
  const [amount, setAmount] = useState("");
  const [shares, setShares] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const DICGC_LIMIT = 500000;

  const bankData = (banks||[]).find(b=>b.bank_name===bank);

  const analyze = () => {
    if (!bank || !bankData) return;
    setLoading(true);
    setTimeout(()=>{
      const fdAmt = parseFloat(amount)||0;
      const shareCount = parseFloat(shares)||0;
      const covered = Math.min(fdAmt, DICGC_LIMIT);
      const uncovered = Math.max(0, fdAmt - DICGC_LIMIT);
      const score = bankData.score;
      const risk = bankData.risk_label;
      const keyRatio = score < 60 ? "NPA Ratio" : score < 80 ? "CAR" : "Liquidity";
      
      let dropTo40Impact = "";
      if(type === "fd") {
        if(score >= 80) {
          dropTo40Impact = `Your ₹${(fdAmt/100000).toFixed(1)} lakh FD is extremely safe right now. Even if conditions drastically change, DICGC insures up to ₹5 lakh.`;
        } else if (score >= 60) {
          dropTo40Impact = `Current deterioration is moderate but worsening. Your ₹${(fdAmt/100000).toFixed(1)} lakh FD remains insured under DICGC up to ₹5 lakh. Uninsured amounts should be monitored.`;
        } else {
          dropTo40Impact = `High risk of capital lock-in if RBI imposes a moratorium. While DICGC guarantees up to ₹5 lakh, processing claims takes months. Uninsured ₹${(uncovered/100000).toFixed(1)} lakh is at severe risk.`;
        }
      } else {
        dropTo40Impact = `Equity shareholders are wiped out first during a collapse (e.g. YES Bank AT1 bonds/equity). A critical score drop means your shares could lose 80-90% of their value overnight.`;
      }

      setResult({ covered, uncovered, keyRatio, dropTo40Impact, score, risk, fdAmt, shareCount });
      setLoading(false);
    },400);
  };

  const rm = bankData ? RISK_META[bankData.risk_label]||RISK_META["Caution"] : null;

  return (
    <div>
      <Label>Personal Investment Risk Connector</Label>
      <h2 style={{margin:"0 0 20px",fontSize:20,fontWeight:600,fontFamily:sans,color:"#fff"}}>
        What Does My Money Risk?
      </h2>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <Label>Your Investment</Label>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:mono,marginBottom:6}}>Bank</div>
            <select value={bank} onChange={e=>{setBank(e.target.value);setResult(null);}} style={{
              width:"100%",background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
              borderRadius:8,color:"#fff",fontSize:12,fontFamily:mono,padding:"9px 12px",outline:"none",cursor:"pointer"
            }}>
              <option value="">Select a bank…</option>
              {(banks||[]).map(b=>(<option key={b.bank_name} value={b.bank_name}>{b.bank_name}</option>))}
            </select>
          </div>

          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["fd","shares"].map(t=>(
              <button key={t} onClick={()=>{setType(t);setResult(null);}} style={{
                flex:1,padding:"8px",borderRadius:7,fontSize:11,fontFamily:mono,cursor:"pointer",
                border:type===t?"0.5px solid #4B7AC7":"0.5px solid rgba(255,255,255,0.08)",
                background:type===t?"rgba(75,122,199,0.15)":"transparent",
                color:type===t?"#7EB3F5":"rgba(255,255,255,0.4)",
              }}>
                {t==="fd"?"Fixed Deposit":"Shares"}
              </button>
            ))}
          </div>

          {type==="fd" && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:mono,marginBottom:6}}>Amount (₹)</div>
              <input
                type="number" placeholder="e.g. 200000" value={amount}
                onChange={e=>{setAmount(e.target.value);setResult(null);}}
                style={{
                  width:"100%",boxSizing:"border-box",padding:"9px 12px",
                  background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
                  borderRadius:8,color:"#fff",fontSize:12,fontFamily:mono,outline:"none"
                }}
              />
            </div>
          )}

          {type==="shares" && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:mono,marginBottom:6}}>Number of Shares</div>
              <input
                type="number" placeholder="e.g. 500" value={shares}
                onChange={e=>{setShares(e.target.value);setResult(null);}}
                style={{
                  width:"100%",boxSizing:"border-box",padding:"9px 12px",
                  background:"rgba(255,255,255,0.04)",border:"0.5px solid rgba(255,255,255,0.12)",
                  borderRadius:8,color:"#fff",fontSize:12,fontFamily:mono,outline:"none"
                }}
              />
            </div>
          )}

          <button onClick={analyze} disabled={!bank||loading} style={{
            width:"100%",padding:"10px",borderRadius:8,fontSize:12,fontFamily:mono,
            cursor:bank?"pointer":"not-allowed",
            background:bank?"rgba(29,158,117,0.2)":"rgba(255,255,255,0.03)",
            border:bank?"0.5px solid #1D9E75":"0.5px solid rgba(255,255,255,0.07)",
            color:bank?"#1D9E75":"rgba(255,255,255,0.25)",fontWeight:500
          }}>
            {loading?"Analysing…":"Analyse Risk →"}
          </button>

          {bankData && rm && (
            <div style={{
              marginTop:16,padding:"12px",borderRadius:8,
              background:rm.bg,border:`0.5px solid ${rm.border}`,
              display:"flex",alignItems:"center",gap:12
            }}>
              <ScoreRing score={bankData.score} size={50}/>
              <div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontFamily:sans,marginBottom:4}}>
                  Current FinGuard Score
                </div>
                <RiskBadge label={bankData.risk_label}/>
              </div>
            </div>
          )}
        </Card>

        {/* Result */}
        <div>
          {!result && !loading && (
            <Card style={{height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",
              alignItems:"center",textAlign:"center",padding:32,boxSizing:"border-box"}}>
              <div style={{fontSize:32,marginBottom:12}}>₹</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",fontFamily:sans,lineHeight:1.7}}>
                Select a bank and enter your investment to see personalised risk analysis
              </div>
            </Card>
          )}
          {loading && <Card style={{height:"100%"}}><Spinner/></Card>}
          {result && !loading && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {type==="fd" && (
                <Card style={{borderLeft:`3px solid ${result.uncovered>0?"#E24B4A":"#1D9E75"}`}}>
                  <Label>DICGC Insurance Coverage</Label>
                  <div style={{display:"flex",gap:16,marginBottom:12}}>
                    <div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginBottom:3}}>COVERED</div>
                      <div style={{fontSize:18,fontWeight:600,fontFamily:mono,color:"#1D9E75"}}>
                        ₹{result.covered.toLocaleString("en-IN")}
                      </div>
                    </div>
                    {result.uncovered>0 && (
                      <div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginBottom:3}}>UNCOVERED</div>
                        <div style={{fontSize:18,fontWeight:600,fontFamily:mono,color:"#E24B4A"}}>
                          ₹{result.uncovered.toLocaleString("en-IN")}
                        </div>
                      </div>
                    )}
                  </div>
                  {result.uncovered > 0 && (
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:sans,lineHeight:1.6}}>
                      While ₹{DICGC_LIMIT.toLocaleString("en-IN")} is strictly guaranteed, <span style={{color:"#E24B4A"}}>your remaining ₹{result.uncovered.toLocaleString("en-IN")} is exposed</span> if this bank faces moratorium.
                    </div>
                  )}
                  {result.uncovered === 0 && (
                    <div style={{fontSize:12,color:"#1D9E75",fontFamily:sans,lineHeight:1.6}}>
                      ✓ Your entire deposit is unconditionally insured. Even in the worst-case scenario, your principal is safe.
                    </div>
                  )}
                </Card>
              )}

              <Card style={{background:"rgba(255,255,255,0.03)"}}>
                <Label style={{color:"#7EB3F5"}}>Retail Investor Impact</Label>
                <div style={{fontSize:13,color:"#fff",fontFamily:sans,lineHeight:1.6}}>
                  {result.dropTo40Impact}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"""

start_idx = content.find(investor_start)
end_idx = content.find(investor_end)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_investor + content[end_idx:]

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)
