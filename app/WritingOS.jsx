import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
// ═══ CONSTANTS ════════════════════════════════════════════════════
const TAG_COLORS = ["#4a9a4a","#5a5a9a","#9a4a4a","#9a8a2a"];
const TAG_LABELS = ["✓ Готово","? Черновик","! Важно","★ Ключевое"];
const AI_ROLES = {
  editor:   {label:"✏ Редактор",  sys:"Ты литературный редактор. Улучшай стиль и ясность. По-русски, 2-4 предложения."},
  critic:   {label:"🔍 Критик",   sys:"Ты строгий рецензент. Выявляй противоречия, слабые аргументы. По-русски."},
  lawyer:   {label:"⚖ Юрист",    sys:"Ты эксперт по SGB IX/XII, SGG. Ссылайся на §§ и практику BSG. По-русски."},
  coauthor: {label:"◈ Соавтор",  sys:"Ты соавтор. Продолжай мысль органично, в том же стиле. Только текст."},
  translate:{label:"🌐 Перевод",  sys:"Переведи точно, сохраняя юридическую терминологию. Только перевод."},
};
const LANGS = {ru:"🇷🇺 RU",de:"🇩🇪 DE",en:"🇬🇧 EN"};
// ═══ THEME ════════════════════════════════════════════════════════
const MK = d => d
  ? {bg:"#080808",sf:"#0f0f0f",sf2:"#141414",bd:"#1c1c1c",bd2:"#2a2a2a",tx:"#ddd5c5",dm:"#555",fa:"#222",
     ac:"#c9a84c",ai:"#4a9a4a",aiBg:"#091409",aiBd:"#163016",
     nt:"#9a7a38",ntBg:"#120e04",ntBd:"#302208",
     ct:"#9a4a4a",ctBg:"#130808",ctBd:"#381212",
     fn:"#7a7aaa",fnBg:"#0a0a14",fnBd:"#1a1a3a",
     gr:"#3a7a9a",grBg:"#040c10",grBd:"#0a2030",
     ip:"#0a0a0a",sel:"#c9a84c22"}
  : {bg:"#f3ede0",sf:"#fff",sf2:"#f8f3e8",bd:"#ddd5c0",bd2:"#ccc",tx:"#1a1a1a",dm:"#666",fa:"#ddd",
     ac:"#7a4e10",ai:"#2a6a2a",aiBg:"#f0faf0",aiBd:"#8ec88e",
     nt:"#7a6010",ntBg:"#fffbee",ntBd:"#c8c060",
     ct:"#8a3030",ctBg:"#fff0f0",ctBd:"#d09090",
     fn:"#5050aa",fnBg:"#f0f0ff",fnBd:"#c0c0ee",
     gr:"#2a6a8a",grBg:"#f0f8ff",grBd:"#90c0d8",
     ip:"#f7f2e5",sel:"#7a4e1022"};
// ═══ HELPERS ══════════════════════════════════════════════════════
const uid  = () => "x"+Math.random().toString(36).slice(2,9);
const now_ = () => new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});
const mkB  = (text="") => ({id:uid(),text,fmt:{},comments:[],inlineComments:[],aiReplies:[],footnotes:[],version:1,versions:[],tags:[],bookmarked:false,corrections:[]});
const mkCh = (title,texts=[""]) => ({id:uid(),title,blocks:texts.map(mkB)});
const cW   = t => t.trim().split(/\s+/).filter(Boolean).length;
const daysLeft = d => Math.ceil((new Date(d)-new Date())/(1000*60*60*24));
const fristColor = n => n <= 0 ? "#cc3333" : n <= 3 ? "#cc3333" : n <= 7 ? "#cc7a00" : n <= 14 ? "#c9a84c" : "#4a9a4a";

// ═══ LEGAL TEMPLATES ══════════════════════════════════════════════
const LEGAL_TPLS = {
  widerspruch:{label:"📋 Widerspruch",color:"#7a8aaa",chapters:[
    {title:"Anschrift",blocks:["An: [Behörde]\nVon: [Name, Adresse]\nAktenzeichen: [Az.]\nDatum: [Datum]"]},
    {title:"Betreff",blocks:["Widerspruch gegen Bescheid vom [Datum], Az. [Az.]\n\nСогласно § 84 SGG заявляю Widerspruch по следующим основаниям:"]},
    {title:"Sachverhalt",blocks:["Am [Datum] erging Bescheid über Ablehnung von [Leistung].\n\n[Дата] вынесен Bescheid об отказе в [услуге].","Der Bescheid enthält keine Begründung gemäß § 35 SGB X.\n\nBescheid не содержит обоснования согласно § 35 SGB X."]},
    {title:"Begründung",blocks:["§ 29 SGB IX: Rechtsanspruch auf Persönliches Budget.\n§ 14 SGB IX: fehlerhafte Zuständigkeitsklärung.\nBSG [Az.]: [Begründung]."]},
    {title:"Antrag",blocks:["Bitte:\n1. Bescheid aufheben.\n2. [Leistung] gewähren.\n3. Kosten erstatten.\n\n[Ort], [Datum]\n_________________"]}
  ]},
  klage:{label:"⚖ Klage SG Dresden",color:"#9a6a4a",chapters:[
    {title:"Rubrum",blocks:["AN DAS SOZIALGERICHT DRESDEN\n\nKlage\ndes [Name] — Kläger —\ngegen [Behörde] — Beklagter —\nwegen: Persönliches Budget § 29 SGB IX\nAz. Vorverfahren: [Az.]"]},
    {title:"Klageantrag",blocks:["Es wird beantragt:\n1. Bescheid vom [Datum] aufzuheben.\n2. Beklagten zu verurteilen, [Leistung] zu gewähren.\n3. Kosten dem Beklagten aufzuerlegen."]},
    {title:"Sachverhalt",blocks:["[Datum]: Antrag auf [Leistung] gemäß § 29 SGB IX.\n[Datum]: Ablehnungsbescheid.\n[Datum]: Widerspruch.\n[Datum]: Widerspruchsbescheid — zurückgewiesen.","Frist: Klage innerhalb 1 Monat ab Widerspruchsbescheid (§ 87 SGG)."]},
    {title:"Rechtliche Würdigung",blocks:["§ 54 Abs. 2 SGG: Bescheid rechtswidrig.\n§ 29 Abs. 1 SGB IX: Rechtsanspruch, kein Ermessen.\n§ 14 SGB IX i.V.m. § [X] SGB XII: Zuständigkeit des Beklagten.","BSG [Az.]: [Beschreibung Präzedenzfall]."]},
    {title:"Beweisangebote",blocks:["Anlage K1: Antrag\nAnlage K2: Bescheid\nAnlage K3: Widerspruchsbescheid\nAnlage K4: [weitere Belege]"]},
    {title:"Unterschrift",blocks:["[Ort], den [Datum]\n\n_______________________\n[Unterschrift]"]}
  ]},
  s7so9925:{label:"📁 S 7 SO 99/25",color:"#4a9a6a",chapters:[
    {title:"Aktenzeichen & Status",blocks:["Az.: S 7 SO 99/25\nGericht: Sozialgericht Dresden\nNächster Termin: [Datum]\nStatus: [aktueller Stand]\nDedlain: [Datum]"]},
    {title:"Streitgegenstand",blocks:["Eingliederungshilfe / Persönliches Budget § 29 SGB IX\nBeklagter: [Behörde]\nBetrag: [€]\nZeitraum: [Zeitraum]"]},
    {title:"Chronologie",blocks:["[Datum]: Antrag\n[Datum]: Bescheid — Ablehnung\n[Datum]: Widerspruch\n[Datum]: Widerspruchsbescheid — zurückgewiesen\n[Datum]: Klage bei SG Dresden","Fristenkontrolle:\n- Nächste Stellungnahme: [Datum]\n- Akteneinsicht: ja/nein"]},
    {title:"Argumente",blocks:["1. § 14 SGB IX — fehlerhafte Zuständigkeit\n2. § 29 SGB IX — Rechtsanspruch\n3. BSG [Az.] — [Präzedenz]"]},
    {title:"Nächste Schritte",blocks:["☐ Akteneinsicht\n☐ Stellungnahme bis [Datum]\n☐ Gutachten [Sachverständiger]\n☐ PKH beantragen"]}
  ]},
  akteneinsicht:{label:"📂 Akteneinsicht",color:"#6a5a9a",chapters:[
    {title:"Antrag",blocks:["An: [Behörde / Gericht]\n\nBetreff: Antrag auf Akteneinsicht gemäß § 25 SGB X / § 120 SGG\n\nHiermit beantrage ich Akteneinsicht in die vollständigen Verwaltungsakten betreffend Az. [Aktenzeichen].","Прошу предоставить полный доступ к материалам дела Az. [Az.] согласно § 25 SGB X / § 120 SGG."]},
    {title:"Begründung",blocks:["Ich bin berechtigt, da ich am Verfahren beteiligt bin (§ 25 Abs. 1 SGB X).\nДля подготовки к судебному заседанию ознакомление с материалами дела необходимо."]},
    {title:"Formalia",blocks:["Ich bitte, mir die Akten in der Geschäftsstelle zugänglich zu machen oder Kopien zu übersenden.\n\n[Ort], [Datum]\n_________________"]}
  ]},
  pkh:{label:"💶 PKH (Prozesskostenhilfe)",color:"#7a6a3a",chapters:[
    {title:"Antrag PKH",blocks:["AN DAS SOZIALGERICHT DRESDEN\n\nAntrag auf Bewilligung von Prozesskostenhilfe\ngemäß §§ 73a SGG, 114 ff. ZPO\n\nfür den Kläger [Name] in der Sache gegen [Beklagter], Az. [Az.]"]},
    {title:"Bedürftigkeit",blocks:["Der Antragsteller ist nicht in der Lage, die Kosten der Prozessführung aufzubringen.\nEinkommen: [€/Monat]\nVermögen: [€]\nUnterhaltspflichten: [Anzahl Personen]\n\nNachweis: Erklärung über persönliche und wirtschaftliche Verhältnisse (Formular) beigefügt."]},
    {title:"Erfolgsaussichten",blocks:["Die Klage hat hinreichende Aussicht auf Erfolg (§ 114 ZPO), da:\n1. § 29 SGB IX gewährt einen Rechtsanspruch.\n2. Die Behörde hat die Zuständigkeit fehlerhaft bestimmt.\n3. BSG [Az.] stützt die Rechtsposition des Klägers."]},
    {title:"Anlagen",blocks:["Anlage: Erklärung über pers. und wirtsch. Verhältnisse\nAnlage: Einkommensnachweise\nAnlage: Kontoauszüge\n\n[Ort], [Datum]\n_________________"]}
  ]},
  budget29:{label:"💰 Pers. Budget § 29 SGB IX",color:"#4a9a7a",chapters:[
    {title:"Antrag Persönliches Budget",blocks:["An: [zuständige Behörde]\n\nAntrag auf Bewilligung eines Persönlichen Budgets\ngemäß § 29 SGB IX\n\nAntragsteller: [Name, Adresse, GdB]\nGesetzlicher Betreuer: [Name] (falls vorhanden)"]},
    {title:"Bedarfsbeschreibung",blocks:["Ich benötige folgende Unterstützungsleistungen:\n[ ] Assistenz bei der Körperpflege: __ Std/Tag\n[ ] Mobilität und Begleitung: __ Std/Tag\n[ ] Hauswirtschaft: __ Std/Woche\n[ ] Kommunikation und soziale Teilhabe: __ Std/Woche\n[ ] Sonstige: __","Gesamtbedarf Assistenz: __ Stunden/Monat\nStundensatz: __ €/Std (ortsüblich)\nGeschätzter Monatsbetrag: __ €"]},
    {title:"Bedarfsermittlung (§ 13 SGB IX)",blocks:["Bedarfsermittlung gemäß § 13 SGB IX durch [Behörde] am [Datum].\nErgebnis: [Beschreibung]\nBewilligter Betrag: [€/Monat]\n\nBemerkung: [Abweichung vom beantragten Betrag / Begründung]"]},
    {title:"Zielvereinbarung (§ 29 Abs. 4 SGB IX)",blocks:["Zielvereinbarung zwischen [Behörde] und [Antragsteller]:\nZiel 1: [z.B. selbstständiges Wohnen]\nZiel 2: [z.B. Teilhabe am Arbeitsleben]\nZiel 3: [z.B. soziale Teilhabe]\n\nNachweispflicht: vierteljährlich\nLaufzeit: [Datum] bis [Datum]"]},
    {title:"Berechnungsgrundlage",blocks:["РАСЧЁТ ПЕРСОНАЛЬНОГО БЮДЖЕТА:\n\nАссистенция (личная): __ ч/мес × __ €/ч = __ €\nМобильность: __ ч/мес × __ €/ч = __ €\nДомашнее хозяйство: __ ч/мес × __ €/ч = __ €\nСоциальное участие: __ ч/мес × __ €/ч = __ €\nПрочие услуги: __ €\n─────────────────────\nИТОГО: __ €/месяц\nВ год: __ €"]}
  ]},
};
const GEN_TPLS = {
  dissertation:{label:"📜 Диссертация",color:"#c9a84c",chapters:[
    {title:"Введение",blocks:["Актуальность. Степень разработанности.","Цели и задачи. Методология."]},
    {title:"Глава 1",blocks:["Теоретические основы.","Исторический обзор."]},
    {title:"Глава 2",blocks:["Методология исследования.","Результаты и интерпретация."]},
    {title:"Заключение",blocks:["Выводы и рекомендации."]},
  ]},
};

// ═══ EXPORT ═══════════════════════════════════════════════════════
function buildMHT(proj, opts={}) {
  const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  let fnC=0; const fnList=[];
  let body=`<h1>${esc(proj.title)}</h1>`;
  if(opts.toc && proj.toc) body+=`<div style="border:1px solid #ccc;padding:12px;margin-bottom:20px;font-size:11pt"><b>Оглавление</b><pre style="font-size:10pt;margin:6px 0">${esc(proj.toc)}</pre></div>`;
  for(const ch of proj.chapters){
    body+=`<h2>${esc(ch.title)}</h2>`;
    for(const b of ch.blocks){
      if(!b.text.trim())continue;
      let txt=esc(b.text);
      for(const fn of (b.footnotes||[])){fnC++;txt+=`<sup>[${fnC}]</sup>`;fnList.push({n:fnC,text:fn.text});}
      const st=b.fmt?.heading?"h3":b.fmt?.bold?"p":"p";
      const sty=b.fmt?.bold?"font-weight:bold;":b.fmt?.italic?"font-style:italic;":"";
      body+=`<${st} style="margin:8px 0;text-indent:1.5em;line-height:1.8;${sty}">${txt}</${st}>`;
      for(const ic of (b.inlineComments||[])) body+=`<blockquote style="border-left:3px solid #ccc;padding-left:10px;color:#666;font-style:italic;margin:4px 0">💬 «${esc(ic.selected)}» — ${esc(ic.comment)}</blockquote>`;
    }
  }
  if(fnList.length){body+=`<hr/><h3>Сноски</h3><ol>`;for(const f of fnList)body+=`<li>${esc(f.text)}</li>`;body+=`</ol>`;}
  if((proj.bibliography||[]).length){body+=`<h3>Литература</h3><ol>`;for(const s of proj.bibliography)body+=`<li>${esc(s.formatted||s.raw)}</li>`;body+=`</ol>`;}
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Times New Roman',serif;font-size:12pt;max-width:800px;margin:40px auto;line-height:1.8}h1{font-size:18pt;border-bottom:1px solid #ccc;padding-bottom:6px}h2{font-size:14pt;margin-top:24px;color:#444}h3{font-size:12pt;margin-top:18px}sup{color:#5050aa;font-size:8pt}</style></head><body>${body}</body></html>`;
  return `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="----=_Part"\r\n\r\n------=_Part\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n${html}\r\n------=_Part--`;
}
function exportDOC(proj) {
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([buildMHT(proj,{toc:true})],{type:"application/msword"}));
  a.download=proj.title.slice(0,50).replace(/[\\/:*?"<>|]/g,"_")+".doc";
  a.click();
}
function exportPDF(proj) {
  const w=window.open("","_blank");
  if(!w)return;
  const html=buildMHT(proj,{toc:true});
  const body=html.split("Content-Type: text/html; charset=\"utf-8\"\r\n\r\n")[1]?.split("\r\n------=_Part--")[0]||"";
  w.document.write(body+"<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500);}<\/script>");
  w.document.close();
}
function exportCasePackage(projects) {
  const legal = projects.filter(p=>p.template && LEGAL_TPLS[p.template]);
  if(!legal.length){alert("Нет правовых документов для экспорта.");return;}
  const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  let body=`<h1>Пакет документов: S 7 SO 99/25</h1><p style="color:#666;font-size:10pt">Экспортировано: ${new Date().toLocaleDateString("ru-RU")} · ${legal.length} документов</p><hr/>`;
  for(const p of legal){
    body+=`<div style="page-break-before:always"><h1>${esc(p.title)}</h1>`;
    for(const ch of p.chapters){
      body+=`<h2>${esc(ch.title)}</h2>`;
      for(const b of ch.blocks) if(b.text.trim()) body+=`<p style="margin:8px 0;white-space:pre-wrap;font-size:11pt">${esc(b.text)}</p>`;
    }
    body+=`</div>`;
  }
  const mht=`MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="----=_Part"\r\n\r\n------=_Part\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Times New Roman',serif;font-size:12pt;max-width:800px;margin:40px auto;line-height:1.8}h1{font-size:16pt;border-bottom:2px solid #444;padding-bottom:6px}h2{font-size:13pt;color:#555;margin-top:20px}</style></head><body>${body}</body></html>\r\n------=_Part--`;
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([mht],{type:"application/msword"}));
  a.download="S7_SO_99-25_Пакет_"+new Date().toISOString().slice(0,10)+".doc";
  a.click();
}
// ═══ INITIAL DATA ═════════════════════════════════════════════════
const INIT=[{
  id:"proj-1",title:"Диссертация: ИИ в правовых системах",created:"2026-01-15",template:"dissertation",milestones:[],bibliography:[],toc:"",graphLinks:[],
  deadlines:[{id:uid(),label:"Stellungnahme SG Dresden",date:"2026-03-10",done:false},{id:uid(),label:"Akteneinsicht beantragen",date:"2026-03-05",done:false}],
  chapters:[
    mkCh("Введение",["Современные правовые системы сталкиваются с вызовом — интеграцией алгоритмических решений в судебные процессы.","§ 29 SGB IX — ключевая норма. Персональный бюджет как альтернатива натуральным услугам."]),
    mkCh("Глава 1",["Юрисдикционные конфликты между Sozialhilfeträger и Eingliederungshilfeträger.","BSG-практика по § 14 SGB IX: определение подведомственности."]),
    mkCh("Глава 2",["Машинное обучение в классификации правовых прецедентов. Точность: 87% в Sozialgericht Dresden.","Ограничения: нейросети не учитывают контекст правовой интуиции эксперта."]),
    mkCh("Заключение",["Выводы: ИИ — инструмент анализа, не замена правовому мышлению."]),
  ]
}];

// ═══ POMODORO ═════════════════════════════════════════════════════
function Pomodoro({T}){
  const [m,setM]=useState(25);const[s,setS]=useState(0);const[run,setRun]=useState(false);
  const[mode,setMode]=useState("work");const[sess,setSess]=useState(0);const intR=useRef(null);
  useEffect(()=>{
    if(run){intR.current=setInterval(()=>{setS(sv=>{if(sv>0)return sv-1;setM(mv=>{if(mv>0)return mv-1;setRun(false);if(mode==="work"){setSess(n=>n+1);setMode("break");setM(5);setS(0);}else{setMode("work");setM(25);setS(0);}return 0;});return 59;});},1000);}
    else clearInterval(intR.current);return()=>clearInterval(intR.current);
  },[run,mode]);
  const c=mode==="work"?T.ai:T.ac;const pct=(mode==="work"?(25*60-(m*60+s))/(25*60):(5*60-(m*60+s))/(5*60))*100;
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:T.sf2,border:`1px solid ${c}44`,borderRadius:7}}>
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13" fill="none" stroke={T.bd2} strokeWidth="2"/>
        <circle cx="16" cy="16" r="13" fill="none" stroke={c} strokeWidth="2.5" strokeDasharray={`${81.7*pct/100} 81.7`} strokeLinecap="round" transform="rotate(-90 16 16)"/>
      </svg>
      <div><div style={{fontSize:13,fontFamily:"monospace",color:c,lineHeight:1}}>{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</div><div style={{fontSize:7,color:T.dm,fontFamily:"monospace"}}>{mode==="work"?"🍅":"☕"} ×{sess}</div></div>
      <button onClick={()=>setRun(v=>!v)} style={{background:c+"22",border:`1px solid ${c}55`,borderRadius:3,color:c,padding:"2px 7px",cursor:"pointer",fontSize:10,fontFamily:"monospace"}}>{run?"⏸":"▶"}</button>
      <button onClick={()=>{setRun(false);setMode("work");setM(25);setS(0);}} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:3,color:T.dm,padding:"2px 5px",cursor:"pointer",fontSize:9}}>↺</button>
    </div>
  );
}
// ═══ DEADLINE WIDGET ══════════════════════════════════════════════
function DeadlineWidget({proj,T,updProj}){
  const [adding,setAdding]=useState(false);const[nm,setNm]=useState({label:"",date:""});
  const dl=proj.deadlines||[];
  const addDl=()=>{if(!nm.label||!nm.date)return;updProj({...proj,deadlines:[...dl,{id:uid(),...nm,done:false}]});setNm({label:"",date:""});setAdding(false);};
  return(
    <div style={{borderBottom:`1px solid ${T.bd}`,padding:"6px 10px"}}>
      <div style={{fontSize:7,color:T.ac,fontFamily:"monospace",marginBottom:4,letterSpacing:"0.1em"}}>⚡ FRISTEN / ДЕДЛАЙНЫ</div>
      {dl.filter(d=>!d.done).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>{
        const n=daysLeft(d.date);const c=fristColor(n);
        return(<div key={d.id} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:c,flexShrink:0}}/>
          <div style={{flex:1,fontSize:8,color:T.dm,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={d.label}>{d.label}</div>
          <div style={{fontSize:7,color:c,fontFamily:"monospace",flexShrink:0}}>{n<=0?"HEUTE":n+"d"}</div>
          <button onClick={()=>updProj({...proj,deadlines:dl.map(x=>x.id===d.id?{...x,done:true}:x)})} style={{background:"none",border:"none",color:T.fa,cursor:"pointer",fontSize:9,flexShrink:0}}>✓</button>
        </div>);
      })}
      {!dl.filter(d=>!d.done).length&&<div style={{fontSize:8,color:T.fa,fontStyle:"italic"}}>Нет дедлайнов</div>}
      {adding?(
        <div style={{marginTop:4}}>
          <input value={nm.label} onChange={e=>setNm(p=>({...p,label:e.target.value}))} placeholder="Название..." style={{width:"100%",background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"3px 5px",fontSize:8,color:T.tx,outline:"none",boxSizing:"border-box",marginBottom:3}}/>
          <div style={{display:"flex",gap:3}}>
            <input type="date" value={nm.date} onChange={e=>setNm(p=>({...p,date:e.target.value}))} style={{flex:1,background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"3px 5px",fontSize:8,color:T.tx,outline:"none"}}/>
            <button onClick={addDl} style={{background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:3,color:T.ai,padding:"0 6px",cursor:"pointer",fontSize:8}}>✓</button>
            <button onClick={()=>setAdding(false)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:3,color:T.dm,padding:"0 5px",cursor:"pointer",fontSize:8}}>✕</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setAdding(true)} style={{marginTop:4,background:"none",border:`1px dashed ${T.bd2}`,borderRadius:3,color:T.fa,padding:"2px 6px",cursor:"pointer",fontSize:8,width:"100%"}}>+ Frist</button>
      )}
    </div>
  );
}
// ═══ KNOWLEDGE GRAPH ══════════════════════════════════════════════
function KnowledgeGraph({proj,T,dark,onNavigate,onAutoLinks,loadingLinks}){
  const svgRef=useRef(null);const[sel,setSel]=useState(null);
  const nodes=useMemo(()=>{
    const ns=[];const cW2=180;const bH=56;const padX=60;const padY=50;
    proj.chapters.forEach((ch,ci)=>{
      ch.blocks.forEach((b,bi)=>{
        ns.push({id:b.id,chId:ch.id,chIdx:ci,bIdx:bi,text:b.text.slice(0,45),x:padX+ci*cW2,y:padY+bi*bH,tags:b.tags,bookmarked:b.bookmarked});
      });
    });
    return ns;
  },[proj]);
  const links=proj.graphLinks||[];
  const svgW=Math.max(600,(proj.chapters.length)*180+120);
  const svgH=Math.max(400,Math.max(...proj.chapters.map(c=>c.blocks.length))*56+100);
  const nodeById=id=>nodes.find(n=>n.id===id);
  const bezier=(n1,n2)=>{if(!n1||!n2)return"";const mx=(n1.x+n2.x)/2;return `M${n1.x+70},${n1.y+20} C${mx},${n1.y+20} ${mx},${n2.y+20} ${n2.x},${n2.y+20}`;};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"8px 0 8px",display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
        <span style={{fontSize:10,color:T.gr,fontFamily:"monospace"}}>◉ ГРАФ ЗНАНИЙ</span>
        <span style={{fontSize:8,color:T.dm}}>{nodes.length} узлов · {links.length} связей</span>
        <button onClick={onAutoLinks} disabled={loadingLinks} style={{background:T.grBg,border:`1px solid ${T.grBd}`,borderRadius:4,color:T.gr,padding:"3px 9px",cursor:loadingLinks?"default":"pointer",fontSize:8,fontFamily:"monospace",opacity:loadingLinks?0.5:1}}>
          {loadingLinks?"⟳ AI ищет связи…":"◈ AI: найти связи"}
        </button>
        {sel&&<span style={{fontSize:8,color:T.ac}}>Выбрано: {nodeById(sel)?.text.slice(0,30)}…</span>}
        {sel&&<button onClick={()=>setSel(null)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:3,color:T.dm,padding:"2px 5px",cursor:"pointer",fontSize:8}}>✕</button>}
      </div>
      <div style={{flex:1,overflowX:"auto",overflowY:"auto",background:dark?"#050808":"#f8f4ee",border:`1px solid ${T.bd}`,borderRadius:6}}>
        <svg ref={svgRef} width={svgW} height={svgH} style={{display:"block"}}>
          {proj.chapters.map((ch,ci)=>(
            <text key={ch.id} x={60+ci*180+70} y={22} textAnchor="middle" fontSize={9} fill={T.ac} fontFamily="monospace" fontWeight="bold">{ch.title.slice(0,20)}</text>
          ))}
          {links.map((lk,i)=>{
            const n1=nodeById(lk.from);const n2=nodeById(lk.to);if(!n1||!n2)return null;
            const c=lk.strength>0.7?"#4a9a4a":lk.strength>0.4?"#c9a84c":"#7a7aaa";
            return(<g key={i}>
              <path d={bezier(n1,n2)} fill="none" stroke={c} strokeWidth={lk.strength>0.7?2:1} strokeDasharray={lk.strength>0.7?"none":"4 3"} opacity={0.7}/>
              {lk.label&&<text x={(n1.x+n2.x)/2+70} y={(n1.y+n2.y)/2+14} fontSize={7} fill={c} textAnchor="middle" opacity={0.9}>{lk.label.slice(0,18)}</text>}
            </g>);
          })}
          {nodes.map(n=>{
            const isS=sel===n.id;const bCol=n.tags.length>0?TAG_COLORS[n.tags[0]]:T.bd2;
            const bg=isS?(dark?"#1a2a1a":"#e0f0e0"):dark?"#0e0e0e":"#fff";
            return(<g key={n.id} style={{cursor:"pointer"}}
              onClick={()=>{setSel(isS?null:n.id);onNavigate(n.chId);}}>
              <rect x={n.x} y={n.y} width={140} height={40} rx={5} fill={bg} stroke={isS?T.ai:bCol} strokeWidth={isS?2:1}/>
              {n.bookmarked&&<text x={n.x+126} y={n.y+14} fontSize={8} fill={T.ac}>★</text>}
              <text x={n.x+8} y={n.y+15} fontSize={8} fill={T.dm} fontFamily="monospace">блок {n.bIdx+1}</text>
              <foreignObject x={n.x+4} y={n.y+18} width={130} height={20}>
                <div style={{fontSize:8,color:isS?T.ai:T.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:"12px"}}>{n.text}</div>
              </foreignObject>
            </g>);
          })}
        </svg>
      </div>
      <div style={{paddingTop:8,fontSize:8,color:T.dm}}>Клик по узлу — переход к главе. AI находит смысловые связи между абзацами автоматически.</div>
    </div>
  );
}
// ═══ BUDGET CALCULATOR ════════════════════════════════════════════
function BudgetCalc({T}){
  const CATS=[
    {key:"pflege",label:"Körperpflege / Личный уход",unit:"ч/день",rate:22},
    {key:"mobil",label:"Mobilität / Мобильность",unit:"ч/день",rate:18},
    {key:"haus",label:"Hauswirtschaft / Хозяйство",unit:"ч/нед",rate:15},
    {key:"sozial",label:"Soziale Teilhabe / Участие",unit:"ч/нед",rate:16},
    {key:"komm",label:"Kommunikation / Коммуникация",unit:"ч/нед",rate:14},
  ];
  const [vals,setVals]=useState({pflege:2,mobil:1,haus:3,sozial:4,komm:2});
  const [rates,setRates]=useState({pflege:22,mobil:18,haus:15,sozial:16,komm:14});
  const setV=(k,v)=>setVals(p=>({...p,[k]:Number(v)||0}));
  const setR=(k,v)=>setRates(p=>({...p,[k]:Number(v)||0}));
  const monthly=(k)=>{
    const isDay=CATS.find(c=>c.key===k)?.unit.includes("день");
    return Math.round((isDay?vals[k]*30:vals[k]*4.33)*rates[k]);
  };
  const total=CATS.reduce((s,c)=>s+monthly(c.key),0);
  return(
    <div style={{background:T.sf2,border:`1px solid ${T.grBd}`,borderRadius:8,padding:"14px",maxWidth:600}}>
      <div style={{fontSize:10,color:T.gr,fontFamily:"monospace",marginBottom:12,letterSpacing:"0.08em"}}>💰 РАСЧЁТ ПЕРСОНАЛЬНОГО БЮДЖЕТА § 29 SGB IX</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:9}}>
        <thead>
          <tr>{["Услуга","Объём","ед.","Ставка €","В месяц €"].map(h=><th key={h} style={{textAlign:"left",padding:"3px 5px",color:T.dm,borderBottom:`1px solid ${T.bd}`,fontWeight:"normal",fontFamily:"monospace",fontSize:8}}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {CATS.map(c=>(
            <tr key={c.key}>
              <td style={{padding:"4px 5px",color:T.tx,fontSize:9}}>{c.label}</td>
              <td style={{padding:"4px 5px"}}><input type="number" min="0" step="0.5" value={vals[c.key]} onChange={e=>setV(c.key,e.target.value)} style={{width:50,background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"2px 5px",color:T.tx,fontSize:9,outline:"none"}}/></td>
              <td style={{padding:"4px 5px",color:T.dm,fontSize:8}}>{c.unit}</td>
              <td style={{padding:"4px 5px"}}><input type="number" min="0" value={rates[c.key]} onChange={e=>setR(c.key,e.target.value)} style={{width:45,background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"2px 5px",color:T.tx,fontSize:9,outline:"none"}}/></td>
              <td style={{padding:"4px 5px",color:T.ac,fontFamily:"monospace",fontWeight:"bold",textAlign:"right"}}>{monthly(c.key).toLocaleString("de-DE")} €</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{borderTop:`1px solid ${T.bd}`,marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontSize:8,color:T.dm}}>Итого в месяц:</span>
          <span style={{fontSize:14,color:T.ac,fontFamily:"monospace",marginLeft:8,fontWeight:"bold"}}>{total.toLocaleString("de-DE")} €</span>
        </div>
        <div>
          <span style={{fontSize:8,color:T.dm}}>В год:</span>
          <span style={{fontSize:11,color:T.ac,fontFamily:"monospace",marginLeft:8}}>{(total*12).toLocaleString("de-DE")} €</span>
        </div>
      </div>
      <div style={{marginTop:8,fontSize:8,color:T.dm,lineHeight:1.6}}>
        Ставки — примерные для Sachsen 2026. § 29 Abs. 3 SGB IX: сумма бюджета не должна быть меньше стоимости эквивалентных натуральных услуг.
      </div>
    </div>
  );
}
// ═══ SPLIT VIEW ═══════════════════════════════════════════════════
function SplitView({projects,T,dark,activePid,setActivePid}){
  const [pid1,setPid1]=useState(activePid);
  const [pid2,setPid2]=useState(projects[1]?.id||projects[0].id);
  const [chId1,setCh1]=useState(null);const [chId2,setCh2]=useState(null);
  const p1=projects.find(p=>p.id===pid1)||projects[0];
  const p2=projects.find(p=>p.id===pid2)||projects[0];
  const ch1=p1.chapters.find(c=>c.id===chId1)||p1.chapters[0];
  const ch2=p2.chapters.find(c=>c.id===chId2)||p2.chapters[0];
  const Panel=({proj,ch,setCh,pid,setPid})=>(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
      <div style={{background:T.sf2,borderBottom:`1px solid ${T.bd}`,padding:"5px 10px",display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
        <select value={pid} onChange={e=>setPid(e.target.value)} style={{background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,color:T.tx,fontSize:9,padding:"2px 5px",flex:1,outline:"none"}}>
          {projects.map(p=><option key={p.id} value={p.id}>{p.title.slice(0,40)}</option>)}
        </select>
      </div>
      <div style={{background:T.sf,borderBottom:`1px solid ${T.bd}`,padding:"4px 10px",display:"flex",gap:3,flexWrap:"wrap",flexShrink:0}}>
        {proj.chapters.map(c=><button key={c.id} onClick={()=>setCh(c.id)} style={{background:ch?.id===c.id?T.sf2:"none",border:`1px solid ${ch?.id===c.id?T.bd2:"transparent"}`,borderRadius:3,color:ch?.id===c.id?T.tx:T.dm,padding:"2px 6px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>{c.title.slice(0,16)}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>
        <div style={{fontSize:8,color:T.dm,fontFamily:"monospace",marginBottom:10}}>{ch?.title}</div>
        {(ch?.blocks||[]).map(b=>(
          <div key={b.id} style={{marginBottom:12,paddingLeft:7,borderLeft:`2px solid ${T.bd}`}}>
            <p style={{fontSize:12,lineHeight:1.8,color:T.tx,margin:0,fontWeight:b.fmt?.bold?"bold":"normal",fontStyle:b.fmt?.italic?"italic":"normal"}}>{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
  return(
    <div style={{display:"flex",flex:1,overflow:"hidden",gap:0}}>
      <Panel proj={p1} ch={ch1} setCh={setCh1} pid={pid1} setPid={setPid1}/>
      <div style={{width:1,background:T.bd2,flexShrink:0}}/>
      <Panel proj={p2} ch={ch2} setCh={setCh2} pid={pid2} setPid={setPid2}/>
    </div>
  );
}

// ═══ MAIN APP ═════════════════════════════════════════════════════
export default function WritingOS(){
  const[dark,setDark]=useState(true);const T=MK(dark);
  const[projects,setProjects]=useState(INIT);const[ready,setReady]=useState(false);
  const[saveStatus,setSave]=useState("saved");
  const[activePid,setActivePid]=useState("proj-1");
  const[activeChId,setChId]=useState(INIT[0].chapters[0].id);
  const[panel,setPanel]=useState(null);const[aiRole,setAiRole]=useState("editor");
  const[view,setView]=useState("doc");
  const[globalChat,setGChat]=useState([]);const[globalMsg,setGMsg]=useState("");const[globalLoad,setGLoad]=useState(false);const[showGlobal,setShowGlobal]=useState(false);
  const[msg,setMsg]=useState("");const[loading,setLoading]=useState(false);
  const[listening,setListening]=useState(false);
  const[searchQ,setSearchQ]=useState("");const[searchOpen,setSearch]=useState(false);
  const[findOpen,setFindOpen]=useState(false);const[findQ,setFindQ]=useState("");const[replQ,setReplQ]=useState("");const[findRes,setFindRes]=useState([]);const[replMsg,setReplMsg]=useState("");
  const[tagFilter,setTagFilter]=useState(null);const[showBm,setShowBm]=useState(false);
  const[showTpl,setShowTpl]=useState(false);const[fullEdit,setFullEdit]=useState(null);
  const[selBubble,setSelBubble]=useState(null);
  const[addingCh,setAddingCh]=useState(false);const[newChName,setNewChName]=useState("");
  const[fnModal,setFnModal]=useState(null);const[newFn,setNewFn]=useState("");
  const[showBiblio,setShowBiblio]=useState(false);const[newSrc,setNewSrc]=useState("");
  const[corrMode,setCorrMode]=useState(false);
  const[showPomo,setPomo]=useState(false);
  const[showTOC,setShowTOC]=useState(false);const[tocLoading,setTocLoading]=useState(false);
  const[linksLoading,setLinksLoading]=useState(false);
  const[showBudget,setShowBudget]=useState(false);
  const inputRef=useRef(null);const recRef=useRef(null);const fileRef=useRef(null);const dragRef=useRef(null);
  // ── Persistence
  useEffect(()=>{(async()=>{try{const r=await window.storage.get("wos7");if(r?.value)setProjects(JSON.parse(r.value));const c=await window.storage.get("wos7-gc");if(c?.value)setGChat(JSON.parse(c.value));}catch(_){}setReady(true);})();},[]);
  useEffect(()=>{if(!ready)return;setSave("saving");const t=setTimeout(async()=>{try{await window.storage.set("wos7",JSON.stringify(projects));await window.storage.set("wos7-gc",JSON.stringify(globalChat.slice(-60)));await window.storage.set(`wos7-bk-${new Date().toISOString().slice(0,10)}`,JSON.stringify(projects));setSave("saved");}catch(_){setSave("error");}},700);return()=>clearTimeout(t);},[projects,globalChat,ready]);
  // ── Derived
  const proj=projects.find(p=>p.id===activePid)||projects[0];
  const allBlk=proj.chapters.flatMap(c=>c.blocks);
  const activeCh=proj.chapters.find(c=>c.id===activeChId)||proj.chapters[0];
  const getBlock=id=>allBlk.find(b=>b.id===id);
  const wordCount=allBlk.reduce((a,b)=>a+cW(b.text),0);
  const fnCount=allBlk.reduce((a,b)=>a+(b.footnotes?.length||0),0);
  const totalAI=allBlk.reduce((a,b)=>a+b.aiReplies.length,0);
  const bookmarks=allBlk.filter(b=>b.bookmarked);
  const matches=searchQ.trim().length>1?allBlk.filter(b=>b.text.toLowerCase().includes(searchQ.toLowerCase())):[];
  useEffect(()=>{if(proj&&!proj.chapters.find(c=>c.id===activeChId))setChId(proj.chapters[0]?.id||"");},[activePid]);
  // ── Updaters
  const updProj=useCallback((pid,fn)=>setProjects(ps=>ps.map(p=>p.id===pid?fn(p):p)),[]);
  const updBlock=useCallback((bid,fn)=>setProjects(ps=>ps.map(p=>p.id!==activePid?p:{...p,chapters:p.chapters.map(ch=>({...ch,blocks:ch.blocks.map(b=>b.id===bid?fn(b):b)}))})),[activePid]);
  const updProjDirect=p=>setProjects(ps=>ps.map(x=>x.id===activePid?p:x));
  // ── Templates
  const createTpl=(key,group)=>{
    const tpl=(group==="legal"?LEGAL_TPLS:GEN_TPLS)[key];
    const p={id:uid(),title:tpl.label.replace(/^[^ ]+ /,""),created:new Date().toISOString().slice(0,10),template:key,milestones:[],bibliography:[],toc:"",graphLinks:[],deadlines:[],chapters:tpl.chapters.map(ch=>mkCh(ch.title,ch.blocks))};
    setProjects(ps=>[...ps,p]);setActivePid(p.id);setChId(p.chapters[0].id);setShowTpl(false);
  };
  const importFile=e=>{const file=e.target.files[0];if(!file)return;const rd=new FileReader();rd.onload=ev=>{const text=ev.target.result;const chapters=[];let cur=null;for(const line of text.split("\n")){if(/^#{1,2} /.test(line)){cur={id:uid(),title:line.replace(/^#+\s*/,""),blocks:[]};chapters.push(cur);}else if(line.trim()){if(!cur){cur={id:uid(),title:"Текст",blocks:[]};chapters.push(cur);}cur.blocks.push(mkB(line.trim()));}}if(!chapters.length){chapters.push({id:uid(),title:"Импорт",blocks:text.split(/\n\n+/).filter(Boolean).map(t=>mkB(t.trim()))});}const p={id:uid(),title:file.name.replace(/\.(txt|md)$/i,""),created:new Date().toISOString().slice(0,10),template:null,milestones:[],bibliography:[],toc:"",graphLinks:[],deadlines:[],chapters};setProjects(ps=>[...ps,p]);setActivePid(p.id);setChId(p.chapters[0].id);};rd.readAsText(file);e.target.value="";};
  // ── Claude API
  const callAI=async(sys,usr)=>{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:sys,messages:[{role:"user",content:usr}]})});const d=await res.json();return d.content?.[0]?.text||"Ошибка.";};
  // AI auto-links
  const autoLinks=async()=>{
    setLinksLoading(true);
    try{
      const blks=allBlk.map((b,i)=>({i,id:b.id,text:b.text.slice(0,120)}));
      const sys=`Ты аналитик текста. Найди смысловые связи между абзацами. Верни ТОЛЬКО JSON массив: [{"from":"id1","to":"id2","label":"краткое_описание","strength":0.85}]. Максимум 15 связей. Strength от 0.1 до 1.0. Никакого другого текста кроме JSON.`;
      const ans=await callAI(sys,JSON.stringify(blks.map(b=>({id:b.id,text:b.text}))));
      const clean=ans.replace(/```json|```/g,"").trim();
      const links=JSON.parse(clean);
      updProj(activePid,p=>({...p,graphLinks:links}));
      setView("graph");
    }catch(_){alert("Ошибка автосвязей. Попробуйте ещё раз.");}
    setLinksLoading(false);
  };
  // AI TOC
  const generateTOC=async()=>{
    setTocLoading(true);
    try{
      const struct=proj.chapters.map(ch=>`## ${ch.title}\n${ch.blocks.map((b,i)=>`${i+1}. ${b.text.slice(0,80)}`).join("\n")}`).join("\n\n");
      const sys=`Ты литературный редактор. Сгенерируй оглавление документа на основе структуры. Формат: нумерованный список. По-русски. Только оглавление.`;
      const toc=await callAI(sys,`Структура документа "${proj.title}":\n${struct}`);
      updProj(activePid,p=>({...p,toc}));
      setShowTOC(true);
    }catch(_){}
    setTocLoading(false);
  };
  // Per-block AI
  const askClaude=async()=>{if(!msg.trim()||!panel)return;const block=getBlock(panel.blockId);const q=msg;setMsg("");setLoading(true);const sys=`${AI_ROLES[aiRole].sys}\n\nДокумент: "${proj.title}"\nАбзац: "${block?.text}"`;try{const answer=await callAI(sys,q);updBlock(panel.blockId,b=>({...b,aiReplies:[...b.aiReplies,{id:uid(),q,answer,role:aiRole,ts:now_()}]}));}catch(_){updBlock(panel.blockId,b=>({...b,aiReplies:[...b.aiReplies,{id:uid(),q,answer:"⚠ Ошибка API.",role:aiRole,ts:now_()}]}));}setLoading(false);};
  const suggestCorr=async(bid)=>{const block=getBlock(bid);if(!block)return;setLoading(true);try{const suggestion=await callAI(`Исправь текст — стиль, грамматику, ясность. Верни ТОЛЬКО исправленный текст.`,block.text);updBlock(bid,b=>({...b,corrections:[...(b.corrections||[]),{id:uid(),original:b.text,suggestion,ts:now_(),status:"pending"}]}));setPanel({blockId:bid,mode:"ai"});}catch(_){}setLoading(false);};
  const applyCorr=(bid,corrId,accept)=>{updBlock(bid,b=>{const corr=b.corrections.find(c=>c.id===corrId);if(!corr)return b;const nc=b.corrections.map(c=>c.id===corrId?{...c,status:accept?"accepted":"rejected"}:c);if(accept)return{...b,text:corr.suggestion,versions:[...b.versions,{text:b.text,version:b.version,ts:now_()}],version:b.version+1,corrections:nc};return{...b,corrections:nc};});};
  const translateBlock=async(bid,lang)=>{const block=getBlock(bid);if(!block)return;setLoading(true);try{const answer=await callAI(`Переведи на ${lang==="de"?"немецкий":lang==="en"?"английский":"русский"} точно, сохраняя терминологию. Только перевод.`,block.text);updBlock(bid,b=>({...b,aiReplies:[...b.aiReplies,{id:uid(),q:`🌐 → ${lang.toUpperCase()}`,answer,role:"translate",ts:now_()}]}));setPanel({blockId:bid,mode:"ai"});}catch(_){}setLoading(false);};
  const sendGlobal=async()=>{if(!globalMsg.trim()||globalLoad)return;const q=globalMsg;setGMsg("");setGLoad(true);const fullTxt=proj.chapters.map(ch=>`## ${ch.title}\n${ch.blocks.map(b=>b.text).join("\n")}`).join("\n\n");setGChat(prev=>[...prev,{id:uid(),role:"user",text:q,ts:now_()}]);try{const answer=await callAI(`Ты ИИ-ассистент. Документ: "${proj.title}". Отвечай по-русски конкретно.`,`Документ:\n${fullTxt}\n\nВопрос: ${q}`);setGChat(prev=>[...prev,{id:uid(),role:"ai",text:answer,ts:now_()}]);}catch(_){setGChat(prev=>[...prev,{id:uid(),role:"ai",text:"⚠ Ошибка.",ts:now_()}]);}setGLoad(false);};
  const addSource=async()=>{if(!newSrc.trim())return;let formatted=newSrc;try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,system:"Отформатируй библ. ссылку в ГОСТ/APA. Только строку.",messages:[{role:"user",content:newSrc}]})});const d=await res.json();formatted=d.content?.[0]?.text||newSrc;}catch(_){}updProj(activePid,p=>({...p,bibliography:[...(p.bibliography||[]),{id:uid(),raw:newSrc,formatted}]}));setNewSrc("");};
  const addFn=()=>{if(!newFn.trim()||!fnModal)return;updBlock(fnModal.blockId,b=>({...b,footnotes:[...(b.footnotes||[]),{id:uid(),text:newFn}]}));setNewFn("");setFnModal(null);};
  const acceptAI=(bid,ans)=>updBlock(bid,b=>({...b,versions:[...b.versions,{text:b.text,version:b.version,ts:now_()}],text:b.text+"\n\n"+ans,version:b.version+1}));
  const addNote=()=>{if(!msg.trim()||!panel)return;updBlock(panel.blockId,b=>({...b,comments:[...b.comments,{id:uid(),text:msg,ts:now_()}]}));setMsg("");};
  const toggleTag=(bid,i)=>updBlock(bid,b=>({...b,tags:b.tags.includes(i)?b.tags.filter(t=>t!==i):[...b.tags,i]}));
  const toggleFmt=(bid,k)=>updBlock(bid,b=>({...b,fmt:{...b.fmt,[k]:!b.fmt?.[k]}}));
  const toggleBm=(bid)=>updBlock(bid,b=>({...b,bookmarked:!b.bookmarked}));
  const addChapter=()=>{if(!newChName.trim())return;const ch=mkCh(newChName);updProj(activePid,p=>({...p,chapters:[...p.chapters,ch]}));setChId(ch.id);setNewChName("");setAddingCh(false);};
  const handleSel=bid=>{const sel=window.getSelection();if(!sel||sel.isCollapsed||!sel.toString().trim())return;const txt=sel.toString().trim();const rect=sel.getRangeAt(0).getBoundingClientRect();setSelBubble({blockId:bid,text:txt,x:rect.left+rect.width/2,y:rect.top-8});};
  const saveInline=text=>{if(!selBubble||!text.trim())return;updBlock(selBubble.blockId,b=>({...b,inlineComments:[...(b.inlineComments||[]),{id:uid(),selected:selBubble.text,comment:text,ts:now_()}]}));setSelBubble(null);};
  const doFind=()=>{if(!findQ.trim()){setFindRes([]);return;}setFindRes(allBlk.filter(b=>b.text.toLowerCase().includes(findQ.toLowerCase())).map(b=>({...b,chTitle:proj.chapters.find(c=>c.blocks.some(x=>x.id===b.id))?.title})));};
  const doReplace=()=>{if(!findQ.trim())return;let count=0;setProjects(ps=>ps.map(p=>p.id!==activePid?p:{...p,chapters:p.chapters.map(ch=>({...ch,blocks:ch.blocks.map(b=>{if(!b.text.toLowerCase().includes(findQ.toLowerCase()))return b;const nt=b.text.replace(new RegExp(findQ.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),replQ);count++;return{...b,text:nt,versions:[...b.versions,{text:b.text,version:b.version,ts:now_()}],version:b.version+1};})}))}));setReplMsg(`Заменено: ${count}`);doFind();setTimeout(()=>setReplMsg(""),3000);};
  const onDragStart=(e,chId,idx)=>{dragRef.current={chId,idx};e.dataTransfer.effectAllowed="move";};
  const onDragOver=e=>{e.preventDefault();e.dataTransfer.dropEffect="move";};
  const onDrop=(e,chId,idx)=>{e.preventDefault();const from=dragRef.current;if(!from||from.chId!==chId)return;updProj(activePid,p=>({...p,chapters:p.chapters.map(ch=>{if(ch.id!==chId)return ch;const bl=[...ch.blocks];const[mv]=bl.splice(from.idx,1);bl.splice(idx,0,mv);return{...ch,blocks:bl};})}));dragRef.current=null;};
  const toggleVoice=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert("Недоступно");return;}if(listening){recRef.current?.stop();setListening(false);return;}const r=new SR();r.lang="ru-RU";r.continuous=false;r.interimResults=false;r.onresult=e=>setMsg(p=>p+e.results[0][0].transcript);r.onend=()=>setListening(false);r.start();recRef.current=r;setListening(true);};
  if(!ready)return(<div style={{background:"#080808",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#222",fontFamily:"monospace"}}>загрузка...</div>);
  const saveC=saveStatus==="saving"?T.ac:saveStatus==="error"?"#9a4a4a":T.ai;
  const VIEWS=[{k:"doc",i:"≡"},{k:"graph",i:"◉"},{k:"split",i:"⊟"},{k:"timeline",i:"⏱"},{k:"history",i:"⏪"}];

  return(
    <div style={{fontFamily:"'Palatino Linotype',Palatino,Georgia,serif",background:T.bg,minHeight:"100vh",color:T.tx,display:"flex",flexDirection:"column",transition:"background .3s"}}>
      {/* ── TOPBAR */}
      <div style={{background:T.sf,borderBottom:`1px solid ${T.bd}`,padding:"0 11px",display:"flex",alignItems:"center",gap:5,height:44,flexShrink:0,zIndex:30}}>
        <div style={{width:18,height:18,background:`linear-gradient(135deg,${T.ac},#5a3608)`,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:"bold",color:"#fff",fontFamily:"monospace"}}>OS</div>
        <span style={{fontSize:8,color:T.dm,fontFamily:"monospace",letterSpacing:"0.07em"}}>v7</span>
        <span style={{fontSize:7,color:saveC,fontFamily:"monospace"}}>{saveStatus==="saving"?"●":"✓"}</span>
        <div style={{width:1,height:16,background:T.bd,margin:"0 3px"}}/>
        {VIEWS.map(v=>(
          <button key={v.k} onClick={()=>setView(v.k)} title={v.k} style={{background:view===v.k?(dark?"#181818":"#ede5d0"):"none",border:`1px solid ${view===v.k?T.bd2:"transparent"}`,borderRadius:3,padding:"2px 7px",cursor:"pointer",fontSize:10,color:view===v.k?T.ac:T.dm}}>{v.i}</button>
        ))}
        <div style={{width:1,height:16,background:T.bd,margin:"0 3px"}}/>
        {searchOpen&&<input value={searchQ} onChange={e=>setSearchQ(e.target.value)} autoFocus placeholder="Поиск..." style={{background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"2px 8px",fontSize:10,color:T.tx,outline:"none",width:150}}/>}
        {[
          {i:"⌕",a:searchOpen,fn:()=>{setSearch(v=>!v);setSearchQ("");}},
          {i:"⌦",a:findOpen,fn:()=>setFindOpen(v=>!v),t:"Найти и заменить"},
          {i:"★",a:showBm,fn:()=>setShowBm(v=>!v),t:"Закладки"},
          {i:"💬",a:showGlobal,fn:()=>setShowGlobal(v=>!v),t:"AI-чат документ"},
          {i:"✎",a:corrMode,fn:()=>setCorrMode(v=>!v),t:"Режим корректуры"},
          {i:"🍅",a:showPomo,fn:()=>setPomo(v=>!v),t:"Pomodoro"},
          {i:"§₂₉",a:showBudget,fn:()=>setShowBudget(v=>!v),t:"Калькулятор § 29"},
          {i:"📚",a:showBiblio,fn:()=>setShowBiblio(v=>!v),t:"Библиография"},
          {i:tocLoading?"⟳ ОГЛ":"⊞ ОГЛ",a:false,fn:generateTOC,t:"AI: оглавление"},
          {i:"↓DOC",a:false,fn:()=>exportDOC(proj)},
          {i:"↓PDF",a:false,fn:()=>exportPDF(proj)},
          {i:"↓ПАК",a:false,fn:()=>exportCasePackage(projects),t:"Пакет дела"},
          {i:dark?"☀":"☾",a:false,fn:()=>setDark(v=>!v)},
        ].map((b,i)=>(
          <button key={i} title={b.t} onClick={b.fn} style={{background:b.a?(dark?"#181818":"#ede5d0"):"none",border:`1px solid ${b.a?T.bd2:"transparent"}`,borderRadius:3,padding:"2px 6px",cursor:"pointer",fontSize:9,color:b.a?T.ac:T.dm,fontFamily:"monospace",transition:"all .15s",whiteSpace:"nowrap"}}>{b.i}</button>
        ))}
        <div style={{flex:1}}/>
        <span style={{fontSize:7,color:T.fa,fontFamily:"monospace",padding:"1px 4px",border:`1px solid ${T.bd}`,borderRadius:3}}>{wordCount}сл</span>
        {fnCount>0&&<span style={{fontSize:7,color:T.fn,fontFamily:"monospace",padding:"1px 4px",border:`1px solid ${T.fnBd}`,borderRadius:3}}>{fnCount}сн</span>}
      </div>
      {/* ── POMODORO BAR */}
      {showPomo&&<div style={{background:T.sf2,borderBottom:`1px solid ${T.bd}`,padding:"5px 12px",display:"flex",gap:10,alignItems:"center",flexShrink:0}}><Pomodoro T={T}/><span style={{fontSize:8,color:T.dm}}>Закрой вкладки · пиши до сигнала · {totalAI} диалогов сохранено</span></div>}
      {/* ── FIND & REPLACE */}
      {findOpen&&(
        <div style={{background:T.sf2,borderBottom:`1px solid ${T.bd}`,padding:"6px 12px",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",zIndex:20}}>
          <input value={findQ} onChange={e=>setFindQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doFind()} placeholder="Найти..." style={{background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"3px 7px",fontSize:10,color:T.tx,outline:"none",width:140}}/>
          <input value={replQ} onChange={e=>setReplQ(e.target.value)} placeholder="Заменить..." style={{background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"3px 7px",fontSize:10,color:T.tx,outline:"none",width:140}}/>
          <Btn c={T.ai} bg={T.aiBg} bd={T.aiBd} onClick={doFind}>Найти</Btn>
          <Btn c={T.nt} bg={T.ntBg} bd={T.ntBd} onClick={doReplace}>Заменить всё</Btn>
          {replMsg&&<span style={{fontSize:8,color:T.ai,fontFamily:"monospace"}}>{replMsg}</span>}
          {findRes.length>0&&<span style={{fontSize:8,color:T.dm,fontFamily:"monospace"}}>{findRes.length} результатов</span>}
          {findRes.slice(0,5).map(b=>(<div key={b.id} onClick={()=>{const ch=proj.chapters.find(c=>c.blocks.some(x=>x.id===b.id));if(ch)setChId(ch.id);}} style={{fontSize:8,color:T.dm,cursor:"pointer",padding:"2px 6px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:3}}>{b.chTitle} · {b.text.slice(0,30)}…</div>))}
        </div>
      )}
      {/* ── MODALS */}
      {selBubble&&<SelBubble bubble={selBubble} T={T} onSave={saveInline} onClose={()=>setSelBubble(null)}/>}
      {fullEdit&&<FullEdit blockId={fullEdit} T={T} dark={dark} getBlock={getBlock} onSave={text=>{updBlock(fullEdit,b=>({...b,text}));setFullEdit(null);}} onClose={()=>setFullEdit(null)}/>}
      {fnModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:55,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setFnModal(null)}>
          <div style={{background:T.sf,border:`1px solid ${T.fn}`,borderRadius:8,padding:20,width:360}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:9,color:T.fn,fontFamily:"monospace",marginBottom:7}}>¹ СНОСКА / FUßNOTE</div>
            <textarea value={newFn} onChange={e=>setNewFn(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addFn();}}}
              placeholder="Текст сноски..." style={{width:"100%",background:T.ip,border:`1px solid ${T.fnBd}`,borderRadius:4,padding:"7px",fontSize:10,color:T.tx,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.5,minHeight:70,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:6,marginTop:7}}>
              <button onClick={addFn} style={{flex:1,padding:"6px",background:T.fnBg,border:`1px solid ${T.fnBd}`,borderRadius:4,color:T.fn,cursor:"pointer",fontSize:9,fontFamily:"monospace"}}>✓ Добавить</button>
              <button onClick={()=>setFnModal(null)} style={{padding:"6px 11px",background:"none",border:`1px solid ${T.bd}`,borderRadius:4,color:T.dm,cursor:"pointer",fontSize:9}}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {showTOC&&proj.toc&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:55,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowTOC(false)}>
          <div style={{background:T.sf,border:`1px solid ${T.ac}`,borderRadius:8,padding:22,width:460,maxHeight:"70vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:9,color:T.ac,fontFamily:"monospace",marginBottom:10}}>⊞ ОГЛАВЛЕНИЕ (AI)</div>
            <pre style={{fontSize:10,color:T.tx,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{proj.toc}</pre>
            <div style={{display:"flex",gap:6,marginTop:12}}>
              <button onClick={()=>navigator.clipboard?.writeText(proj.toc)} style={{flex:1,padding:"6px",background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:4,color:T.ai,cursor:"pointer",fontSize:9,fontFamily:"monospace"}}>⎘ Скопировать</button>
              <button onClick={()=>setShowTOC(false)} style={{padding:"6px 11px",background:"none",border:`1px solid ${T.bd}`,borderRadius:4,color:T.dm,cursor:"pointer",fontSize:9}}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
      {showTpl&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowTpl(false)}>
          <div style={{background:T.sf,border:`1px solid ${T.bd2}`,borderRadius:10,padding:22,width:480,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:10,color:T.tx,marginBottom:12,fontFamily:"monospace"}}>ВЫБЕРИТЕ ШАБЛОН</div>
            <div style={{fontSize:8,color:T.ac,fontFamily:"monospace",marginBottom:7,letterSpacing:"0.1em"}}>⚖ SGB IX / SOZIALGERICHT</div>
            {Object.entries(LEGAL_TPLS).map(([k,tpl])=>(
              <button key={k} onClick={()=>createTpl(k,"legal")} style={{display:"block",width:"100%",textAlign:"left",padding:"9px 11px",background:T.sf2,border:`1px solid ${tpl.color}44`,borderRadius:5,marginBottom:5,cursor:"pointer",color:T.tx}}>
                <div style={{fontSize:10,color:tpl.color,marginBottom:1}}>{tpl.label}</div>
                <div style={{fontSize:7,color:T.dm,fontFamily:"monospace"}}>{tpl.chapters.length} глав</div>
              </button>
            ))}
            <div style={{fontSize:8,color:T.ac,fontFamily:"monospace",marginBottom:7,marginTop:10,letterSpacing:"0.1em"}}>📄 ОБЩИЕ</div>
            {Object.entries(GEN_TPLS).map(([k,tpl])=>(
              <button key={k} onClick={()=>createTpl(k,"general")} style={{display:"block",width:"100%",textAlign:"left",padding:"9px 11px",background:T.sf2,border:`1px solid ${tpl.color}44`,borderRadius:5,marginBottom:5,cursor:"pointer",color:T.tx}}>
                <div style={{fontSize:10,color:tpl.color}}>{tpl.label}</div>
              </button>
            ))}
            <button onClick={()=>setShowTpl(false)} style={{width:"100%",background:"none",border:`1px solid ${T.bd}`,borderRadius:5,color:T.dm,padding:"6px",cursor:"pointer",fontSize:9,marginTop:4}}>Отмена</button>
          </div>
        </div>
      )}

      {/* ── MAIN LAYOUT */}
      <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative"}}>
        {/* ── LEFT NAV */}
        {view!=="split"&&(
        <div style={{width:185,background:T.sf,borderRight:`1px solid ${T.bd}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
          <div style={{borderBottom:`1px solid ${T.bd}`,paddingBottom:5}}>
            <div style={{padding:"8px 10px 3px",fontSize:7,color:T.fa,letterSpacing:"0.15em",fontFamily:"monospace"}}>ПРОЕКТЫ</div>
            {projects.map(p=>(
              <button key={p.id} onClick={()=>{setActivePid(p.id);setChId(p.chapters[0].id);setPanel(null);}} style={{width:"100%",textAlign:"left",padding:"5px 10px",background:activePid===p.id?(dark?"#181818":"#ede5d0"):"transparent",border:"none",borderLeft:`2px solid ${activePid===p.id?T.ac:"transparent"}`,color:activePid===p.id?T.tx:T.dm,cursor:"pointer",fontSize:9,lineHeight:1.3}}>
                <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
              </button>
            ))}
            <div style={{display:"flex",gap:3,padding:"3px 10px"}}>
              <button onClick={()=>setShowTpl(true)} style={{flex:1,background:"none",border:`1px dashed ${T.bd2}`,borderRadius:3,color:T.fa,padding:"3px",cursor:"pointer",fontSize:8}}>+ Шаблон</button>
              <button onClick={()=>fileRef.current?.click()} style={{background:"none",border:`1px dashed ${T.bd2}`,borderRadius:3,color:T.fa,padding:"3px 6px",cursor:"pointer",fontSize:8}}>↑</button>
              <input ref={fileRef} type="file" accept=".txt,.md" style={{display:"none"}} onChange={importFile}/>
            </div>
          </div>
          <DeadlineWidget proj={proj} T={T} updProj={updProjDirect}/>
          {showBm&&bookmarks.length>0&&(
            <div style={{borderBottom:`1px solid ${T.bd}`,padding:"4px 0"}}>
              <div style={{padding:"3px 10px",fontSize:7,color:T.ac,fontFamily:"monospace"}}>★ ЗАКЛАДКИ</div>
              {bookmarks.map(b=>{const ch=proj.chapters.find(c=>c.blocks.some(x=>x.id===b.id));return(<button key={b.id} onClick={()=>{if(ch)setChId(ch.id);}} style={{width:"100%",textAlign:"left",padding:"3px 10px",background:"none",border:"none",color:T.ac,cursor:"pointer",fontSize:8}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.text.slice(0,30)}…</div></button>);})}</div>
          )}
          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{padding:"6px 10px 2px",fontSize:7,color:T.fa,letterSpacing:"0.15em",fontFamily:"monospace"}}>ГЛАВЫ</div>
            {proj.chapters.map(ch=>(
              <button key={ch.id} onClick={()=>setChId(ch.id)} style={{width:"100%",textAlign:"left",padding:"4px 10px",background:activeChId===ch.id?(dark?"#141414":"#f0e8d5"):"transparent",border:"none",borderLeft:`2px solid ${activeChId===ch.id?T.ac:"transparent"}`,color:activeChId===ch.id?T.tx:T.dm,cursor:"pointer",fontSize:9,lineHeight:1.3}}>
                <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.title}</div>
                <div style={{fontSize:6,color:T.fa,marginTop:1,fontFamily:"monospace"}}>{ch.blocks.length}бл·{ch.blocks.reduce((a,b)=>a+(b.footnotes?.length||0),0)}сн</div>
              </button>
            ))}
            {addingCh?(
              <div style={{padding:"3px 10px",display:"flex",gap:3}}>
                <input value={newChName} onChange={e=>setNewChName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addChapter()} autoFocus placeholder="Название..." style={{flex:1,background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"3px 5px",fontSize:8,color:T.tx,outline:"none"}}/>
                <button onClick={addChapter} style={{background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:3,color:T.ai,padding:"0 5px",cursor:"pointer",fontSize:8}}>✓</button>
              </div>
            ):(
              <button onClick={()=>setAddingCh(true)} style={{margin:"3px 10px 4px",background:"none",border:`1px dashed ${T.bd2}`,borderRadius:3,color:T.fa,padding:"3px",cursor:"pointer",fontSize:7,width:"calc(100% - 20px)"}}>+ Глава</button>
            )}
          </div>
          <div style={{borderTop:`1px solid ${T.bd}`,padding:"6px 10px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              {[["Слов",wordCount],["Сносок",fnCount]].map(([l,v])=>(<div key={l} style={{textAlign:"center"}}><div style={{fontSize:10,color:T.ac,fontFamily:"monospace"}}>{v}</div><div style={{fontSize:6,color:T.fa}}>{l}</div></div>))}
            </div>
            <div style={{fontSize:7,color:T.fa,fontFamily:"monospace",marginBottom:3,letterSpacing:"0.08em"}}>РОЛЬ ИИ</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:6}}>
              {Object.entries(AI_ROLES).map(([k,r])=>(<button key={k} onClick={()=>setAiRole(k)} style={{padding:"2px 4px",background:aiRole===k?T.aiBg:"none",border:`1px solid ${aiRole===k?T.aiBd:T.bd}`,borderRadius:3,color:aiRole===k?T.ai:T.dm,cursor:"pointer",fontSize:7,fontFamily:"monospace"}}>{r.label}</button>))}
            </div>
            <div style={{fontSize:7,color:T.fa,fontFamily:"monospace",marginBottom:3,letterSpacing:"0.08em"}}>ТЕГИ</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
              <button onClick={()=>setTagFilter(null)} style={{padding:"1px 4px",background:tagFilter===null?(dark?"#2a2a2a":"#e0d8c0"):"none",border:`1px solid ${T.bd}`,borderRadius:3,color:tagFilter===null?T.tx:T.fa,cursor:"pointer",fontSize:7}}>Все</button>
              {TAG_LABELS.map((l,i)=>(<button key={i} onClick={()=>setTagFilter(tagFilter===i?null:i)} style={{padding:"1px 4px",background:tagFilter===i?TAG_COLORS[i]+"33":"none",border:`1px solid ${tagFilter===i?TAG_COLORS[i]:T.bd}`,borderRadius:3,color:tagFilter===i?TAG_COLORS[i]:T.fa,cursor:"pointer",fontSize:7}}>{l.split(" ")[0]}</button>))}
            </div>
          </div>
        </div>
        )}
        {/* ── SEARCH OVERLAY */}
        {searchOpen&&searchQ.length>1&&(
          <div style={{position:"absolute",top:0,left:185,right:panel||showGlobal?330:0,background:dark?"rgba(8,8,8,.97)":"rgba(243,237,224,.97)",zIndex:15,padding:"8px 18px",borderBottom:`1px solid ${T.bd}`,maxHeight:190,overflowY:"auto"}}>
            <div style={{fontSize:7,color:T.fa,fontFamily:"monospace",marginBottom:4}}>НАЙДЕНО: {matches.length}</div>
            {matches.map(b=>{const ch=proj.chapters.find(c=>c.blocks.some(x=>x.id===b.id));const idx=b.text.toLowerCase().indexOf(searchQ.toLowerCase());return(<div key={b.id} onClick={()=>{setChId(ch.id);setSearch(false);setSearchQ("");}} style={{padding:"4px 7px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:3,marginBottom:2,cursor:"pointer"}}><div style={{fontSize:7,color:T.ac,fontFamily:"monospace",marginBottom:1}}>{ch?.title}</div><div style={{fontSize:9,color:T.dm}}>…{b.text.slice(Math.max(0,idx-20),idx+60)}…</div></div>);})}
            {!matches.length&&<div style={{fontSize:9,color:T.fa}}>Ничего не найдено</div>}
          </div>
        )}
        {/* ── CONTENT AREA */}
        {view==="split"?(
          <SplitView projects={projects} T={T} dark={dark} activePid={activePid} setActivePid={setActivePid}/>
        ):(
        <div style={{flex:1,overflowY:"auto",padding:"22px 30px",display:"flex",flexDirection:"column",minWidth:0}}>
          <h1 style={{fontSize:14,color:T.ac,marginBottom:2,fontWeight:"normal",lineHeight:1.4}}>{proj.title}</h1>
          <div style={{fontSize:7,color:T.fa,fontFamily:"monospace",marginBottom:18,display:"flex",gap:10,flexWrap:"wrap"}}>
            <span>{wordCount} слов</span>
            {fnCount>0&&<span style={{color:T.fn}}>{fnCount} сносок</span>}
            <span>{AI_ROLES[aiRole].label}</span>
            {corrMode&&<span style={{color:T.nt,background:T.ntBg,padding:"1px 5px",borderRadius:3,border:`1px solid ${T.ntBd}`}}>✎ Корректура</span>}
            {(proj.graphLinks||[]).length>0&&<span style={{color:T.gr,background:T.grBg,padding:"1px 5px",borderRadius:3,border:`1px solid ${T.grBd}`}}>◉ {proj.graphLinks.length} связей</span>}
          </div>
          {view==="graph"&&<KnowledgeGraph proj={proj} T={T} dark={dark} onNavigate={chId=>setChId(chId)} onAutoLinks={autoLinks} loadingLinks={linksLoading}/>}
          {view==="timeline"&&<TimelineV proj={proj} T={T} updProj={updProjDirect}/>}
          {view==="history"&&<HistoryV proj={proj} T={T}/>}
          {view==="doc"&&<>
            {showBudget&&<div style={{marginBottom:20}}><BudgetCalc T={T}/></div>}
            <div style={{fontSize:7,color:T.dm,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,fontFamily:"monospace"}}>{activeCh?.title}</div>
            {activeCh?.blocks.filter(b=>tagFilter===null||b.tags.includes(tagFilter)).map((b,idx)=>(
              <BlockC key={b.id} block={b} T={T} dark={dark} idx={idx} corrMode={corrMode}
                isActive={panel?.blockId===b.id} aiRole={aiRole}
                onAI={()=>{setPanel({blockId:b.id,mode:"ai"});setTimeout(()=>inputRef.current?.focus(),80);}}
                onNote={()=>{setPanel({blockId:b.id,mode:"comment"});setTimeout(()=>inputRef.current?.focus(),80);}}
                onAccept={ans=>acceptAI(b.id,ans)} onFullEdit={()=>setFullEdit(b.id)}
                onToggleTag={i=>toggleTag(b.id,i)} onToggleFmt={k=>toggleFmt(b.id,k)}
                onToggleBm={()=>toggleBm(b.id)} onSelect={()=>handleSel(b.id)}
                onAddFn={()=>setFnModal({blockId:b.id})}
                onSuggestCorr={()=>suggestCorr(b.id)}
                onApplyCorr={(corrId,accept)=>applyCorr(b.id,corrId,accept)}
                onTranslate={lang=>translateBlock(b.id,lang)}
                onDragStart={e=>onDragStart(e,activeCh.id,idx)} onDragOver={onDragOver} onDrop={e=>onDrop(e,activeCh.id,idx)}
              />
            ))}
            <button onClick={()=>updProj(activePid,p=>({...p,chapters:p.chapters.map(c=>c.id!==activeChId?c:{...c,blocks:[...c.blocks,mkB()]})}))} style={{marginTop:3,background:"none",border:`1px dashed ${T.bd2}`,borderRadius:4,color:T.fa,padding:"5px",cursor:"pointer",fontSize:9,width:"100%"}}>+ Абзац</button>
            {activeCh&&activeCh.blocks.some(b=>(b.footnotes||[]).length>0)&&(
              <div style={{marginTop:22,borderTop:`1px solid ${T.bd}`,paddingTop:10}}>
                <div style={{fontSize:7,color:T.fn,fontFamily:"monospace",marginBottom:6}}>СНОСКИ / FUßNOTEN</div>
                {(()=>{let n=0;return activeCh.blocks.flatMap(b=>(b.footnotes||[]).map(fn=>{n++;return(<div key={fn.id} style={{display:"flex",gap:7,marginBottom:3}}><span style={{fontSize:8,color:T.fn,fontFamily:"monospace",flexShrink:0}}>[{n}]</span><span style={{fontSize:9,color:T.dm}}>{fn.text}</span></div>);}));})()}
              </div>
            )}
            {showBiblio&&(
              <div style={{marginTop:20,borderTop:`1px solid ${T.bd}`,paddingTop:12}}>
                <div style={{fontSize:7,color:T.ac,fontFamily:"monospace",marginBottom:8,letterSpacing:"0.1em"}}>СПИСОК ЛИТЕРАТУРЫ</div>
                {(proj.bibliography||[]).map((src,i)=>(<div key={src.id} style={{display:"flex",gap:7,marginBottom:5,alignItems:"flex-start"}}><span style={{fontSize:7,color:T.dm,fontFamily:"monospace",flexShrink:0,marginTop:2}}>[{i+1}]</span><span style={{fontSize:9,color:T.tx,lineHeight:1.5,flex:1}}>{src.formatted||src.raw}</span><button onClick={()=>updProj(activePid,p=>({...p,bibliography:(p.bibliography||[]).filter(s=>s.id!==src.id)}))} style={{background:"none",border:"none",color:T.fa,cursor:"pointer",fontSize:9,flexShrink:0}}>×</button></div>))}
                {!(proj.bibliography||[]).length&&<div style={{fontSize:9,color:T.fa,fontStyle:"italic"}}>Нет источников.</div>}
                <div style={{display:"flex",gap:5,marginTop:8}}>
                  <input value={newSrc} onChange={e=>setNewSrc(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSource()} placeholder="Автор, Название, Год... (AI отформатирует)" style={{flex:1,background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"4px 7px",fontSize:9,color:T.tx,outline:"none"}}/>
                  <button onClick={addSource} style={{background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:3,color:T.ai,padding:"4px 9px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>+ AI</button>
                </div>
              </div>
            )}
          </>}
        </div>
        )}

        {/* ── GLOBAL AI CHAT */}
        {showGlobal&&view!=="split"&&(
          <div style={{width:320,background:T.sf,borderLeft:`1px solid ${T.bd}`,display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"8px 11px",borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:8,color:T.ai,fontFamily:"monospace"}}>💬 AI-ЧАТ</span>
              <button onClick={()=>setShowGlobal(false)} style={{marginLeft:"auto",background:"none",border:"none",color:T.fa,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button>
            </div>
            <div style={{padding:"5px 11px",borderBottom:`1px solid ${T.bd}`,background:dark?"#090909":T.ip}}>
              <div style={{fontSize:7,color:T.fa,fontFamily:"monospace"}}>Контекст: весь документ · {wordCount} слов</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"8px 11px",display:"flex",flexDirection:"column",gap:5}}>
              {globalChat.length===0&&<div style={{fontSize:9,color:T.fa,fontStyle:"italic",textAlign:"center",paddingTop:14}}>Задайте вопрос о документе целиком.</div>}
              {globalChat.map(m=>(<div key={m.id} style={{background:m.role==="user"?(dark?"#0e1020":"#eef2ff"):T.aiBg,border:`1px solid ${m.role==="user"?(dark?"#1a2040":"#b0c0ff"):T.aiBd}`,borderRadius:5,padding:"5px 8px"}}><div style={{fontSize:7,color:m.role==="user"?(dark?"#5060aa":"#4050bb"):T.ai,fontFamily:"monospace",marginBottom:2}}>{m.role==="user"?"ВЫ":"◈ CLAUDE"} · {m.ts}</div><div style={{fontSize:9,color:m.role==="user"?(dark?"#9aa0cc":"#2030a0"):T.ai,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{m.text}</div></div>))}
              {globalLoad&&<div style={{display:"flex",gap:5,alignItems:"center",color:T.ai,fontSize:9,padding:4}}><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span>Анализирует…<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}
            </div>
            <div style={{padding:"8px 11px",borderTop:`1px solid ${T.bd}`}}>
              <textarea value={globalMsg} onChange={e=>setGMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendGlobal();}}} placeholder="Вопрос по документу… (Enter)" style={{width:"100%",background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:4,padding:"5px 7px",color:T.tx,fontSize:9,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.5,minHeight:50,boxSizing:"border-box"}}/>
              <button onClick={sendGlobal} disabled={globalLoad||!globalMsg.trim()} style={{width:"100%",marginTop:4,padding:5,background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:4,color:T.ai,cursor:(globalLoad||!globalMsg.trim())?"default":"pointer",fontSize:8,fontFamily:"monospace",opacity:(globalLoad||!globalMsg.trim())?0.4:1}}>{globalLoad?"⟳ …":"◈ Отправить ↵"}</button>
              {globalChat.length>0&&<button onClick={()=>setGChat([])} style={{width:"100%",marginTop:3,padding:3,background:"none",border:`1px solid ${T.bd}`,borderRadius:3,color:T.fa,cursor:"pointer",fontSize:7,fontFamily:"monospace"}}>Очистить</button>}
            </div>
          </div>
        )}
        {/* ── SIDE PANEL (per-block) */}
        {panel&&!showGlobal&&view!=="split"&&(
          <div style={{width:320,background:T.sf,borderLeft:`1px solid ${T.bd}`,display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"7px 11px",borderBottom:`1px solid ${T.bd}`,display:"flex",gap:4,alignItems:"center"}}>
              {["ai","comment"].map(m=>(<button key={m} onClick={()=>{setPanel(p=>({...p,mode:m}));setMsg("");}} style={{background:panel.mode===m?T.sf2:"none",border:`1px solid ${panel.mode===m?T.bd2:"transparent"}`,borderRadius:3,padding:"3px 6px",cursor:"pointer",fontSize:8,color:panel.mode===m?T.tx:T.dm,fontFamily:"monospace"}}>{m==="ai"?AI_ROLES[aiRole].label:"◉ Заметки"}</button>))}
              <button onClick={()=>setPanel(null)} style={{marginLeft:"auto",background:"none",border:"none",color:T.fa,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button>
            </div>
            <div style={{padding:"5px 11px",borderBottom:`1px solid ${T.bd}`,background:dark?"#090909":T.ip}}>
              <div style={{fontSize:8,color:T.dm,lineHeight:1.5,fontStyle:"italic"}}>"{getBlock(panel.blockId)?.text.slice(0,70)}…"</div>
            </div>
            {corrMode&&(getBlock(panel.blockId)?.corrections||[]).filter(c=>c.status==="pending").map(corr=>(
              <div key={corr.id} style={{margin:"5px 11px 0",background:T.ntBg,border:`1px solid ${T.ntBd}`,borderRadius:5,padding:"6px 8px"}}>
                <div style={{fontSize:7,color:T.nt,fontFamily:"monospace",marginBottom:3}}>✎ ПРАВКА · {corr.ts}</div>
                <div style={{fontSize:8,color:T.dm,textDecoration:"line-through",marginBottom:2}}>{corr.original.slice(0,70)}…</div>
                <div style={{fontSize:8,color:T.tx,lineHeight:1.5}}>{corr.suggestion}</div>
                <div style={{display:"flex",gap:5,marginTop:5}}>
                  <button onClick={()=>applyCorr(panel.blockId,corr.id,true)} style={{flex:1,padding:"3px",background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:3,color:T.ai,cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>✓ Принять</button>
                  <button onClick={()=>applyCorr(panel.blockId,corr.id,false)} style={{flex:1,padding:"3px",background:T.ctBg,border:`1px solid ${T.ctBd}`,borderRadius:3,color:T.ct,cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>✕ Откл.</button>
                </div>
              </div>
            ))}
            <div style={{flex:1,overflowY:"auto",padding:"8px 11px",display:"flex",flexDirection:"column",gap:5}}>
              {panel.mode==="ai"&&getBlock(panel.blockId)?.aiReplies.map(r=>{
                const rc=r.role==="critic"?{c:T.ct,bg:T.ctBg,bd:T.ctBd}:r.role==="translate"?{c:T.fn,bg:T.fnBg,bd:T.fnBd}:{c:T.ai,bg:T.aiBg,bd:T.aiBd};
                return(<div key={r.id}><div style={{background:dark?"#0e1020":"#eef2ff",border:`1px solid ${dark?"#1a2040":"#b0c0ff"}`,borderRadius:4,padding:"4px 7px",marginBottom:3}}><div style={{fontSize:7,color:dark?"#5060aa":"#4050bb",fontFamily:"monospace",marginBottom:1}}>ВЫ · {r.ts}</div><div style={{fontSize:8,color:dark?"#9aa0cc":"#2030a0"}}>{r.q}</div></div><div style={{background:rc.bg,border:`1px solid ${rc.bd}`,borderRadius:4,padding:"4px 7px"}}><div style={{fontSize:7,color:rc.c,fontFamily:"monospace",marginBottom:1}}>{AI_ROLES[r.role]?.label||"ИИ"} · {r.ts}</div><div style={{fontSize:9,color:rc.c,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{r.answer}</div><button onClick={()=>acceptAI(panel.blockId,r.answer)} style={{marginTop:3,background:"none",border:`1px solid ${rc.bd}`,borderRadius:3,padding:"1px 5px",fontSize:7,color:rc.c,cursor:"pointer",fontFamily:"monospace"}}>✓ Принять</button></div></div>);
              })}
              {panel.mode==="comment"&&getBlock(panel.blockId)?.comments.map(c=>(<div key={c.id} style={{background:T.ntBg,border:`1px solid ${T.ntBd}`,borderRadius:4,padding:"4px 7px"}}><div style={{fontSize:7,color:T.nt,fontFamily:"monospace",marginBottom:1}}>ЗАМЕТКА · {c.ts}</div><div style={{fontSize:9,color:dark?"#c0a040":"#5a4010"}}>{c.text}</div></div>))}
              {loading&&<div style={{display:"flex",gap:5,alignItems:"center",color:T.ai,fontSize:9,padding:5}}><span style={{animation:"spin2 1s linear infinite",display:"inline-block"}}>⟳</span>{AI_ROLES[aiRole].label}…<style>{`@keyframes spin2{to{transform:rotate(360deg)}}`}</style></div>}
            </div>
            <div style={{padding:"8px 11px",borderTop:`1px solid ${T.bd}`}}>
              {panel.mode==="ai"&&aiRole==="translate"&&(
                <div style={{display:"flex",gap:3,marginBottom:4}}>
                  {Object.entries(LANGS).map(([k,l])=>(<button key={k} onClick={()=>translateBlock(panel.blockId,k)} style={{flex:1,background:T.fnBg,border:`1px solid ${T.fnBd}`,borderRadius:3,color:T.fn,padding:"3px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>{l}</button>))}
                </div>
              )}
              <div style={{display:"flex",gap:3,marginBottom:3}}>
                <textarea ref={inputRef} value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();panel.mode==="ai"?askClaude():addNote();}}} placeholder={panel.mode==="ai"?`Вопрос для ${AI_ROLES[aiRole].label}…`:"Заметка… (Enter)"}
                  style={{flex:1,background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:4,padding:"5px 7px",color:T.tx,fontSize:9,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.5,minHeight:50}}/>
                <button onClick={toggleVoice} style={{alignSelf:"flex-end",background:listening?"#2a0808":T.ip,border:`1px solid ${listening?"#702020":T.bd2}`,borderRadius:4,color:listening?"#b03030":T.dm,width:26,height:26,cursor:"pointer",fontSize:10,flexShrink:0}}>{listening?"●":"🎤"}</button>
              </div>
              <button onClick={panel.mode==="ai"?askClaude:addNote} disabled={loading||!msg.trim()} style={{width:"100%",padding:5,background:panel.mode==="ai"?T.aiBg:T.ntBg,border:`1px solid ${panel.mode==="ai"?T.aiBd:T.ntBd}`,borderRadius:4,color:panel.mode==="ai"?T.ai:T.nt,cursor:(loading||!msg.trim())?"default":"pointer",fontSize:8,fontFamily:"monospace",opacity:(loading||!msg.trim())?0.4:1}}>
                {loading?"⟳ …":panel.mode==="ai"?`${AI_ROLES[aiRole].label} ↵`:"◉ Сохранить ↵"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ═══ BLOCK ════════════════════════════════════════════════════════
function BlockC({block,T,dark,idx,corrMode,isActive,aiRole,onAI,onNote,onAccept,onFullEdit,onToggleTag,onToggleFmt,onToggleBm,onSelect,onAddFn,onSuggestCorr,onApplyCorr,onTranslate,onDragStart,onDragOver,onDrop}){
  const[hov,setHov]=useState(false);const[dOver,setDOver]=useState(false);
  const last=block.aiReplies[block.aiReplies.length-1];
  const ics=block.inlineComments||[];const fns=block.footnotes||[];
  const pending=(block.corrections||[]).filter(c=>c.status==="pending");
  const renderText=()=>{
    if(!ics.length&&!fns.length)return block.text;
    const parts=[];let rest=block.text;
    for(const ic of ics){const i=rest.indexOf(ic.selected);if(i>=0){if(i>0)parts.push(<span key={uid()}>{rest.slice(0,i)}</span>);parts.push(<mark key={ic.id} title={ic.comment} style={{background:T.ac+"33",borderBottom:`1px solid ${T.ac}`,cursor:"help"}}>{ic.selected}</mark>);rest=rest.slice(i+ic.selected.length);}}
    if(rest)parts.push(<span key="r">{rest}</span>);
    if(fns.length>0){let n=0;parts.push(...fns.map(fn=>{n++;return(<sup key={fn.id} title={fn.text} style={{color:T.fn,cursor:"help",fontSize:"0.7em"}}>[{n}]</sup>);}));}
    return parts;
  };
  const ts={fontSize:12,lineHeight:1.85,color:T.tx,margin:0,marginBottom:4,cursor:"text",userSelect:"text",fontWeight:block.fmt?.bold?"bold":"normal",fontStyle:block.fmt?.italic?"italic":"normal",...(block.fmt?.heading?{fontSize:14,fontWeight:"bold",color:T.ac,borderBottom:`1px solid ${T.bd2}`,paddingBottom:3}:{})};
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onDragOver={e=>{onDragOver(e);setDOver(true);}} onDragLeave={()=>setDOver(false)} onDrop={e=>{setDOver(false);onDrop(e);}}
      style={{marginBottom:14,paddingLeft:8,borderLeft:`2px solid ${isActive?T.ac:dOver?T.ai:pending.length>0?T.nt:block.bookmarked?T.ac+"66":hov?T.bd2:"transparent"}`,transition:"border-color .18s"}}>
      {block.tags.length>0&&(<div style={{display:"flex",gap:2,marginBottom:2,flexWrap:"wrap"}}>{block.tags.map(t=><span key={t} style={{fontSize:6,color:TAG_COLORS[t],background:TAG_COLORS[t]+"22",border:`1px solid ${TAG_COLORS[t]}44`,borderRadius:3,padding:"1px 4px",fontFamily:"monospace"}}>{TAG_LABELS[t]}</span>)}{block.bookmarked&&<span style={{fontSize:6,color:T.ac,background:T.ac+"22",border:`1px solid ${T.ac}44`,borderRadius:3,padding:"1px 4px",fontFamily:"monospace"}}>★</span>}</div>)}
      <p onMouseUp={onSelect} draggable onDragStart={onDragStart} style={ts}>{renderText()}</p>
      {(hov||isActive)&&(<div style={{display:"flex",gap:2,marginBottom:2}}><FBtn active={block.fmt?.bold} onClick={()=>onToggleFmt("bold")} T={T}><b>B</b></FBtn><FBtn active={block.fmt?.italic} onClick={()=>onToggleFmt("italic")} T={T}><em>I</em></FBtn><FBtn active={block.fmt?.heading} onClick={()=>onToggleFmt("heading")} T={T}>H</FBtn><FBtn active={block.bookmarked} onClick={onToggleBm} T={T} color={T.ac}>★</FBtn><FBtn active={false} onClick={onAddFn} T={T} color={T.fn}>¹</FBtn></div>)}
      <div style={{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap"}}>
        {block.version>1&&<Ch c={T.nt} bg={T.ntBg} brd={T.ntBd}>v{block.version}</Ch>}
        {block.aiReplies.length>0&&<Ch c={T.ai} bg={T.aiBg} brd={T.aiBd}>◈{block.aiReplies.length}</Ch>}
        {fns.length>0&&<Ch c={T.fn} bg={T.fnBg} brd={T.fnBd}>¹×{fns.length}</Ch>}
        {ics.length>0&&<Ch c={T.ac} bg={T.ac+"11"} brd={T.ac+"33"}>✎{ics.length}</Ch>}
        {pending.length>0&&<Ch c={T.nt} bg={T.ntBg} brd={T.ntBd}>✎{pending.length}пр</Ch>}
        {(hov||isActive)&&<><Ab c={T.ai} bg={T.aiBg} brd={T.aiBd} onClick={onAI}>◈ ИИ</Ab><Ab c={T.nt} bg={T.ntBg} brd={T.ntBd} onClick={onNote}>◉</Ab><Ab c={T.dm} bg={T.sf2} brd={T.bd} onClick={onFullEdit}>⛶</Ab>{corrMode&&<Ab c={T.nt} bg={T.ntBg} brd={T.ntBd} onClick={onSuggestCorr}>✎ Правка</Ab>}{TAG_LABELS.map((l,i)=>(<Ab key={i} c={block.tags.includes(i)?TAG_COLORS[i]:T.fa} bg={block.tags.includes(i)?TAG_COLORS[i]+"22":"none"} brd={block.tags.includes(i)?TAG_COLORS[i]+"55":T.bd} onClick={()=>onToggleTag(i)}>{l.split(" ")[0]}</Ab>))}</>}
      </div>
      {isActive&&last&&(()=>{const rc=last.role==="critic"?{c:T.ct,bg:T.ctBg,bd:T.ctBd}:last.role==="translate"?{c:T.fn,bg:T.fnBg,bd:T.fnBd}:{c:T.ai,bg:T.aiBg,bd:T.aiBd};return(<div style={{marginTop:4,background:rc.bg,border:`1px solid ${rc.bd}`,borderRadius:4,padding:"5px 8px",fontSize:9,color:rc.c,lineHeight:1.6}}><span style={{fontSize:7,fontFamily:"monospace"}}>↳ {AI_ROLES[last.role]?.label}: </span>{last.answer}<button onClick={()=>onAccept(last.answer)} style={{display:"block",marginTop:2,background:"none",border:`1px solid ${rc.bd}`,borderRadius:3,padding:"1px 5px",fontSize:7,color:rc.c,cursor:"pointer",fontFamily:"monospace"}}>✓ Принять</button></div>);})()}
    </div>
  );
}
// ═══ SUB COMPONENTS ══════════════════════════════════════════════
function SelBubble({bubble,T,onSave,onClose}){const[val,setVal]=useState("");return(<div style={{position:"fixed",left:Math.min(bubble.x-130,window.innerWidth-280),top:Math.max(8,bubble.y-88),zIndex:55,background:T.sf,border:`1px solid ${T.ac}`,borderRadius:6,padding:"8px 10px",width:260,boxShadow:"0 8px 28px rgba(0,0,0,.55)"}}><div style={{fontSize:7,color:T.ac,fontFamily:"monospace",marginBottom:3}}>«{bubble.text.slice(0,38)}»</div><input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")onSave(val);if(e.key==="Escape")onClose();}} autoFocus placeholder="Комментарий…" style={{width:"100%",background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"4px 6px",fontSize:10,color:T.tx,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:4}}/><div style={{display:"flex",gap:4}}><button onClick={()=>onSave(val)} style={{flex:1,background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:3,color:T.ai,padding:"3px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>✓</button><button onClick={onClose} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:3,color:T.dm,padding:"3px 6px",cursor:"pointer",fontSize:8}}>✕</button></div></div>);}
function FullEdit({blockId,T,dark,getBlock,onSave,onClose}){const b=getBlock(blockId);const[val,setVal]=useState(b?.text||"");return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:60,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}><div style={{width:"64%",maxWidth:740,background:T.sf,borderRadius:9,padding:24,border:`1px solid ${T.bd2}`}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:7,color:T.dm,fontFamily:"monospace"}}>⛶ Ctrl+S — сохранить · Esc — закрыть</span><span style={{fontSize:8,color:T.ac,fontFamily:"monospace"}}>{cW(val)} слов</span></div><textarea value={val} onChange={e=>setVal(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Escape")onClose();if(e.key==="s"&&(e.ctrlKey||e.metaKey)){e.preventDefault();onSave(val);}}} style={{width:"100%",minHeight:270,background:dark?"#111":"#fff",border:`1px solid ${T.ac}`,borderRadius:5,padding:"12px",fontSize:13,lineHeight:1.9,color:T.tx,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/><div style={{display:"flex",gap:6,marginTop:8}}><button onClick={()=>onSave(val)} style={{flex:1,padding:"7px",background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:5,color:T.ai,cursor:"pointer",fontSize:9,fontFamily:"monospace"}}>✓ Сохранить</button><button onClick={onClose} style={{padding:"7px 12px",background:"none",border:`1px solid ${T.bd}`,borderRadius:5,color:T.dm,cursor:"pointer",fontSize:9}}>Отмена</button></div></div></div>);}
function TimelineV({proj,T,updProj}){const[adding,setAdding]=useState(false);const[nm,setNm]=useState({label:"",date:""});const ms=proj.milestones||[];const done=ms.filter(m=>m.done).length;const addMs=()=>{if(!nm.label||!nm.date)return;updProj({...proj,milestones:[...ms,{id:uid(),...nm,done:false}]});setNm({label:"",date:""});setAdding(false);};return(<div><div style={{fontSize:10,color:T.dm,marginBottom:12}}>Таймлайн</div><div style={{height:3,background:T.bd,borderRadius:2,overflow:"hidden",marginBottom:12}}><div style={{width:`${ms.length?done/ms.length*100:0}%`,height:"100%",background:T.ai,borderRadius:2}}/></div>{ms.sort((a,b)=>a.date.localeCompare(b.date)).map(m=>{const isPast=new Date(m.date)<new Date()&&!m.done;return(<div key={m.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 9px",background:m.done?T.aiBg:isPast?T.ctBg:T.sf2,border:`1px solid ${m.done?T.aiBd:isPast?T.ctBd:T.bd}`,borderRadius:5,marginBottom:4}}><button onClick={()=>updProj({...proj,milestones:ms.map(x=>x.id===m.id?{...x,done:!x.done}:x)})} style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${m.done?T.ai:T.bd2}`,background:m.done?T.ai:"none",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#fff"}}>{m.done?"✓":""}</button><div style={{flex:1}}><div style={{fontSize:9,color:m.done?T.ai:isPast?T.ct:T.tx,textDecoration:m.done?"line-through":"none"}}>{m.label}</div><div style={{fontSize:7,color:T.dm,fontFamily:"monospace"}}>{new Date(m.date).toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} {isPast&&"· ПРОСРОЧЕНО"}</div></div><button onClick={()=>updProj({...proj,milestones:ms.filter(x=>x.id!==m.id)})} style={{background:"none",border:"none",color:T.fa,cursor:"pointer",fontSize:9}}>×</button></div>);})}{!ms.length&&<div style={{fontSize:9,color:T.fa,fontStyle:"italic"}}>Нет вех.</div>}{adding?(<div style={{background:T.sf2,border:`1px solid ${T.bd}`,borderRadius:5,padding:"9px",marginTop:6}}><div style={{display:"flex",gap:4,marginBottom:4}}><input value={nm.label} onChange={e=>setNm(p=>({...p,label:e.target.value}))} placeholder="Название" style={{flex:1,background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"3px 5px",fontSize:9,color:T.tx,outline:"none"}}/><input type="date" value={nm.date} onChange={e=>setNm(p=>({...p,date:e.target.value}))} style={{background:T.ip,border:`1px solid ${T.bd2}`,borderRadius:3,padding:"3px 5px",fontSize:9,color:T.tx,outline:"none",width:110}}/></div><div style={{display:"flex",gap:4}}><button onClick={addMs} style={{flex:1,padding:"3px",background:T.aiBg,border:`1px solid ${T.aiBd}`,borderRadius:3,color:T.ai,cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>✓</button><button onClick={()=>setAdding(false)} style={{padding:"3px 7px",background:"none",border:`1px solid ${T.bd}`,borderRadius:3,color:T.dm,cursor:"pointer",fontSize:8}}>Отмена</button></div></div>):<button onClick={()=>setAdding(true)} style={{marginTop:5,background:"none",border:`1px dashed ${T.bd2}`,borderRadius:4,color:T.fa,padding:"4px 11px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>+ Веха</button>}</div>);}
function HistoryV({proj,T}){const changed=proj.chapters.flatMap(c=>c.blocks).filter(b=>b.versions.length>0);return(<div><div style={{fontSize:10,color:T.dm,marginBottom:12}}>История правок</div>{!changed.length&&<div style={{fontSize:9,color:T.fa,fontStyle:"italic"}}>История пустая.</div>}{changed.map(b=>(<div key={b.id} style={{marginBottom:12}}><div style={{fontSize:8,color:T.dm,marginBottom:3,fontStyle:"italic"}}>"{b.text.slice(0,55)}…"</div>{b.versions.map((v,i)=>(<div key={i} style={{padding:"3px 8px",borderLeft:`2px solid ${T.bd2}`,marginBottom:2}}><div style={{fontSize:6,color:T.dm,fontFamily:"monospace",marginBottom:1}}>v{v.version} · {v.ts}</div><div style={{fontSize:8,color:T.fa}}>{v.text.slice(0,80)}…</div></div>))}<div style={{padding:"3px 8px",borderLeft:`2px solid ${T.ac}`}}><div style={{fontSize:6,color:T.ac,fontFamily:"monospace",marginBottom:1}}>v{b.version} · ТЕКУЩАЯ</div><div style={{fontSize:8,color:T.dm}}>{b.text.slice(0,80)}…</div></div></div>))}</div>);}
// ═══ MICRO ════════════════════════════════════════════════════════
function Ch({c,bg,brd,children}){return(<span style={{fontSize:7,color:c,background:bg,border:`1px solid ${brd}`,borderRadius:3,padding:"1px 4px",fontFamily:"monospace"}}>{children}</span>);}
function Ab({c,bg,brd,onClick,children}){return(<button onClick={onClick} style={{background:bg,border:`1px solid ${brd}`,borderRadius:3,padding:"2px 5px",cursor:"pointer",fontSize:7,color:c,fontFamily:"monospace"}}>{children}</button>);}
function Btn({c,bg,bd,onClick,children}){return(<button onClick={onClick} style={{background:bg,border:`1px solid ${bd}`,borderRadius:3,color:c,padding:"3px 8px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>{children}</button>);}
function FBtn({active,onClick,T,color,children}){const col=color||(active?T.ai:T.dm);return(<button onClick={onClick} style={{width:19,height:19,background:active?(color?color+"33":T.aiBg):"none",border:`1px solid ${active?(color||T.ai):T.bd}`,borderRadius:3,color:col,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</button>);}
