"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search, Filter, Plus, ChevronDown, X, Eye, User, MessageCircle,
  Send, Loader2, Paperclip, FileText, Image as ImageIcon, File,
  ExternalLink, Download, Edit2, ChevronLeft, ChevronRight,
  Scale, LogOut, CheckCircle2, AlertCircle, Info,
  Users, Briefcase, Gavel, Clock
} from "lucide-react"
import Login from "@/components/login"

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type CaseParty = {
  id: string
  firstName: string
  lastName: string
  role: string
  idNumber: string
  phone: string
  email: string
  gender: string
  dateOfBirth: string
  status: string
}

type Case = {
  id: number
  firstName: string
  lastName: string
  caseNumber: string
  status: string
  description: string
  court: string
  caseSummary: string
  crimeCategory: string
  crimeType: string
  crimeCommittedDate: string
  crimeCommittedTime: string
  crimeDescription: string
  caseParties: CaseParty[]
  attachments: File[]
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

type Toast = {
  id: string
  message: string
  type: "success" | "error" | "info"
}

type ActiveView  = "registration" | "manageCases" | "laws"
type DetailsTab  = "info" | "parties" | "attachments"

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8

const EMPTY_FORM = {
  caseTitle: "", court: "", caseSummary: "",
  crimeCategory: "Criminal Case", crimeType: "",
  crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "",
  casePartyFirstName: "", casePartyLastName: "", casePartyIDNumber: "",
  casePartyGender: "", casePartyDOB: "", casePartyStatus: "Single",
  casePartyRole: { witness: false, suspect: false, defendant: false },
  casePartyPhone: "", casePartyEmail: "",
  attachments: [] as File[],
}

const INITIAL_CASES: Case[] = [
  { id:1,  firstName:"Cedric",  lastName:"Manzi",     caseNumber:"CW-2026-001", status:"Open",    description:"Property dispute case",       court:"Kigali High Court",     caseSummary:"Boundary dispute between neighboring properties",  crimeCategory:"Civil Case",    crimeType:"Property Dispute",    crimeCommittedDate:"2026-03-15", crimeCommittedTime:"14:30", crimeDescription:"Dispute over land ownership boundaries between two neighboring families.",    caseParties:[], attachments:[] },
  { id:2,  firstName:"Jane",    lastName:"Muhoza",    caseNumber:"CW-2026-002", status:"Pending", description:"Civil litigation matter",      court:"Kigali District Court", caseSummary:"Contract dispute resolution",                      crimeCategory:"Civil Case",    crimeType:"Litigation",          crimeCommittedDate:"2026-02-20", crimeCommittedTime:"10:00", crimeDescription:"Civil litigation matter regarding contractual obligations.",                  caseParties:[], attachments:[] },
  { id:3,  firstName:"Robert",  lastName:"Kalisa",    caseNumber:"CW-2026-003", status:"Open",    description:"Contract breach case",         court:"Commercial Court",      caseSummary:"Business agreement violation",                     crimeCategory:"Civil Case",    crimeType:"Contract Breach",     crimeCommittedDate:"2026-01-10", crimeCommittedTime:"16:45", crimeDescription:"Breach of service agreement between business partners.",                     caseParties:[], attachments:[] },
  { id:4,  firstName:"Emille",  lastName:"Gakuba",    caseNumber:"CW-2026-004", status:"Closed",  description:"Employment dispute",           court:"Labor Court",           caseSummary:"Wrongful termination claim",                       crimeCategory:"Civil Case",    crimeType:"Employment Dispute",  crimeCommittedDate:"2025-12-05", crimeCommittedTime:"09:15", crimeDescription:"Wrongful termination claim filed by former employee.",                       caseParties:[], attachments:[] },
  { id:5,  firstName:"Michael", lastName:"Rugamba",   caseNumber:"CW-2026-005", status:"Open",    description:"Insurance claim case",         court:"Kigali High Court",     caseSummary:"Vehicle accident claim dispute",                   crimeCategory:"Civil Case",    crimeType:"Insurance Claim",     crimeCommittedDate:"2026-03-01", crimeCommittedTime:"11:20", crimeDescription:"Disputed insurance claim following vehicle accident.",                       caseParties:[], attachments:[] },
  { id:6,  firstName:"Sarah",   lastName:"Mbabazi",   caseNumber:"CW-2026-006", status:"Pending", description:"Family law matter",            court:"Family Court",          caseSummary:"Child custody proceedings",                        crimeCategory:"Civil Case",    crimeType:"Family Law",          crimeCommittedDate:"2026-02-14", crimeCommittedTime:"13:00", crimeDescription:"Custody arrangement proceedings involving minor children.",                  caseParties:[], attachments:[] },
  { id:7,  firstName:"David",   lastName:"Mugisha",   caseNumber:"CW-2026-007", status:"Open",    description:"Business partnership dispute", court:"Commercial Court",      caseSummary:"Partnership dissolution",                          crimeCategory:"Civil Case",    crimeType:"Partnership Dispute", crimeCommittedDate:"2026-01-25", crimeCommittedTime:"15:30", crimeDescription:"Dissolution of business partnership and asset division.",                    caseParties:[], attachments:[] },
  { id:8,  firstName:"Grace",   lastName:"Cyusa",     caseNumber:"CW-2026-008", status:"Open",    description:"Real estate transaction",      court:"Kigali District Court", caseSummary:"Property fraud investigation",                     crimeCategory:"Civil Case",    crimeType:"Real Estate",         crimeCommittedDate:"2026-03-10", crimeCommittedTime:"12:00", crimeDescription:"Fraudulent real estate transaction dispute.",                                caseParties:[], attachments:[] },
  { id:9,  firstName:"Patrick", lastName:"Hirwa",     caseNumber:"CW-2026-009", status:"Pending", description:"Intellectual property case",   court:"IP Tribunal",           caseSummary:"Trademark infringement claim",                     crimeCategory:"Civil Case",    crimeType:"IP Infringement",     crimeCommittedDate:"2026-02-28", crimeCommittedTime:"14:15", crimeDescription:"Trademark infringement claim by registered IP owner.",                       caseParties:[], attachments:[] },
  { id:10, firstName:"Jean",    lastName:"Manzi",     caseNumber:"CW-2026-010", status:"Open",    description:"Criminal defense case",        court:"Criminal Court",        caseSummary:"Assault case defense",                             crimeCategory:"Criminal Case", crimeType:"Criminal Defense",    crimeCommittedDate:"2026-03-05", crimeCommittedTime:"18:20", crimeDescription:"Criminal defense proceedings for assault charges.",                          caseParties:[], attachments:[] },
  { id:11, firstName:"Marie",   lastName:"Uwase",     caseNumber:"CW-2026-011", status:"Open",    description:"Consumer protection",          court:"Consumer Court",        caseSummary:"Product liability claim",                          crimeCategory:"Civil Case",    crimeType:"Consumer Rights",     crimeCommittedDate:"2026-03-12", crimeCommittedTime:"10:30", crimeDescription:"Consumer protection case regarding defective product.",                      caseParties:[], attachments:[] },
  { id:12, firstName:"Eric",    lastName:"Niyonzima", caseNumber:"CW-2026-012", status:"Pending", description:"Tax dispute",                  court:"Tax Court",             caseSummary:"Corporate tax assessment appeal",                  crimeCategory:"Civil Case",    crimeType:"Tax Dispute",         crimeCommittedDate:"2026-02-18", crimeCommittedTime:"09:00", crimeDescription:"Appeal of corporate tax assessment decision.",                               caseParties:[], attachments:[] },
]

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`
  return `${(b/1048576).toFixed(1)} MB`
}
function dedupeById<T extends {id:string}>(arr: T[]): T[] {
  const s = new Set<string>()
  return arr.filter(x => { if(s.has(x.id)) return false; s.add(x.id); return true })
}
function paginate<T>(arr: T[], page: number): T[] {
  return arr.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)
}

// ─────────────────────────────────────────────────────────────
// Shared input style
// ─────────────────────────────────────────────────────────────
const INP = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-slate-600/25 focus:border-slate-600 transition-all"

// ─────────────────────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const m: Record<string,{dot:string;pill:string}> = {
    Open:    { dot:"bg-emerald-500", pill:"bg-emerald-50 text-emerald-800 border-emerald-200" },
    Pending: { dot:"bg-amber-400",   pill:"bg-amber-50 text-amber-800 border-amber-200" },
    Closed:  { dot:"bg-slate-400",   pill:"bg-slate-100 text-slate-600 border-slate-200" },
  }
  const s = m[status] ?? m.Closed
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`}/>
      {status}
    </span>
  )
}

function FileIcon({ file }: { file: File }) {
  if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-violet-500"/>
  if (file.type==="application/pdf")  return <FileText  className="w-4 h-4 text-rose-500"/>
  return <File className="w-4 h-4 text-slate-400"/>
}

function SecHead({ icon, title, accent }: { icon: React.ReactNode; title: string; accent: string }) {
  return (
    <div className={`flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</span>
    </div>
  )
}

function Pager({ page, total, onChange }: { page:number; total:number; onChange:(p:number)=>void }) {
  if (total<=1) return null
  const pages: (number|string)[] = []
  for (let i=1;i<=total;i++) {
    if (i===1||i===total||Math.abs(i-page)<=1) pages.push(i)
    else if (pages[pages.length-1]!=="…") pages.push("…")
  }
  return (
    <div className="flex items-center justify-between mt-4 px-0.5">
      <p className="text-[11px] text-slate-400 font-medium">Page {page} of {total}</p>
      <div className="flex items-center gap-1">
        <button disabled={page===1} onClick={()=>onChange(page-1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 shadow-sm transition-all">
          <ChevronLeft className="w-3.5 h-3.5"/>
        </button>
        {pages.map((p,i)=> p==="…"
          ? <span key={`d${i}`} className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs">···</span>
          : <button key={p} onClick={()=>onChange(p as number)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border ${page===p ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm"}`}>
              {p}
            </button>
        )}
        <button disabled={page===total} onClick={()=>onChange(page+1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 shadow-sm transition-all">
          <ChevronRight className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>
  )
}

function Toast({ t, onClose }: { t:Toast; onClose:()=>void }) {
  useEffect(()=>{ const id=setTimeout(onClose,3500); return ()=>clearTimeout(id) },[onClose])
  const c = {
    success: { bar:"bg-emerald-500", icon:<CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/> },
    error:   { bar:"bg-rose-500",    icon:<AlertCircle  className="w-4 h-4 text-rose-500 shrink-0"/> },
    info:    { bar:"bg-slate-600",    icon:<Info         className="w-4 h-4 text-slate-600 shrink-0"/> },
  }[t.type]
  return (
    <div className="fixed top-16 right-4 z-[60] min-w-72 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
      style={{animation:"toast .25s cubic-bezier(.22,.68,0,1.2)"}}>
      <div className={`h-0.5 w-full ${c.bar}`}/>
      <div className="flex items-start gap-3 px-4 py-3.5">
        {c.icon}
        <p className="text-xs font-semibold text-slate-700 flex-1 leading-relaxed">{t.message}</p>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5 shrink-0">
          <X className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
export default function CaseWiseDashboard() {
  const [isLoggedIn,  setIsLoggedIn]  = useState(false)
  const [userEmail,   setUserEmail]   = useState("")
  const [authToken,   setAuthToken]   = useState<string|null>(null)
  const [cases,       setCases]       = useState<Case[]>(INITIAL_CASES)
  const [myCases,     setMyCases]     = useState<Case[]>([])
  const [activeView,  setActiveView]  = useState<ActiveView>("registration")
  const [search,      setSearch]      = useState("")
  const [activeFilter,setActiveFilter]= useState<string|null>(null)
  const [selFilters,  setSelFilters]  = useState({caseNumber:"",status:""})
  const [showModal,   setShowModal]   = useState(false)
  const [editingCase, setEditingCase] = useState<Case|null>(null)
  const [selCase,     setSelCase]     = useState<Case|null>(null)
  const [detailTab,   setDetailTab]   = useState<DetailsTab>("info")
  const [form,        setForm]        = useState({...EMPTY_FORM})
  const [parties,     setParties]     = useState<CaseParty[]>([])
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set())
  const [toasts,      setToasts]      = useState<Toast[]>([])
  const [lawFiles,    setLawFiles]    = useState<File[]>([])
  const [lawSaving,   setLawSaving]   = useState(false)   // ← NEW
  const [prevUrl,     setPrevUrl]     = useState<string|null>(null)
  const [dashPage,    setDashPage]    = useState(1)
  const [manPage,     setManPage]     = useState(1)
  const [chatOpen,    setChatOpen]    = useState(false)
  const [chatMsgs,    setChatMsgs]    = useState<ChatMessage[]>([
    { id:"w", role:"assistant", content:"Hi! I'm CaseWise AI. Ask me anything about your cases, legal procedures, or how to use this system." }
  ])
  const [chatIn,  setChatIn]  = useState("")
  const [chatBusy,setChatBusy]= useState(false)
  const chatEnd               = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    fetch("http://localhost:8080/api/cases").then(r=>r.json()).then(d=>{ if(d.data) setCases(d.data) }).catch(()=>{})
  },[])
  useEffect(()=>{
    const t=localStorage.getItem("authToken"), e=localStorage.getItem("userEmail")
    if(t&&e){setAuthToken(t);setUserEmail(e);setIsLoggedIn(true)}
  },[])
  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}) },[chatMsgs])
  useEffect(()=>()=>{ if(prevUrl) URL.revokeObjectURL(prevUrl) },[prevUrl])

  const login  = (e:string,t:string)=>{ setUserEmail(e);setAuthToken(t);setIsLoggedIn(true);localStorage.setItem("authToken",t);localStorage.setItem("userEmail",e) }
  const logout = ()=>{ setIsLoggedIn(false);setUserEmail("");setAuthToken(null);setMyCases([]);localStorage.removeItem("authToken");localStorage.removeItem("userEmail") }

  if (!isLoggedIn) return <Login onLogin={login}/>

  const toast  = (message:string, type:Toast["type"]="success") => setToasts(p=>[...p,{id:Date.now().toString(),message,type}])
  const rmToast= (id:string) => setToasts(p=>p.filter(t=>t.id!==id))
  const patch  = (u:Partial<typeof form>) => setForm(p=>({...p,...u}))
  const reset  = () => { setForm({...EMPTY_FORM}); setParties([]); setExpanded(new Set()) }

  const addParty = () => {
    if (!form.casePartyFirstName.trim()||!form.casePartyLastName.trim()) { toast("First and last name are required","error"); return }
    const role = (["witness","suspect","defendant"] as const).filter(r=>form.casePartyRole[r]).join(", ")
    setParties(p=>[...p,{
      id:Date.now().toString(), firstName:form.casePartyFirstName.trim(), lastName:form.casePartyLastName.trim(),
      role:role||"Unspecified", idNumber:form.casePartyIDNumber, phone:form.casePartyPhone,
      email:form.casePartyEmail, gender:form.casePartyGender, dateOfBirth:form.casePartyDOB, status:form.casePartyStatus
    }])
    patch({ casePartyFirstName:"",casePartyLastName:"",casePartyIDNumber:"",casePartyGender:"",
      casePartyDOB:"",casePartyStatus:"Single",casePartyRole:{witness:false,suspect:false,defendant:false},
      casePartyPhone:"",casePartyEmail:"" })
  }

  const editCase = (c:Case) => {
    setEditingCase(c)
    setForm({...EMPTY_FORM,caseTitle:c.description,court:c.court,caseSummary:c.caseSummary,
      crimeCategory:c.crimeCategory,crimeType:c.crimeType,
      crimeCommittedDate:c.crimeCommittedDate,crimeCommittedTime:c.crimeCommittedTime,
      crimeDescription:c.crimeDescription,attachments:c.attachments??[]})
    setParties(dedupeById(c.caseParties??[]))
    setShowModal(true)
  }

  const registerCase = async () => {
    if (!form.caseTitle.trim()) { toast("Case title is required","error"); return }
    if (editingCase) {
      const u:Case = {...editingCase,description:form.caseSummary||editingCase.description,court:form.court,
        caseSummary:form.caseSummary,crimeCategory:form.crimeCategory,crimeType:form.crimeType,
        crimeCommittedDate:form.crimeCommittedDate,crimeCommittedTime:form.crimeCommittedTime,
        crimeDescription:form.crimeDescription,caseParties:parties,attachments:form.attachments}
      setCases(p=>p.map(c=>c.id===editingCase.id?u:c))
      setMyCases(p=>p.map(c=>c.id===editingCase.id?u:c))
      setShowModal(false); setEditingCase(null); reset(); toast("Case updated successfully"); return
    }
    const token = authToken??localStorage.getItem("authToken")
    const num   = `CW-2026-${String(cases.length+1).padStart(3,"0")}`
    const mk = (ov?:Partial<Case>):Case => ({
      id:cases.length+1, firstName:parties[0]?.firstName??"", lastName:parties[0]?.lastName??"",
      caseNumber:num, status:"Open", description:form.caseSummary||"New case",
      court:form.court, caseSummary:form.caseSummary, crimeCategory:form.crimeCategory,
      crimeType:form.crimeType, crimeCommittedDate:form.crimeCommittedDate,
      crimeCommittedTime:form.crimeCommittedTime, crimeDescription:form.crimeDescription,
      caseParties:parties, attachments:form.attachments, ...ov
    })
    let ok=false
    try { ok=(await fetch("http://localhost:8080/api/cases")).ok } catch {}
    if (!ok) { const c=mk(); setCases(p=>[...p,c]); setMyCases(p=>[...p,c]); setShowModal(false); reset(); toast("Case registered successfully"); return }
    try {
      const r=await fetch("http://localhost:8080/api/cases/create",{
        method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({firstName:parties[0]?.firstName??"",lastName:parties[0]?.lastName??"",caseTitle:form.caseTitle,
          courtName:form.court,caseSummary:form.caseSummary,crimeCategory:form.crimeCategory,crimeType:form.crimeType,
          crimeDescription:form.crimeDescription,crimeCommittedDate:form.crimeCommittedDate,
          crimeCommittedTime:form.crimeCommittedTime,attachments:[],
          caseParties:parties.map(p=>({firstName:p.firstName,lastName:p.lastName,dateOfBirth:p.dateOfBirth,gender:p.gender,phoneNumber:p.phone,email:p.email,role:p.role,CaseID:""}))})
      })
      const tx=await r.text().catch(()=>""), d=tx.trim()?JSON.parse(tx):{}
      if (r.ok) { const c=mk({caseNumber:d.data?.caseNumber??num,id:d.data?.id??cases.length+1}); setCases(p=>[...p,c]); setMyCases(p=>[...p,c]); setShowModal(false); reset(); toast("Case registered successfully") }
      else if (r.status===401||r.status===403) { toast("Session expired – please log in again","error"); logout() }
      else toast(d?.message??`Error ${r.status}`,"error")
    } catch { const c=mk(); setCases(p=>[...p,c]); setMyCases(p=>[...p,c]); setShowModal(false); reset(); toast("Case registered (offline mode)","info") }
  }

  // ── NEW: Save law files ───────────────────────────────────
  const saveLawFiles = async () => {
    if (!lawFiles.length || lawSaving) return
    setLawSaving(true)
    try {
      const fd = new FormData()
      lawFiles.forEach(f => fd.append("files", f))
      const token = authToken ?? localStorage.getItem("authToken")
      const r = await fetch("http://localhost:8080/api/laws/upload", {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      })
      if (r.ok) {
        toast(`${lawFiles.length} file${lawFiles.length !== 1 ? "s" : ""} saved successfully`)
        setLawFiles([])
      } else {
        toast("Failed to save files. Please try again.", "error")
      }
    } catch {
      toast("Saved locally — server unavailable.", "info")
      setLawFiles([])
    } finally {
      setLawSaving(false)
    }
  }

  const toggleF = (k:string) => setActiveFilter(p=>p===k?null:k)
  const applyF  = (k:string, v:string) => { setSelFilters(p=>({...p,[k]:p[k as keyof typeof p]===v?"":v})); setActiveFilter(null) }
  const filter  = (list:Case[]) => list.filter(c=>{
    const q=search.toLowerCase()
    return [c.firstName,c.lastName,c.caseNumber].some(x=>x.toLowerCase().includes(q)) &&
      (!selFilters.caseNumber||c.caseNumber===selFilters.caseNumber) &&
      (!selFilters.status||c.status===selFilters.status)
  })

  const filtCases  = filter(cases)
  const filtMy     = filter(myCases)
  const uniqNums   = [...new Set(cases.map(c=>c.caseNumber))]
  const uniqStatus = [...new Set(cases.map(c=>c.status))]

  const openFile = (f:File) => {
    if(prevUrl) URL.revokeObjectURL(prevUrl)
    const u=URL.createObjectURL(f); setPrevUrl(u)
    if(f.type.startsWith("image/")||f.type==="application/pdf") window.open(u,"_blank")
    else { const a=document.createElement("a"); a.href=u; a.download=f.name; a.click() }
  }
  const dlFile = (f:File) => {
    const u=URL.createObjectURL(f); const a=document.createElement("a"); a.href=u; a.download=f.name; a.click()
    setTimeout(()=>URL.revokeObjectURL(u),1000)
  }

  const chatSend = async () => {
    const t = chatIn.trim();
    if (!t || chatBusy) return;
    const um = { id: Date.now().toString(), role: "user" as const, content: t };
    const h = [...chatMsgs, um];
    setChatMsgs(h);
    setChatIn("");
    setChatBusy(true);
    try {
      const r = await fetch("http://localhost:8000/api/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t })
      });
      const d = await r.json();
      setChatMsgs(p => [...p, { id: Date.now().toString(), role: "assistant", content: d.response ?? "No response." }]);
    } catch {
      setChatMsgs(p => [...p, { id: Date.now().toString(), role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setChatBusy(false);
    }
  };

  // ── inline FilterBar ─────────────────────────────────
  function FilterBar() {
    const Drop = ({ fk, label, opts }: { fk:string; label:string; opts:string[] }) => {
      const av = selFilters[fk as keyof typeof selFilters]
      return (
        <div className="relative">
          <button onClick={()=>toggleF(fk)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-semibold transition-all ${av ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"}`}>
            {av||label} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeFilter===fk?"rotate-180":""}`}/>
          </button>
          {activeFilter===fk && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
              {opts.map(o=>(
                <button key={o} onClick={()=>applyF(fk,o)}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${av===o?"bg-slate-100 text-slate-700":"text-slate-600 hover:bg-slate-50"}`}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"/>
            <input type="text" placeholder="Search by name or case number…" value={search}
              onChange={e=>{ setSearch(e.target.value); setDashPage(1); setManPage(1) }}
              className="w-full py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-500 transition-all placeholder-slate-400 font-medium"
              style={{paddingLeft:"2rem",paddingRight:"0.75rem"}}/>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              <Filter className="w-3 h-3"/> Filter
            </span>
            <Drop fk="caseNumber" label="Case No." opts={uniqNums}/>
            <Drop fk="status"     label="Status"   opts={uniqStatus}/>
          </div>
        </div>
        {(selFilters.caseNumber||selFilters.status) && (
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active:</span>
            {[["caseNumber",selFilters.caseNumber],["status",selFilters.status]].map(([k,v])=>v?(
              <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-300">
                {v} <button onClick={()=>applyF(k,v)} className="hover:opacity-60 transition-opacity"><X className="w-2.5 h-2.5"/></button>
              </span>
            ):null)}
          </div>
        )}
      </div>
    )
  }

  // ── inline CaseTable ──────────────────────────────────
  function CaseTable({ data, showEdit=false }: { data:Case[]; showEdit?:boolean }) {
    if (!data.length) return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <Briefcase className="w-5 h-5 text-slate-300"/>
        </div>
        <p className="text-sm font-semibold text-slate-500 mb-1">No cases found</p>
        <p className="text-xs text-slate-400 font-medium">Try adjusting your search or filters</p>
      </div>
    )
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["First Name","Last Name","Case Number","Status","Actions"].map(h=>(
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((c,i)=>(
                <tr key={c.id} className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/60 ${i%2===0?"bg-white":"bg-slate-50/20"}`}>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{c.firstName}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{c.lastName}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={()=>{ setSelCase(c); setDetailTab("info") }}
                      className="font-mono text-xs font-bold text-slate-800 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-lg transition-all">
                      {c.caseNumber}
                    </button>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status}/></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>{ setSelCase(c); setDetailTab("info") }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm">
                        <Eye className="w-3.5 h-3.5"/> View
                      </button>
                      {showEdit && (
                        <button onClick={()=>editCase(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-all shadow-sm">
                          <Edit2 className="w-3.5 h-3.5"/> Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes toast { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadein { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .pg { animation: fadein .2s ease-out }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px}
      `}</style>

      <div className="min-h-screen bg-slate-100">

        {/* toasts */}
        {toasts.map(t=><Toast key={t.id} t={t} onClose={()=>rmToast(t.id)}/>)}

        {/* ═══ NAVBAR ═══════════════════════════════ */}
        <header className="sticky top-0 z-30 h-14 bg-slate-900 border-b border-slate-800 shadow-lg flex items-center px-5 gap-4">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center shadow-lg shadow-slate-600/30">
              <Scale className="w-4 h-4 text-white"/>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-sm tracking-tight">CaseWise</span>
              <span className="text-slate-500 text-xs font-semibold hidden sm:inline">Legal Case Management</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-600/20 border border-slate-600/40 flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-slate-500"/>
              </div>
              <span className="text-xs font-semibold text-slate-300">{userEmail}</span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all">
              <LogOut className="w-3.5 h-3.5"/> Logout
            </button>
          </div>
        </header>

        <div className="flex">
          {/* ═══ SIDEBAR ══════════════════════════════ */}
          <nav className="w-56 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 flex flex-col">
            <div className="p-3 flex-1 pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Menu</p>
              {([
                { k:"registration", l:"Case Registration", I:Gavel,     s:"Register new cases" },
                { k:"manageCases",  l:"Manage Cases",       I:Briefcase, s:`${myCases.length} registered` },
                { k:"laws",         l:"Laws & Resources",   I:Scale,     s:"Legal references" },
              ] as {k:ActiveView;l:string;I:React.FC<{className?:string}>;s:string}[]).map(({k,l,I,s})=>(
                <button key={k} onClick={()=>setActiveView(k)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-1 group ${activeView===k ? "bg-slate-900" : "hover:bg-slate-100"}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeView===k?"bg-white/20":"bg-slate-100 group-hover:bg-slate-200"}`}>
                    <I className={`w-3.5 h-3.5 ${activeView===k?"text-white":"text-slate-400"}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${activeView===k?"text-white":"text-slate-700"}`}>{l}</p>
                    <p className={`text-[10px] font-medium mt-0.5 ${activeView===k?"text-slate-200":"text-slate-400"}`}>{s}</p>
                  </div>
                </button>
              ))}
            </div>
            {/* sidebar stats */}
            <div className="p-3 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                {[
                  {l:"Total",   v:cases.length,                                     c:"text-slate-700"},
                  {l:"Open",    v:cases.filter(c=>c.status==="Open").length,    c:"text-emerald-700"},
                  {l:"Pending", v:cases.filter(c=>c.status==="Pending").length, c:"text-amber-700"},
                  {l:"Closed",  v:cases.filter(c=>c.status==="Closed").length,  c:"text-slate-500"},
                ].map(s=>(
                  <div key={s.l} className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">{s.l}</span>
                    <span className={`text-xs font-black ${s.c}`}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* ═══ MAIN ════════════════════════════════ */}
          <main className="flex-1 p-5 min-w-0">
            <div className="max-w-5xl mx-auto pg">

              {/* ── Registration ── */}
              {activeView==="registration" && (()=>{
                const tp = Math.ceil(filtCases.length/ITEMS_PER_PAGE)
                return (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Case Management</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{filtCases.length} case{filtCases.length!==1?"s":""} in the system</p>
                      </div>
                      <button onClick={()=>{ setEditingCase(null); reset(); setShowModal(true) }}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg shadow-slate-400/50 hover:shadow-slate-500/50 transition-all">
                        <Plus className="w-3.5 h-3.5"/> Register New Case
                      </button>
                    </div>

                    {/* stats */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { l:"Open Cases",    v:cases.filter(c=>c.status==="Open").length,    ic:<CheckCircle2 className="w-4 h-4 text-emerald-500"/>, bg:"bg-slate-900", vc:"text-white" },
                        { l:"Pending Cases", v:cases.filter(c=>c.status==="Pending").length, ic:<Clock className="w-4 h-4 text-amber-400"/>,           bg:"bg-slate-800", vc:"text-white" },
                        { l:"Total Cases",   v:cases.length,                                 ic:<Briefcase className="w-4 h-4 text-slate-500"/>,        bg:"bg-slate-900",       vc:"text-white" },
                      ].map(s=>(
                        <div key={s.l} className={`${s.bg} border border-slate-700 rounded-xl p-3 flex items-center gap-2.5 shadow-lg shadow-slate-900/30`}>
                          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">{s.ic}</div>
                          <div>
                            <p className={`text-xl font-black ${s.vc}`}>{s.v}</p>
                            <p className="text-[10px] font-semibold text-slate-300">{s.l}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <FilterBar/>
                    <CaseTable data={paginate(filtCases,dashPage)}/>
                    <Pager page={dashPage} total={tp} onChange={setDashPage}/>
                  </>
                )
              })()}

              {/* ── Manage Cases ── */}
              {activeView==="manageCases" && (()=>{
                const tp = Math.ceil(filtMy.length/ITEMS_PER_PAGE)
                return (
                  <>
                    <div className="mb-5">
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">Manage Cases</h1>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Cases you have registered</p>
                    </div>
                    {myCases.length===0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="w-7 h-7 text-slate-300"/>
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 mb-2">No registered cases yet</h3>
                        <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto font-medium">Cases you register will appear here for easy management.</p>
                        <button onClick={()=>setActiveView("registration")}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-slate-400/50 transition-all">
                          Go to Case Registration
                        </button>
                      </div>
                    ) : (
                      <>
                        <FilterBar/>
                        <CaseTable data={paginate(filtMy,manPage)} showEdit/>
                        <Pager page={manPage} total={tp} onChange={setManPage}/>
                      </>
                    )}
                  </>
                )
              })()}

              {/* ── Laws ── */}
              {activeView==="laws" && (
                <>
                  <div className="mb-5">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Laws & Resources</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Legal reference materials and documents</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                        <Scale className="w-4.5 h-4.5 text-slate-800" style={{width:18,height:18}}/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Upload Legal Documents</p>
                        <p className="text-xs text-slate-500 font-medium">Statutes, precedents, and reference materials</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-500 hover:bg-slate-100/20 transition-all group">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-2 transition-colors">
                          <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors"/>
                        </div>
                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Click to upload files</span>
                        <span className="text-[11px] text-slate-400 mt-0.5 font-medium">PDF, DOCX, images supported</span>
                        <input type="file" multiple className="hidden" name="file" onChange={e=>setLawFiles(p=>[...p,...Array.from(e.target.files??[])])}/>
                      </label> 

                      {lawFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {/* ── file list header ── */}
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-slate-600">
                              {lawFiles.length} file{lawFiles.length !== 1 ? "s" : ""} ready to save
                            </p>
                            <button
                              onClick={() => setLawFiles([])}
                              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors font-semibold"
                            >
                              Clear all
                            </button>
                          </div>

                          {/* ── file rows ── */}
                          {lawFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all">
                              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                <FileIcon file={f}/>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{f.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{formatBytes(f.size)}</p>
                              </div>
                              <button
                                onClick={() => setLawFiles(p => p.filter((_, j) => j !== i))}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              >
                                <X className="w-3.5 h-3.5"/>
                              </button>
                            </div>
                          ))}

                          {/* ── Save button ── */}
                          <div className="pt-3 mt-1 border-t border-slate-100">
                            <button
                              onClick={saveLawFiles}
                              disabled={lawSaving}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-400/30"
                            >
                              {lawSaving ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                                  Saving…
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5"/>
                                  Save {lawFiles.length} File{lawFiles.length !== 1 ? "s" : ""}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>

        {/* ═══ CHAT FAB ════════════════════════════════ */}
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
          {chatOpen && (
            <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col" style={{height:450}}>
              <div className="bg-slate-900 px-4 py-3.5 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-600/20 border border-slate-600/30 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-slate-500"/>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">CaseWise AI</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/> Online
                  </p>
                </div>
                <button onClick={()=>setChatOpen(false)} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMsgs.map(m=>(
                  <div key={m.id} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${m.role==="user" ? "bg-slate-900 text-white rounded-br-sm" : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm"}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatBusy && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin"/>
                    </div>
                  </div>
                )}
                <div ref={chatEnd}/>
              </div>
              <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 bg-white shrink-0">
                <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&chatSend()}
                  placeholder="Ask a question…"
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-500 transition-all placeholder-slate-400 font-medium"/>
                <button onClick={chatSend} disabled={!chatIn.trim()||chatBusy}
                  className="w-8 h-8 flex items-center justify-center bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-md disabled:shadow-none shrink-0">
                  <Send className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          )}
          <button onClick={()=>setChatOpen(o=>!o)}
            className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-xl transition-all hover:scale-105 relative border border-slate-700">
            {chatOpen ? <X className="w-5 h-5"/> : <MessageCircle className="w-5 h-5"/>}
            {!chatOpen && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"/>}
          </button>
        </div>

        {/* ═══ REGISTER / EDIT MODAL ═══════════════════ */}
        {showModal && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[93vh] flex flex-col overflow-hidden border border-slate-200">
              {/* header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-300">
                    <Gavel className="w-4 h-4 text-white"/>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{editingCase?"Edit Case":"Register New Case"}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{editingCase?`Editing ${editingCase.caseNumber}`:"Fill in the details below"}</p>
                  </div>
                </div>
                <button onClick={()=>{ setShowModal(false); setEditingCase(null); reset() }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

                {/* Case Details */}
                <div>
                  <SecHead icon={<Briefcase className="w-3.5 h-3.5 text-slate-800"/>} title="Case Details" accent="bg-slate-200"/>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Case Number</label>
                      <input value={editingCase?editingCase.caseNumber:`CW-2026-${String(cases.length+1).padStart(3,"0")}`} readOnly className={`${INP} bg-slate-50 text-slate-400 cursor-not-allowed`}/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Court</label>
                      <input value={form.court} onChange={e=>patch({court:e.target.value})} placeholder="e.g. Kigali High Court" className={INP}/>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Case Title <span className="text-rose-500 normal-case font-normal text-[10px]">* required</span>
                      </label>
                      <input value={form.caseTitle} onChange={e=>patch({caseTitle:e.target.value})} placeholder="Brief title for this case" className={INP}/>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Case Summary</label>
                      <textarea value={form.caseSummary} onChange={e=>patch({caseSummary:e.target.value})} rows={3} placeholder="Brief overview…" className={`${INP} resize-none`}/>
                    </div>
                  </div>
                </div>

                {/* Crime Info */}
                <div>
                  <SecHead icon={<Gavel className="w-3.5 h-3.5 text-amber-700"/>} title="Crime Information" accent="bg-amber-100"/>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                      <select value={form.crimeCategory} onChange={e=>patch({crimeCategory:e.target.value})} className={INP}>
                        <option>Criminal Case</option><option>Civil Case</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Crime Type</label>
                      <input value={form.crimeType} onChange={e=>patch({crimeType:e.target.value})} placeholder="e.g. Assault, Fraud…" className={INP}/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date Committed</label>
                      <input type="date" value={form.crimeCommittedDate} onChange={e=>patch({crimeCommittedDate:e.target.value})} className={INP}/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Time Committed</label>
                      <input type="time" value={form.crimeCommittedTime} onChange={e=>patch({crimeCommittedTime:e.target.value})} className={INP}/>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Crime Description</label>
                      <textarea value={form.crimeDescription} onChange={e=>patch({crimeDescription:e.target.value})} rows={3} placeholder="Describe the circumstances…" className={`${INP} resize-none`}/>
                    </div>
                  </div>
                </div>

                {/* Parties */}
                <div>
                  <SecHead icon={<Users className="w-3.5 h-3.5 text-violet-700"/>} title="Case Parties" accent="bg-violet-100"/>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([["First Name","casePartyFirstName","First name","text"],["Last Name","casePartyLastName","Last name","text"],
                         ["ID Number","casePartyIDNumber","National ID","text"],["Phone","casePartyPhone","+250 …","tel"],
                         ["Email","casePartyEmail","email@example.com","email"],["Date of Birth","casePartyDOB","","date"],
                      ] as [string,string,string,string][]).map(([label,field,ph,type])=>(
                        <div key={field}>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
                          <input type={type} value={form[field as keyof typeof form] as string} onChange={e=>patch({[field]:e.target.value})} placeholder={ph} className={INP}/>
                        </div>
                      ))}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Gender</label>
                        <select value={form.casePartyGender} onChange={e=>patch({casePartyGender:e.target.value})} className={INP}>
                          <option value="">Select…</option><option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Marital Status</label>
                        <select value={form.casePartyStatus} onChange={e=>patch({casePartyStatus:e.target.value})} className={INP}>
                          {["Single","Married","Divorced","Widowed"].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Role</label>
                      <div className="flex gap-5">
                        {(["witness","suspect","defendant"] as const).map(r=>(
                          <label key={r} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.casePartyRole[r]} onChange={e=>patch({casePartyRole:{...form.casePartyRole,[r]:e.target.checked}})} className="w-3.5 h-3.5 rounded accent-slate-900"/>
                            <span className="text-xs font-semibold text-slate-600 capitalize">{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button onClick={addParty}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                      <Plus className="w-3.5 h-3.5"/> Add Party to Case
                    </button>
                  </div>

                  {parties.length>0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{parties.length} part{parties.length!==1?"ies":"y"} added</p>
                      {parties.map(p=>(
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 transition-colors" onClick={()=>{ const n=new Set(expanded); n.has(p.id)?n.delete(p.id):n.add(p.id); setExpanded(n) }}>
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0"><User className="w-3.5 h-3.5 text-slate-500"/></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                              {p.role && <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold capitalize mt-0.5">{p.role}</span>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={e=>{ e.stopPropagation(); setParties(px=>px.filter(x=>x.id!==p.id)) }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X className="w-3.5 h-3.5"/></button>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded.has(p.id)?"rotate-180":""}`}/>
                            </div>
                          </div>
                          {expanded.has(p.id) && (
                            <div className="border-t border-slate-100 px-4 py-3 grid grid-cols-2 gap-3 bg-slate-50">
                              {([["ID",p.idNumber],["Phone",p.phone],["Email",p.email],["Gender",p.gender],["DOB",p.dateOfBirth],["Status",p.status]] as [string,string][]).map(([l,v])=>(
                                <div key={l}><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{l}</p><p className="text-xs text-slate-700 font-semibold">{v||"—"}</p></div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <SecHead icon={<Paperclip className="w-3.5 h-3.5 text-blue-700"/>} title="Attachments" accent="bg-blue-100"/>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-500 hover:bg-slate-100/20 transition-all group">
                    <Paperclip className="w-5 h-5 text-slate-300 group-hover:text-slate-600 mb-1.5 transition-colors"/>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">Click to attach files</span>
                    <input type="file" multiple className="hidden" onChange={e=>patch({attachments:[...form.attachments,...Array.from(e.target.files??[])]})}/>
                  </label>
                  {form.attachments.length>0 && (
                    <div className="space-y-1.5 mt-3">
                      {form.attachments.map((f,i)=>(
                        <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                          <FileIcon file={f}/>
                          <span className="text-xs text-slate-700 flex-1 truncate font-semibold">{f.name}</span>
                          <span className="text-[11px] text-slate-400 shrink-0 font-medium">{formatBytes(f.size)}</span>
                          <button onClick={()=>patch({attachments:form.attachments.filter((_,j)=>j!==i)})} className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X className="w-3 h-3"/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* footer */}
              <div className="flex gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
                <button onClick={()=>{ setShowModal(false); setEditingCase(null); reset() }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-white rounded-xl text-xs font-bold transition-all bg-white shadow-sm">
                  Cancel
                </button>
                <button onClick={registerCase} disabled={!form.caseTitle.trim()}
                  className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-400/50">
                  {editingCase?"Save Changes":"Register Case"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CASE DETAILS MODAL ══════════════════════ */}
        {selCase && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[93vh] flex flex-col overflow-hidden border border-slate-200">

              {/* header */}
              <div className="bg-slate-900 px-6 py-5 flex items-start justify-between shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Case Record</span>
                    <StatusBadge status={selCase.status}/>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight font-mono">{selCase.caseNumber}</h3>
                  <p className="text-sm text-slate-400 font-semibold mt-1">{selCase.firstName} {selCase.lastName}</p>
                  {selCase.crimeCategory && (
                    <span className="inline-block mt-2.5 px-2.5 py-1 bg-slate-600/15 text-slate-400 border border-slate-600/25 rounded-lg text-[11px] font-bold">
                      {selCase.crimeCategory}
                    </span>
                  )}
                </div>
                <button onClick={()=>setSelCase(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              {/* tabs */}
              <div className="flex border-b border-slate-200 bg-white px-5 shrink-0">
                {([
                  {k:"info",        l:"Case Info",    I:Briefcase},
                  {k:"parties",     l:`Parties (${dedupeById(selCase.caseParties??[]).length})`, I:Users},
                  {k:"attachments", l:`Files (${selCase.attachments?.length??0})`, I:Paperclip},
                ] as {k:DetailsTab;l:string;I:React.FC<{className?:string}>}[]).map(({k,l,I})=>(
                  <button key={k} onClick={()=>setDetailTab(k)}
                    className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold border-b-2 -mb-px transition-all ${detailTab===k ? "border-slate-900 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"}`}>
                    <I className="w-3.5 h-3.5"/>{l}
                  </button>
                ))}
              </div>

              {/* tab body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {detailTab==="info" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Overview</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 rounded-xl border border-slate-200 p-4">
                        {([["Case Number",selCase.caseNumber],["First Name",selCase.firstName],["Last Name",selCase.lastName],
                           ["Court",selCase.court||"—"],["Crime Type",selCase.crimeType||"—"],["Date",selCase.crimeCommittedDate||"—"],
                           ["Time",selCase.crimeCommittedTime||"—"],["Category",selCase.crimeCategory||"—"],
                        ] as [string,string][]).map(([l,v])=>(
                          <div key={l}>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                            <p className="text-sm font-bold text-slate-800 leading-snug">{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selCase.caseSummary && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Case Summary</p>
                        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4">
                          <p className="text-sm text-slate-950 leading-relaxed font-medium">{selCase.caseSummary}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Crime Description</p>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{selCase.crimeDescription||selCase.description||"No description available."}</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab==="parties" && (()=>{
                  const ps = dedupeById(selCase.caseParties??[])
                  return ps.length===0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><Users className="w-5 h-5 text-slate-300"/></div>
                      <p className="text-sm font-bold text-slate-500 mb-1">No parties on record</p>
                      <p className="text-xs text-slate-400 font-medium">No parties were registered for this case</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ps.map(p=>(
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="flex items-center gap-3.5 p-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-white"/>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {p.role&&<span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold capitalize">{p.role}</span>}
                                {p.gender&&<span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded text-[10px] font-bold">{p.gender}</span>}
                                {p.status&&<span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{p.status}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-slate-100 px-4 py-3.5 grid grid-cols-2 gap-3 bg-slate-50">
                            {([["ID Number",p.idNumber],["Date of Birth",p.dateOfBirth],["Phone",p.phone],["Email",p.email]] as [string,string][]).map(([l,v])=>(
                              <div key={l}><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{l}</p><p className="text-xs text-slate-700 font-semibold truncate">{v||"—"}</p></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {detailTab==="attachments" && (
                  <div className="space-y-2.5">
                    {!selCase.attachments?.length ? (
                      <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3"><Paperclip className="w-5 h-5 text-slate-300"/></div>
                        <p className="text-sm font-bold text-slate-500 mb-1">No attachments</p>
                        <p className="text-xs text-slate-400 font-medium">No files were uploaded for this case</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-slate-400 font-bold mb-3 uppercase tracking-wide">
                          {selCase.attachments.length} file{selCase.attachments.length!==1?"s":""} attached — click to open or download
                        </p>
                        {selCase.attachments.map((f,i)=>(
                          <div key={i} className="flex items-center gap-3.5 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm"><FileIcon file={f}/></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{f.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{formatBytes(f.size)} · {f.type||"Unknown"}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={()=>openFile(f)} title="Open" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"><ExternalLink className="w-4 h-4"/></button>
                              <button onClick={()=>dlFile(f)}   title="Download" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><Download className="w-4 h-4"/></button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
                <button onClick={()=>setSelCase(null)}
                  className="w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}