"use client"
import { useState, useEffect, useRef } from "react"
import { Search, Filter, Plus, ChevronDown, X, Eye, User, MessageCircle, Send, Loader2 } from "lucide-react"
import Login from "@/components/login"

// Initial cases data
const initialCases = [
  { id: 1, firstName: "Cedric", lastName: "Manzi", caseNumber: "CW-2026-001", status: "Open", description: "Property dispute case" },
  { id: 2, firstName: "Jane", lastName: "Muhoza", caseNumber: "CW-2026-002", status: "Pending", description: "Civil litigation matter" },
  { id: 3, firstName: "Robert", lastName: "Kalisa", caseNumber: "CW-2026-003", status: "Open", description: "Contract breach case" },
  { id: 4, firstName: "Emille", lastName: "Gakuba", caseNumber: "CW-2026-004", status: "Closed", description: "Employment dispute" },
  { id: 5, firstName: "Michael", lastName: "Rugamba", caseNumber: "CW-2026-005", status: "Open", description: "Insurance claim case" },
  { id: 6, firstName: "Sarah", lastName: "Mbabazi", caseNumber: "CW-2026-006", status: "Pending", description: "Family law matter" },
  { id: 7, firstName: "David", lastName: "Mugisha", caseNumber: "CW-2026-007", status: "Open", description: "Business partnership dispute" },
  { id: 8, firstName: "Grace", lastName: "Cyusa", caseNumber: "CW-2026-008", status: "Open", description: "Real estate transaction" },
  { id: 9, firstName: "Patrick", lastName: "Hirwa", caseNumber: "CW-2026-009", status: "Pending", description: "Intellectual property case" },
  { id: 10, firstName: "Jean", lastName: "Manzi", caseNumber: "CW-2026-010", status: "Open", description: "Criminal defense case" },
]

const filterOptions = {
  caseNumber: ["CW-2026-001", "CW-2026-002", "CW-2026-003", "CW-2026-004", "CW-2026-005"],
  suspect: ["Cedric Manzi", "Robert Kalisa", "Michael Rugamba"],
  victim: ["Jane Muhoza", "Emille Gakuba", "Sarah Mbabazi"],
  names: ["John", "Jane", "Robert", "Emille", "Michael", "Sarah", "David", "Mugisha", "Cyusa", "Hirwa"],
}

type Case = {
  id: number
  firstName: string
  lastName: string
  caseNumber: string
  status: string
  description: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function CaseWiseDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [cases, setCases] = useState<Case[]>(initialCases)
  const [myCases, setMyCases] = useState<Case[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [activeView, setActiveView] = useState<"registration" | "myCases" | "laws">("registration")
  const [showRegisterModal, setShowRegisterModal] = useState(false)
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
  const [caseParties, setCaseParties] = useState<Array<{
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
  }>>([])
  const [expandedParties, setExpandedParties] = useState<Set<string>>(new Set())
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

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
  // ──────────────────────────────────────────────────────────

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

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
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
  // ──────────────────────────────────────────────────────────

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
      alert("Please fill in case title")
      return
    }
    if (caseParties.length === 0) {
      alert("Please add at least one case party")
      return
    }

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
      alert("❌ Backend not accessible at all. Please check if it's running on port 8080.\n\nTest results:\n" + JSON.stringify(testResults, null, 2))
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
        alert("Server response is not valid JSON. Please check the server logs.")
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
        }
        setCases([...cases, caseToAdd])
        setMyCases([...myCases, caseToAdd])
        setShowRegisterModal(false)
        alert("Case registered successfully!")

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
      } else if (response.status === 401 || response.status === 403) {
        try {
          const altResponse = await fetch("http://localhost:8080/api/cases/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
          if (altResponse.ok) {
            alert("Case registered successfully (without auth)!")
            setShowRegisterModal(false)
            return
          }
        } catch { /* ignore */ }
        alert("Authentication failed. Please re-login.\n\nError: " + (data?.message || "Unauthorized"))
        handleLogout()
      } else if (response.status === 404) {
        alert("Endpoint not found: POST /api/cases/create does not exist on the server.")
      } else if (response.status >= 500) {
        alert("Server error. Please check the backend logs.")
      } else {
        alert("Error: " + (data?.message || `${response.status} ${response.statusText}`))
      }
    } catch {
      alert("Cannot connect to server. Please check if the backend is running on http://localhost:8080")
    }
  }

  const addToMyCases = (caseItem: Case) => {
    if (!myCases.find((c) => c.id === caseItem.id)) {
      setMyCases([...myCases, caseItem])
    }
  }

  const removeFromMyCases = (caseId: number) => {
    setMyCases(myCases.filter((c) => c.id !== caseId))
  }

  const handleAddCaseParty = () => {
    if (!newCase.casePartyFirstName || !newCase.casePartyLastName) {
      alert("Please enter first name and last name")
      return
    }
    const newParty = {
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

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-slate-50">
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
              onClick={() => setActiveView("myCases")}
              className={`w-full text-left block px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === "myCases" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              My Cases {myCases.length > 0 && `(${myCases.length})`}
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
                      {(["caseNumber", "suspect", "victim", "names"] as const).map((filter) => (
                        <div key={filter} className="relative">
                          <button
                            onClick={() => toggleFilter(filter)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
                              selectedFilters[filter]
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="capitalize">{filter === "caseNumber" ? "Case Number" : filter}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${activeFilter === filter ? "rotate-180" : ""}`} />
                          </button>
                          {activeFilter === filter && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                              <div className="max-h-40 overflow-y-auto">
                                {filterOptions[filter].map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => selectFilterOption(filter, option)}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                      selectedFilters[filter] === option ? "bg-slate-100 text-slate-800 font-medium" : "text-slate-600"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {Object.values(selectedFilters).some(Boolean) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">Active:</span>
                      {Object.entries(selectedFilters).map(([key, value]) =>
                        value ? (
                          <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                            {value}
                            <button onClick={() => selectFilterOption(key, value)} className="hover:text-slate-900">x</button>
                          </span>
                        ) : null
                      )}
                    </div>
                  )}
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">First Name</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Last Name</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Case Number</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Case Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((caseItem, index) => (
                        <tr key={caseItem.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                          <td className="px-6 py-4 text-sm text-slate-600">{caseItem.firstName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{caseItem.lastName}</td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">{caseItem.caseNumber}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              caseItem.status === "Open" ? "bg-green-100 text-green-700"
                              : caseItem.status === "Pending" ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-700"
                            }`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedCase(caseItem)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                            >
                              {caseItem.description?.substring(0, 50) || "No description"}...
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Register New Case
                  </button>
                </div>
              </>
            )}

            {/* My Cases View */}
            {activeView === "myCases" && (
              <>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">My Cases</h2>
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
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">First Name</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Last Name</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Case Number</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Case Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myCases.map((caseItem, index) => (
                          <tr key={caseItem.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                            <td className="px-6 py-4 text-sm text-slate-600">{caseItem.firstName}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{caseItem.lastName}</td>
                            <td className="px-6 py-4 text-sm text-slate-800 font-medium">{caseItem.caseNumber}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                caseItem.status === "Open" ? "bg-green-100 text-green-700"
                                : caseItem.status === "Pending" ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                              }`}>
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedCase(caseItem)}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                              >
                                {caseItem.description?.substring(0, 50) || "No description"}...
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Laws View */}
            {activeView === "laws" && (
              <>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Laws</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Laws Section</h3>
                  <p className="text-slate-500">Coming soon — Legal reference materials will be available here.</p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Chatbot FAB ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2">

        {/* Chat bubble panel */}
        {chatOpen && (
          <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
               style={{ height: "420px" }}>
            {/* Header */}
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

            {/* Messages */}
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

            {/* Input */}
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

        {/* FAB button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg transition-all hover:shadow-xl hover:scale-105 border-2 border-slate-700 relative"
          title="Ask CaseWise AI"
        >
          {chatOpen
            ? <X className="w-5 h-5" />
            : <MessageCircle className="w-5 h-5" />
          }
          {/* Online dot */}
          {!chatOpen && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>
      {/* ──────────────────────────────────────────────────────────────── */}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Register New Case</h3>
                <p className="text-sm text-slate-600 mt-1">Fill in the case details and add involved parties</p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-lg">
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
                      <input type="text" value={generateCaseNumber()} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600" />
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
              <button onClick={() => setShowRegisterModal(false)} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={handleRegisterCase}
                disabled={!newCase.caseTitle || caseParties.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Register Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Case Details</h3>
                <p className="text-sm text-slate-600 mt-1">{selectedCase.caseNumber}</p>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Case Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-700">Case Number</span>
                      <div className="text-slate-600">{selectedCase.caseNumber}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">Status</span>
                      <div className="text-slate-600">{selectedCase.status}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">First Name</span>
                      <div className="text-slate-600">{selectedCase.firstName}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">Last Name</span>
                      <div className="text-slate-600">{selectedCase.lastName}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Case Description</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">{selectedCase.description || "No description available"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <button onClick={() => setSelectedCase(null)} className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm hover:shadow-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}