"use client";

import React, {useEffect, useMemo, useState} from "react";

const INITIAL = `3427
4866
9088
9159
1783
0625
8310
5060
3635
3925
1225
0655
8706
0559
3169
8886
0644
5892
0339`;

const formulas = {
  "2358": {
    digits:["2","3","5","8"],
    triples:["258","358","325","328","324","354","357","378","578","123","327","782"],
    fours:["7325","7328","7358","2578","2538","0258","0358","2345","1234","3456","3458","2348","1235","2347","3457"]
  },
  "01347": {
    digits:["0","1","3","4","7"],
    triples:["134","137","147","347","047","440","447","477","307","304","104","107"],
    fours:["1470","1473","1403","3740","1730","1234","0123","2347"]
  },
  "012569": {
    digits:["0","1","2","5","6","9"],
    triples:["206","209","506","509","069","256","259","269","569","126","129","156","159","169"],
    fours:["0126","0129","0256","0259","0269","0569","1256","1259","1269","1569","1506","1509"]
  }
};

function clean4(x){const m=String(x).match(/\d{4}/);return m?m[0]:null}
function countDigits(draws){const c=Array(10).fill(0);draws.forEach(d=>d.split("").forEach(ch=>c[+ch]++));return c}
function posCounts(draws){const p=[0,1,2,3].map(()=>Array(10).fill(0));draws.forEach(d=>d.split("").forEach((ch,i)=>p[i][+ch]++));return p}
function repeat(s){return new Set(s).size<s.length}
function triple(s){return [..."0123456789"].some(n=>(s.match(new RegExp(n,"g"))||[]).length>=3)}
function overdue(draws){return [...Array(10)].map((_,n)=>{let gap=draws.length;for(let i=draws.length-1;i>=0;i--){if(draws[i].includes(String(n))){gap=draws.length-1-i;break}}return [n,gap]}).sort((a,b)=>b[1]-a[1])}
function formulaScores(draws){return Object.entries(formulas).map(([name,f])=>{let digitHit=0,tripleHit=0,fourHit=0;draws.forEach(d=>{const set=new Set(d.split(""));digitHit+=f.digits.filter(x=>set.has(x)).length;const tris=[d.slice(0,3),d.slice(1,4),d[0]+d[2]+d[3],d[0]+d[1]+d[3]];if(tris.some(t=>f.triples.includes(t)))tripleHit++;if(f.fours.includes(d))fourHit++});return {name,avg:(digitHit/draws.length).toFixed(2),tripleHit,fourHit}})}
function rankAll(draws,mode){const freq=countDigits(draws), recent10=countDigits(draws.slice(-10)), recent5=countDigits(draws.slice(-5)), pos=posCounts(draws);const formulaFours=Object.values(formulas).flatMap(f=>f.fours);const w={adaptive:[.55,1.25,1.2,2.1,20,3,-5],recent:[.15,2.1,2.2,1.2,6,2,-3],formula:[.25,.6,.4,.8,50,1,-4],overdue:[.2,-.5,-1,.7,8,0,-3]}[mode];const out=[];for(let n=0;n<10000;n++){const s=String(n).padStart(4,"0");let score=0;s.split("").forEach((ch,i)=>{const d=+ch;score+=freq[d]*w[0]+recent10[d]*w[1]+recent5[d]*w[2]+pos[i][d]*w[3]});if(formulaFours.includes(s))score+=w[4];if(repeat(s))score+=w[5];if(triple(s))score+=w[6];out.push([s,score])}return out.sort((a,b)=>b[1]-a[1])}
function make3(top4){const m=new Map();top4.slice(0,160).forEach(([s,score])=>{[s.slice(0,3),s.slice(1,4),s[0]+s[2]+s[3],s[0]+s[1]+s[3]].forEach(t=>m.set(t,(m.get(t)||0)+score/10))});return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,30)}
function downloadText(name,text){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/plain"}));a.download=name;a.click()}
function BarList({counts}){const max=Math.max(...counts,1);return <>{counts.map((v,i)=><div className="barRow" key={i}><b>{i}</b><span>{v} ครั้ง</span><div className="bar"><i style={{width:`${(v/max)*100}%`}}/></div></div>)}</>}

export default function Page(){
  const [raw,setRaw]=useState(INITIAL);
  const [newResult,setNewResult]=useState("");
  const [mode,setMode]=useState("adaptive");
  useEffect(()=>{const saved=localStorage.getItem("dna-results-v3"); if(saved) setRaw(saved)},[]);
  const draws=useMemo(()=>raw.split(/\s+|,/).map(clean4).filter(Boolean),[raw]);
  const freq=useMemo(()=>countDigits(draws),[draws]);
  const pos=useMemo(()=>posCounts(draws),[draws]);
  const od=useMemo(()=>overdue(draws),[draws]);
  const fs=useMemo(()=>formulaScores(draws),[draws]);
  const ranked=useMemo(()=>rankAll(draws,mode),[draws,mode]);
  const top3=useMemo(()=>make3(ranked),[ranked]);
  const win7=useMemo(()=>freq.map((v,i)=>[i,v]).sort((a,b)=>b[1]-a[1]).slice(0,7).map(x=>x[0]).join(" "),[freq]);
  const add=()=>{const d=clean4(newResult);if(!d)return alert("ใส่ผล 4 ตัว เช่น 0339-37");const next=raw.trim()+"\n"+d;setRaw(next);setNewResult("");localStorage.setItem("dna-results-v3",next)};
  const save=()=>{localStorage.setItem("dna-results-v3",raw);alert("บันทึกแล้ว")};
  const reset=()=>{setRaw(INITIAL);localStorage.setItem("dna-results-v3",INITIAL)};
  return <main className="app">
    <section className="hero"><div><h1>DNA AI Dashboard V3</h1><p>Dashboard + Predictor + Formula Leaderboard</p></div><div className="badge">ผลล่าสุด: <b>{draws.at(-1)||"-"}</b></div></section>
    <section className="grid"><div className="card kpi"><span>จำนวนงวด</span><b>{draws.length}</b></div><div className="card kpi"><span>วิน 7 ตัว</span><b>{win7}</b></div><div className="card kpi"><span>Top 1</span><b>{ranked[0]?.[0]}</b></div><div className="card kpi"><span>เลขหายสุด</span><b>{od[0]?.[0]} <small>{od[0]?.[1]} งวด</small></b></div></section>
    <section className="grid"><div className="card"><h2>เพิ่มผลล่าสุด</h2><input value={newResult} onChange={e=>setNewResult(e.target.value)} placeholder="เช่น 0339-37"/><button onClick={add}>เพิ่มและวิเคราะห์</button></div><div className="card"><h2>ฐานข้อมูลผล</h2><textarea value={raw} onChange={e=>setRaw(e.target.value)}/><div className="row"><button onClick={save}>บันทึก</button><button className="ghost" onClick={reset}>รีเซ็ต</button><button className="ghost" onClick={()=>downloadText("dna-results.txt",raw)}>Export</button></div></div></section>
    <section className="card"><h2>โหมดจัดอันดับ</h2><div className="tabs">{[["adaptive","Adaptive Mix"],["recent","Recent Trend"],["formula","Formula Focus"],["overdue","Overdue Balance"]].map(([id,label])=><button key={id} className={mode===id?"active":""} onClick={()=>setMode(id)}>{label}</button>)}</div><p className="muted">เปลี่ยนโหมดเพื่อเทียบ Top 100 แต่ละแนว</p></section>
    <section className="grid"><div className="card"><h2>ความถี่เลขรวม</h2><BarList counts={freq}/></div><div className="card"><h2>เลขหาย / Overdue</h2>{od.map(x=><span className="badge" key={x[0]}>{x[0]} หาย {x[1]} งวด</span>)}</div></section>
    <section className="grid">{pos.map((pc,idx)=><div className="card" key={idx}><h2>หลักที่ {idx+1}</h2><BarList counts={pc}/></div>)}</section>
    <section className="grid"><div className="card"><h2>Formula Leaderboard</h2><table><thead><tr><th>สูตร</th><th>เฉลี่ยเลขในชุด</th><th>เข้า 3 ตัว</th><th>เข้า 4 ตัว</th></tr></thead><tbody>{fs.map(s=><tr key={s.name}><td><b>{s.name}</b></td><td>{s.avg}</td><td>{s.tripleHit}</td><td>{s.fourHit}</td></tr>)}</tbody></table></div><div className="card"><h2>3 ตัว Top 30</h2>{top3.map(([n,s])=><span className="num" key={n}>{n}<small>{s.toFixed(1)}</small></span>)}</div></section>
    <section className="card"><h2>4 ตัว Top 100</h2>{ranked.slice(0,100).map(([n,s])=><span className="num" key={n}>{n}<small>{s.toFixed(1)}</small></span>)}</section>
    <p className="warn">หมายเหตุ: เป็นเครื่องมือจัดอันดับจากข้อมูลย้อนหลัง ไม่รับประกันผลที่เป็นการสุ่ม</p>
  </main>
}
