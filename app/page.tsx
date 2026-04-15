"use client"
import { useState, useEffect, useRef } from "react"
import { Search, Filter, Plus, ChevronDown, X, Eye, User, MessageCircle, Send, Loader2, Paperclip, FileText, Image as ImageIcon, File, ExternalLink, Download, Edit2, ChevronLeft, ChevronRight } from "lucide-react"
import Login from "@/components/login"

// Initial cases data
const initialCases = [
  { id: 1, firstName: "Cedric", lastName: "Manzi", caseNumber: "CW-2026-001", status: "Open", description: "Property dispute case", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Property Dispute", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Dispute over land ownership boundaries between two neighboring families.", caseParties: [], attachments: [] },
  { id: 2, firstName: "Jane", lastName: "Muhoza", caseNumber: "CW-2026-002", status: "Pending", description: "Civil litigation matter", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Litigation", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Civil litigation matter regarding contractual obligations.", caseParties: [], attachments: [] },
  { id: 3, firstName: "Robert", lastName: "Kalisa", caseNumber: "CW-2026-003", status: "Open", description: "Contract breach case", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Contract Breach", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Breach of service agreement between business partners.", caseParties: [], attachments: [] },
  { id: 4, firstName: "Emille", lastName: "Gakuba", caseNumber: "CW-2026-004", status: "Closed", description: "Employment dispute", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Employment Dispute", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Wrongful termination claim filed by former employee.", caseParties: [], attachments: [] },
  { id: 5, firstName: "Michael", lastName: "Rugamba", caseNumber: "CW-2026-005", status: "Open", description: "Insurance claim case", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Insurance Claim", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Disputed insurance claim following vehicle accident.", caseParties: [], attachments: [] },
  { id: 6, firstName: "Sarah", lastName: "Mbabazi", caseNumber: "CW-2026-006", status: "Pending", description: "Family law matter", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Family Law", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Custody arrangement proceedings involving minor children.", caseParties: [], attachments: [] },
  { id: 7, firstName: "David", lastName: "Mugisha", caseNumber: "CW-2026-007", status: "Open", description: "Business partnership dispute", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Partnership Dispute", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Dissolution of business partnership and asset division.", caseParties: [], attachments: [] },
  { id: 8, firstName: "Grace", lastName: "Cyusa", caseNumber: "CW-2026-008", status: "Open", description: "Real estate transaction", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "Real Estate", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Fraudulent real estate transaction dispute.", caseParties: [], attachments: [] },
  { id: 9, firstName: "Patrick", lastName: "Hirwa", caseNumber: "CW-2026-009", status: "Pending", description: "Intellectual property case", court: "", caseSummary: "", crimeCategory: "Civil Case", crimeType: "IP Infringement", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Trademark infringement claim by registered IP owner.", caseParties: [], attachments: [] },
  { id: 10, firstName: "Jean", lastName: "Manzi", caseNumber: "CW-2026-010", status: "Open", description: "Criminal defense case", court: "", caseSummary: "", crimeCategory: "Criminal Case", crimeType: "Criminal Defense", crimeCommittedDate: "", crimeCommittedTime: "", crimeDescription: "Criminal defense proceedings for assault charges.", caseParties: [], attachments: [] },
]

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

// Helper to get file icon based on type
function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-blue-500" />
  if (file.type === "application/pdf") return <FileText className="w-4 h-4 text-red-500" />
  return <File className="w-4 h-4 text-slate-500" />
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-md transition-colors ${
              currentPage === page
                ? "bg-slate-800 text-white"
                : "border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// Toast notification component
function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border flex items-center gap-3 animate-slide-in ${
        toast.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : toast.type === "error"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
      }`}
    >
      <span className="font-medium">{toast.message}</span>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function CaseWiseDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [cases, setCases] = useState<Case[]>(initialCases)
  const [myCases, setMyCases] = useState<Case[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    caseNumber: "",
    status: ""
  })
  const [activeView, setActiveView] = useState<"registration" | "manageCases" | "laws">("registration")
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const [newCase, setNewCase] = useState({
    caseTitle: "",
    court: "",
    caseSummary: "",
    crimeCategory: "Criminal Case",
    crimeType: "",
    crimeCommittedDate: "",
    crimeCommittedTime: "",
    crimeDescription: "",
    casePartyFirstName: "",
    casePartyLastName: "",
    casePartyIDNumber: "",
    casePartyGender: "",
    casePartyDOB: "",
    casePartyStatus: "Single",
    casePartyRole: { witness: false, suspect: false, defendant: false },
    casePartyPhone: "",
    casePartyEmail: "",
    attachments: [] as File[]
  })
  const [caseParties, setCaseParties] = useState<CaseParty[]>([])
  const [expandedParties, setExpandedParties] = useState<Set<string>>(new Set())
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null)
  const [activeDetailsTab, setActiveDetailsTab] = useState<"info" | "parties" | "attachments">("info")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lawAttachments, setLawAttachments] = useState<File[]>([])

  // Pagination state
  const [dashboardPage, setDashboardPage] = useState(1)
  const [manageCasesPage, setManageCasesPage] = useState(1)
  const itemsPerPage = 5

  // ── Chatbot state ──────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm the CaseWise AI assistant. Ask me anything about your cases, legal procedures, or how to use this system.",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Load cases from backend
  useEffect(() => {
    fetch("http://localhost:8080/api/cases")
      .then(res => res.json())
      .then(data => { if (data.data) setCases(data.data) })
      .catch(() => console.log("Using local data"))
  }, [])

  // Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedEmail = localStorage.getItem('userEmail')
    if (storedToken && storedEmail) {
      setAuthToken(storedToken)
      setUserEmail(storedEmail)
      setIsLoggedIn(true)
    }
  }, [])

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewFile) URL.revokeObjectURL(previewFile.url)
    }
  }, [previewFile])

  const handleLogin = (email: string, token: string) => {
    setUserEmail(email)
    setAuthToken(token)
    setIsLoggedIn(true)
    localStorage.setItem('authToken', token)
    localStorage.setItem('userEmail', email)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserEmail("")
    setAuthToken(null)
    setMyCases([])
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
  }

  // Toast management
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  // ── Open attachment preview ─────────────────────────────────
  const handleOpenAttachment = (file: File) => {
    if (previewFile) URL.revokeObjectURL(previewFile.url)
    const url = URL.createObjectURL(file)
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      window.open(url, "_blank")
    } else {
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      a.click()
    }
    setPreviewFile({ file, url })
  }

  const handleDownloadAttachment = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // ── Chatbot send message ───────────────────────────────────
  const handleChatSend = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text }
    const updatedMessages = [...chatMessages, userMsg]
    setChatMessages(updatedMessages)
    setChatInput("")
    setChatLoading(true)

    try {
      const systemPrompt = `You are CaseWise AI, a helpful legal case management assistant embedded in the CaseWise platform used in Rwanda.
You help lawyers and legal professionals with:
- Understanding their cases
- Legal procedures and terminology
- How to use the CaseWise system
- General legal guidance

Current cases in the system:
${cases.map(c => `- ${c.caseNumber}: ${c.firstName} ${c.lastName} (${c.status}) — ${c.description}`).join("\n")}

Be concise, professional, and helpful. If asked about specific cases, refer to the data above.`

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: updatedMessages
            .filter(m => m.id !== "welcome")
            .map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()
      const reply = data.content?.[0]?.text ?? "Sorry, I could not get a response. Please try again."

      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: reply },
      ])
    } catch {
      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: "Connection error. Please check your network and try again." },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const toggleFilter = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter)
  }

  const selectFilterOption = (filter: string, option: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: prev[filter] === option ? "" : option,
    }))
    setActiveFilter(null)
  }

  const generateCaseNumber = () => {
    const nextId = cases.length + 1
    return `CW-2026-${String(nextId).padStart(3, "0")}`
  }

  const handleRegisterCase = async () => {
    if (!newCase.caseTitle) {
      showToast("Please fill in case title", "error")
      return
    }
    if (caseParties.length === 0) {
      showToast("Please add at least one case party", "error")
      return
    }

    const isEditing = !!editingCase

    // If editing, update the existing case
    if (isEditing) {
      const updatedCase: Case = {
        ...editingCase,
        description: newCase.caseSummary || "Updated case",
        court: newCase.court,
        caseSummary: newCase.caseSummary,
        crimeCategory: newCase.crimeCategory,
        crimeType: newCase.crimeType,
        crimeCommittedDate: newCase.crimeCommittedDate,
        crimeCommittedTime: newCase.crimeCommittedTime,
        crimeDescription: newCase.crimeDescription,
        caseParties: caseParties,
        attachments: newCase.attachments,
      }

      setCases(prev => prev.map(c => c.id === editingCase.id ? updatedCase : c))
      setMyCases(prev => prev.map(c => c.id === editingCase.id ? updatedCase : c))
      setShowRegisterModal(false)
      setEditingCase(null)
      showToast("Case Updated Successfully", "success")
      resetForm()
      return
    }

    // Existing registration logic
    console.log("=== COMPREHENSIVE BACKEND TESTING ===")
    const testResults = []

    try {
      const test1 = await fetch("http://localhost:8080/", { method: "GET" })
      testResults.push({ test: "Root GET", status: test1.status, ok: test1.ok })
    } catch (e: unknown) {
      testResults.push({ test: "Root GET", error: e instanceof Error ? e.message : String(e) })
    }

    try {
      const test2 = await fetch("http://localhost:8080/api/cases", { method: "GET" })
      testResults.push({ test: "GET /api/cases", status: test2.status, ok: test2.ok })
    } catch (e: unknown) {
      testResults.push({ test: "GET /api/cases", error: e instanceof Error ? e.message : String(e) })
    }

    try {
      const test3 = await fetch("http://localhost:8080/api/cases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" })
      })
      testResults.push({ test: "POST /api/cases/create (no auth)", status: test3.status, ok: test3.ok })
    } catch (e: unknown) {
      testResults.push({ test: "POST /api/cases/create (no auth)", error: e instanceof Error ? e.message : String(e) })
    }

    const token = authToken || localStorage.getItem('authToken')
    try {
      const test4 = await fetch("http://localhost:8080/api/cases/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ test: "data" })
      })
      testResults.push({ test: "POST /api/cases/create (with auth)", status: test4.status, ok: test4.ok })
    } catch (e: unknown) {
      testResults.push({ test: "POST /api/cases/create (with auth)", error: e instanceof Error ? e.message : String(e) })
    }

    console.log("Test Results:", testResults)

    const workingTests = testResults.filter(t => t.ok)
    if (workingTests.length === 0) {
      const localCase: Case = {
        id: cases.length + 1,
        firstName: caseParties[0]?.firstName || "",
        lastName: caseParties[0]?.lastName || "",
        caseNumber: generateCaseNumber(),
        status: "Open",
        description: newCase.caseSummary || "New case registration",
        court: newCase.court,
        caseSummary: newCase.caseSummary,
        crimeCategory: newCase.crimeCategory,
        crimeType: newCase.crimeType,
        crimeCommittedDate: newCase.crimeCommittedDate,
        crimeCommittedTime: newCase.crimeCommittedTime,
        crimeDescription: newCase.crimeDescription,
        caseParties: caseParties,
        attachments: newCase.attachments,
      }
      setCases(prev => [...prev, localCase])
      setMyCases(prev => [...prev, localCase])
      setShowRegisterModal(false)
      showToast("Register Case Successful", "success")
      resetForm()
      return
    }

    const noAuthWorks = testResults.find(t => t.test === "POST /api/cases/create (no auth)" && t.ok)
    const withAuthWorks = testResults.find(t => t.test === "POST /api/cases/create (with auth)" && t.ok)

    const payload = {
      firstName: caseParties[0]?.firstName || "",
      lastName: caseParties[0]?.lastName || "",
      caseTitle: newCase.caseTitle,
      courtName: newCase.court,
      caseSummary: newCase.caseSummary,
      crimeCategory: newCase.crimeCategory,
      crimeType: newCase.crimeType,
      crimeDescription: newCase.crimeDescription,
      crimeCommittedDate: newCase.crimeCommittedDate,
      crimeCommittedTime: newCase.crimeCommittedTime,
      caseParties: caseParties.map(party => ({
        firstName: party.firstName,
        lastName: party.lastName,
        dateOfBirth: party.dateOfBirth,
        gender: party.gender,
        phoneNumber: party.phone,
        email: party.email,
        role: party.role,
        CaseID: ""
      })),
      attachments: []
    }

    try {
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
      if (withAuthWorks && token) {
        requestHeaders["Authorization"] = `Bearer ${token}`
      } else if (!noAuthWorks && token) {
        requestHeaders["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch("http://localhost:8080/api/cases/create", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(payload)
      })

      let data
      let responseText = ""
      try {
        responseText = await response.text()
        if (responseText && responseText.trim().length > 0) {
          data = JSON.parse(responseText)
        } else {
          data = { message: "Empty response from server" }
        }
      } catch {
        showToast("Server response is not valid JSON", "error")
        return
      }

      if (response.ok) {
        const caseToAdd: Case = {
          id: data.data?.id || cases.length + 1,
          firstName: caseParties[0]?.firstName || "",
          lastName: caseParties[0]?.lastName || "",
          caseNumber: data.data?.caseNumber || generateCaseNumber(),
          status: "Open",
          description: newCase.caseSummary || "New case registration",
          court: newCase.court,
          caseSummary: newCase.caseSummary,
          crimeCategory: newCase.crimeCategory,
          crimeType: newCase.crimeType,
          crimeCommittedDate: newCase.crimeCommittedDate,
          crimeCommittedTime: newCase.crimeCommittedTime,
          crimeDescription: newCase.crimeDescription,
          caseParties: caseParties,
          attachments: newCase.attachments,
        }
        setCases([...cases, caseToAdd])
        setMyCases([...myCases, caseToAdd])
        setShowRegisterModal(false)
        showToast("Register Case Successful", "success")
        resetForm()
      } else if (response.status === 401 || response.status === 403) {
        try {
          const altResponse = await fetch("http://localhost:8080/api/cases/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
          if (altResponse.ok) {
            showToast("Register Case Successful", "success")
            setShowRegisterModal(false)
            return
          }
        } catch { /* ignore */ }
        showToast("Authentication failed. Please re-login.", "error")
        handleLogout()
      } else if (response.status === 404) {
        showToast("Endpoint not found", "error")
      } else if (response.status >= 500) {
        showToast("Server error. Please check the backend logs.", "error")
      } else {
        showToast(data?.message || "Registration failed", "error")
      }
    } catch {
      showToast("Cannot connect to server", "error")
    }
  }

  const resetForm = () => {
    setNewCase({
      caseTitle: "", court: "", caseSummary: "",
      crimeCategory: "Criminal Case", crimeType: "",
      crimeCommittedDate: "", crimeCommittedTime: "",
      crimeDescription: "", casePartyFirstName: "",
      casePartyLastName: "", casePartyIDNumber: "",
      casePartyGender: "", casePartyDOB: "",
      casePartyStatus: "Single",
      casePartyRole: { witness: false, suspect: false, defendant: false },
      casePartyPhone: "", casePartyEmail: "",
      attachments: []
    })
    setCaseParties([])
  }

  const handleAddCaseParty = () => {
    if (!newCase.casePartyFirstName || !newCase.casePartyLastName) {
      showToast("Please enter first name and last name", "error")
      return
    }
    const newParty: CaseParty = {
      id: Date.now().toString(),
      firstName: newCase.casePartyFirstName,
      lastName: newCase.casePartyLastName,
      role: Object.entries(newCase.casePartyRole).filter(([_, v]) => v).map(([r]) => r).join(", ") || "Unknown",
      idNumber: newCase.casePartyIDNumber,
      phone: newCase.casePartyPhone,
      email: newCase.casePartyEmail,
      gender: newCase.casePartyGender,
      dateOfBirth: newCase.casePartyDOB,
      status: newCase.casePartyStatus
    }
    setCaseParties([...caseParties, newParty])
    setNewCase({
      ...newCase,
      casePartyFirstName: "", casePartyLastName: "",
      casePartyIDNumber: "", casePartyGender: "",
      casePartyDOB: "", casePartyStatus: "Single",
      casePartyRole: { witness: false, suspect: false, defendant: false },
      casePartyPhone: "", casePartyEmail: "",
    })
  }

  const togglePartyExpansion = (partyId: string) => {
    const newExpanded = new Set(expandedParties)
    if (newExpanded.has(partyId)) newExpanded.delete(partyId)
    else newExpanded.add(partyId)
    setExpandedParties(newExpanded)
  }

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem)
    setNewCase({
      caseTitle: caseItem.description,
      court: caseItem.court,
      caseSummary: caseItem.caseSummary,
      crimeCategory: caseItem.crimeCategory,
      crimeType: caseItem.crimeType,
      crimeCommittedDate: caseItem.crimeCommittedDate,
      crimeCommittedTime: caseItem.crimeCommittedTime,
      crimeDescription: caseItem.crimeDescription,
      casePartyFirstName: "",
      casePartyLastName: "",
      casePartyIDNumber: "",
      casePartyGender: "",
      casePartyDOB: "",
      casePartyStatus: "Single",
      casePartyRole: { witness: false, suspect: false, defendant: false },
      casePartyPhone: "",
      casePartyEmail: "",
      attachments: caseItem.attachments || []
    })
    setCaseParties(caseItem.caseParties || [])
    setShowRegisterModal(true)
  }

  // Apply filters and search
  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q)

    const matchesCaseNumber = !selectedFilters.caseNumber || c.caseNumber === selectedFilters.caseNumber
    const matchesStatus = !selectedFilters.status || c.status === selectedFilters.status

    return matchesSearch && matchesCaseNumber && matchesStatus
  })

  const filteredMyCases = myCases.filter((c) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q)

    const matchesCaseNumber = !selectedFilters.caseNumber || c.caseNumber === selectedFilters.caseNumber
    const matchesStatus = !selectedFilters.status || c.status === selectedFilters.status

    return matchesSearch && matchesCaseNumber && matchesStatus
  })

  // Get unique case numbers and statuses for filter dropdowns
  const uniqueCaseNumbers = Array.from(new Set(cases.map(c => c.caseNumber)))
  const uniqueStatuses = Array.from(new Set(cases.map(c => c.status)))

  // Pagination logic
  const paginateData = (data: Case[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const dashboardTotalPages = Math.ceil(filteredCases.length / itemsPerPage)
  const manageCasesTotalPages = Math.ceil(filteredMyCases.length / itemsPerPage)

  const paginatedDashboardCases = paginateData(filteredCases, dashboardPage)
  const paginatedManageCases = paginateData(filteredMyCases, manageCasesPage)

  // Shared table renderer
  const renderCaseTable = (caseList: Case[], showEdit: boolean = false) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">First Name</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Last Name</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Case Number</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {caseList.map((caseItem, index) => (
            <tr
              key={caseItem.id}
              className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
              }`}
            >
              <td className="px-6 py-4 text-sm text-slate-600">{caseItem.firstName}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{caseItem.lastName}</td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => {
                    setSelectedCase(caseItem)
                    setActiveDetailsTab("info")
                  }}
                  className="text-slate-800 font-medium hover:text-slate-600 hover:underline transition-colors"
                >
                  {caseItem.caseNumber}
                </button>
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  caseItem.status === "Open"
                    ? "bg-green-100 text-green-700"
                    : caseItem.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {caseItem.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCase(caseItem)
                      setActiveDetailsTab("info")
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  {showEdit && (
                    <button
                      onClick={() => handleEditCase(caseItem)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast notifications */}
      {toasts.map(toast => (
        <ToastNotification key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}

      {/* Navbar */}
      <nav className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span>⚖️</span> CaseWise
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-4 h-4" />
            <span className="text-sm">{userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white min-h-[calc(100vh-64px)] border-r border-slate-200 p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView("registration")}
              className={`w-full text-left block px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === "registration" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Case Registration
            </button>
            <button
              onClick={() => setActiveView("manageCases")}
              className={`w-full text-left block px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === "manageCases" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Manage Cases {myCases.length > 0 && `(${myCases.length})`}
            </button>
            <button
              onClick={() => setActiveView("laws")}
              className={`w-full text-left block px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === "laws" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Laws
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">

            {/* Case Registration View */}
            {activeView === "registration" && (
              <>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Case Management</h2>

                {/* Register Button - Moved to top */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      setEditingCase(null)
                      resetForm()
                      setShowRegisterModal(true)
                    }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Register New Case
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search cases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filters:</span>
                      </div>
                      
                      {/* Case Number Filter */}
                      <div className="relative">
                        <button
                          onClick={() => toggleFilter("caseNumber")}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            selectedFilters.caseNumber
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span>Case Number</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${activeFilter === "caseNumber" ? "rotate-180" : ""}`} />
                        </button>
                        {activeFilter === "caseNumber" && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <div className="max-h-40 overflow-y-auto">
                              {uniqueCaseNumbers.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => selectFilterOption("caseNumber", option)}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                    selectedFilters.caseNumber === option ? "bg-slate-100 text-slate-800 font-medium" : "text-slate-600"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Filter */}
                      <div className="relative">
                        <button
                          onClick={() => toggleFilter("status")}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                            selectedFilters.status
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span>Status</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${activeFilter === "status" ? "rotate-180" : ""}`} />
                        </button>
                        {activeFilter === "status" && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <div className="max-h-40 overflow-y-auto">
                              {uniqueStatuses.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => selectFilterOption("status", option)}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                    selectedFilters.status === option ? "bg-slate-100 text-slate-800 font-medium" : "text-slate-600"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {(selectedFilters.caseNumber || selectedFilters.status) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">Active:</span>
                      {selectedFilters.caseNumber && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                          {selectedFilters.caseNumber}
                          <button onClick={() => selectFilterOption("caseNumber", selectedFilters.caseNumber)} className="hover:text-slate-900">×</button>
                        </span>
                      )}
                      {selectedFilters.status && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                          {selectedFilters.status}
                          <button onClick={() => selectFilterOption("status", selectedFilters.status)} className="hover:text-slate-900">×</button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {renderCaseTable(paginatedDashboardCases)}
                
                {dashboardTotalPages > 1 && (
                  <Pagination 
                    currentPage={dashboardPage} 
                    totalPages={dashboardTotalPages} 
                    onPageChange={setDashboardPage} 
                  />
                )}
              </>
            )}

            {/* Manage Cases View */}
            {activeView === "manageCases" && (
              <>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Manage Cases</h2>
                {myCases.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No cases yet</h3>
                    <p className="text-slate-500 mb-4">Add cases from the Case Registration page or register a new case.</p>
                    <button
                      onClick={() => setActiveView("registration")}
                      className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Go to Case Registration
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Search and Filters for Manage Cases */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {renderCaseTable(paginatedManageCases, true)}
                    
                    {manageCasesTotalPages > 1 && (
                      <Pagination 
                        currentPage={manageCasesPage} 
                        totalPages={manageCasesTotalPages} 
                        onPageChange={setManageCasesPage} 
                      />
                    )}
                  </>
                )}
              </>
            )}

            {/* Laws View */}
            {activeView === "laws" && (
              <>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Laws</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-medium text-slate-700 mb-4">Legal Reference Materials</h3>
                  <p className="text-slate-500 mb-6">Upload legal documents, statutes, and reference materials.</p>
                  
                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Upload Attachments
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          setLawAttachments(prev => [...prev, ...files])
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-800 file:text-white hover:file:bg-slate-700 transition-all"
                      />
                    </div>

                    {lawAttachments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700">
                          Uploaded Files ({lawAttachments.length})
                        </h4>
                        {lawAttachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-slate-300 hover:bg-white transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                              {getFileIcon(file)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-800 truncate">{file.name}</div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                            <button
                              onClick={() => setLawAttachments(prev => prev.filter((_, i) => i !== idx))}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Chatbot FAB - Moved to bottom-right ─────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {chatOpen && (
          <div
            className="w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
            style={{ height: "420px" }}
          >
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">CaseWise AI</p>
                <p className="text-xs text-slate-400">Ask about your cases</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-800 text-white rounded-br-sm"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-3 py-2">
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
            <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 bg-white flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
              />
              <button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatLoading}
                className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg transition-all hover:shadow-xl hover:scale-105 border-2 border-slate-700 relative"
          title="Ask CaseWise AI"
        >
          {chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
          {!chatOpen && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>
      {/* ──────────────────────────────────────────────────────────────── */}

      {/* Register/Edit Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {editingCase ? "Edit Case" : "Register New Case"}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {editingCase ? "Update case details and parties" : "Fill in the case details and add involved parties"}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowRegisterModal(false)
                  setEditingCase(null)
                  resetForm()
                }} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Case Details */}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Case Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Number</label>
                      <input 
                        type="text" 
                        value={editingCase ? editingCase.caseNumber : generateCaseNumber()} 
                        readOnly 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Title</label>
                      <input type="text" value={newCase.caseTitle} onChange={(e) => setNewCase({ ...newCase, caseTitle: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter case title" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Court</label>
                      <input type="text" value={newCase.court} onChange={(e) => setNewCase({ ...newCase, court: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter court name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Summary</label>
                      <textarea value={newCase.caseSummary} onChange={(e) => setNewCase({ ...newCase, caseSummary: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows={3} placeholder="Enter case summary" />
                    </div>
                  </div>
                </div>

                {/* Crime Info */}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Crime Info</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Crime Category</label>
                      <select value={newCase.crimeCategory} onChange={(e) => setNewCase({ ...newCase, crimeCategory: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Criminal Case">Criminal Case</option>
                        <option value="Civil Case">Civil Case</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Crime Type</label>
                      <input type="text" value={newCase.crimeType} onChange={(e) => setNewCase({ ...newCase, crimeType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter crime type" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Crime Committed Date</label>
                        <input type="date" value={newCase.crimeCommittedDate} onChange={(e) => setNewCase({ ...newCase, crimeCommittedDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Crime Committed Time</label>
                        <input type="time" value={newCase.crimeCommittedTime} onChange={(e) => setNewCase({ ...newCase, crimeCommittedTime: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Crime Description</label>
                      <textarea value={newCase.crimeDescription} onChange={(e) => setNewCase({ ...newCase, crimeDescription: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows={3} placeholder="Enter crime description" />
                    </div>
                  </div>
                </div>

                {/* Case Party */}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Case Party</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input type="text" value={newCase.casePartyFirstName} onChange={(e) => setNewCase({ ...newCase, casePartyFirstName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="First name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input type="text" value={newCase.casePartyLastName} onChange={(e) => setNewCase({ ...newCase, casePartyLastName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Last name" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ID Number</label>
                      <input type="text" value={newCase.casePartyIDNumber} onChange={(e) => setNewCase({ ...newCase, casePartyIDNumber: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="ID number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select value={newCase.casePartyGender} onChange={(e) => setNewCase({ ...newCase, casePartyGender: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                      <input type="date" value={newCase.casePartyDOB} onChange={(e) => setNewCase({ ...newCase, casePartyDOB: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select value={newCase.casePartyStatus} onChange={(e) => setNewCase({ ...newCase, casePartyStatus: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                      <div className="flex gap-4">
                        {(["witness", "suspect", "defendant"] as const).map((role) => (
                          <label key={role} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newCase.casePartyRole[role]}
                              onChange={(e) => setNewCase({ ...newCase, casePartyRole: { ...newCase.casePartyRole, [role]: e.target.checked } })}
                              className="mr-2"
                            />
                            <span className="text-sm text-slate-700 capitalize">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input type="tel" value={newCase.casePartyPhone} onChange={(e) => setNewCase({ ...newCase, casePartyPhone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Phone number" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" value={newCase.casePartyEmail} onChange={(e) => setNewCase({ ...newCase, casePartyEmail: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Email address" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Attachments</h4>
                  <input type="file" multiple onChange={(e) => setNewCase({ ...newCase, attachments: Array.from(e.target.files || []) })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  {newCase.attachments.length > 0 && (
                    <div className="mt-2 text-sm text-slate-600">{newCase.attachments.length} file(s) selected</div>
                  )}
                </div>

                {/* Party List */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Case Parties
                  </h4>
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-3">Added Parties ({caseParties.length})</h5>
                    {caseParties.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-slate-200">
                        <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm text-slate-500">No case parties added yet</div>
                        <div className="text-xs text-slate-400 mt-1">Add parties using the form above</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {caseParties.map((party) => (
                          <div key={party.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div onClick={() => togglePartyExpansion(party.id)} className="flex items-center justify-between p-4 hover:bg-blue-50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-blue-600">{party.firstName} {party.lastName}</div>
                                  <div className="flex items-center gap-2 text-sm mt-1">
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{party.role}</span>
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">ID: {party.idNumber ? party.idNumber.substring(0, 6) + '...' : 'Not provided'}</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedParties.has(party.id) ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedParties.has(party.id) && (
                              <div className="px-4 pb-4 border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                  {[["ID Number", party.idNumber], ["Phone", party.phone], ["Email", party.email], ["Gender", party.gender], ["Date of Birth", party.dateOfBirth], ["Status", party.status]].map(([label, value]) => (
                                    <div key={label} className="space-y-1">
                                      <span className="font-medium text-slate-700 text-xs uppercase tracking-wide">{label}</span>
                                      <div className="text-slate-600 font-mono">{value || 'Not provided'}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddCaseParty}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Case Party
                </button>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <button 
                onClick={() => {
                  setShowRegisterModal(false)
                  setEditingCase(null)
                  resetForm()
                }} 
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterCase}
                disabled={!newCase.caseTitle || caseParties.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {editingCase ? "Update Case" : "Register Case"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Case Details Modal ──────────────────────────────────────── */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-800 to-slate-700">
              <div>
                <h3 className="text-xl font-semibold text-white">Case Details</h3>
                <p className="text-sm text-slate-300 mt-1">{selectedCase.caseNumber}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-300 hover:text-white transition-colors p-2 hover:bg-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6 pt-4 gap-1">
              {(["info", "parties", "attachments"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDetailsTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors capitalize ${
                    activeDetailsTab === tab
                      ? "border-slate-800 text-slate-800 bg-slate-50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tab === "info" ? "Case Info" : tab === "parties" ? `Parties (${selectedCase.caseParties?.length ?? 0})` : `Attachments (${selectedCase.attachments?.length ?? 0})`}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ── Info Tab ── */}
              {activeDetailsTab === "info" && (
                <div className="space-y-6">
                  {/* Case Overview */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Case Overview</h4>
                    <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                      {[
                        ["Case Number", selectedCase.caseNumber],
                        ["Status", selectedCase.status],
                        ["First Name", selectedCase.firstName],
                        ["Last Name", selectedCase.lastName],
                        ["Court", selectedCase.court || "—"],
                        ["Crime Category", selectedCase.crimeCategory || "—"],
                        ["Crime Type", selectedCase.crimeType || "—"],
                        ["Crime Date", selectedCase.crimeCommittedDate || "—"],
                        ["Crime Time", selectedCase.crimeCommittedTime || "—"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
                          <div className={`text-sm mt-0.5 ${label === "Status"
                            ? selectedCase.status === "Open"
                              ? "inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                              : selectedCase.status === "Pending"
                              ? "inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
                              : "inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                            : "text-slate-700 font-medium"}`}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Case Summary */}
                  {selectedCase.caseSummary && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Case Summary</h4>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedCase.caseSummary}</p>
                      </div>
                    </div>
                  )}

                  {/* Crime Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Crime Description</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {selectedCase.crimeDescription || selectedCase.description || "No description available."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Parties Tab ── */}
              {activeDetailsTab === "parties" && (
                <div className="space-y-3">
                  {!selectedCase.caseParties || selectedCase.caseParties.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No case parties on record</p>
                    </div>
                  ) : (
                    selectedCase.caseParties.map((party) => (
                      <div key={party.id} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-3 p-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800">{party.firstName} {party.lastName}</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium capitalize">{party.role}</span>
                              {party.gender && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{party.gender}</span>}
                              {party.status && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{party.status}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-slate-200 px-4 py-3 grid grid-cols-2 gap-3 bg-white">
                          {[
                            ["ID Number", party.idNumber],
                            ["Date of Birth", party.dateOfBirth],
                            ["Phone", party.phone],
                            ["Email", party.email],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
                              <div className="text-sm text-slate-700 mt-0.5 font-mono truncate">{value || "—"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Attachments Tab ── */}
              {activeDetailsTab === "attachments" && (
                <div className="space-y-3">
                  {!selectedCase.attachments || selectedCase.attachments.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <Paperclip className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No attachments uploaded for this case</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500 mb-4">
                        {selectedCase.attachments.length} file{selectedCase.attachments.length !== 1 ? "s" : ""} attached — click to open, or download individually.
                      </p>
                      {selectedCase.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:bg-white transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow transition-shadow">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-800 truncate">{file.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {formatFileSize(file.size)} · {file.type || "Unknown type"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleOpenAttachment(file)}
                              title={file.type.startsWith("image/") || file.type === "application/pdf" ? "Open in new tab" : "Open file"}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadAttachment(file)}
                              title="Download"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <button
                onClick={() => setSelectedCase(null)}
                className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add CSS animation for toast
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `
  document.head.appendChild(style)
}