"use client"
import { useState, useEffect } from "react"
import { Search, Filter, Plus, ChevronDown, X, Eye, User } from "lucide-react"
import Login from "@/components/login"

// Initial cases data (includes some similar names as requested)
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

export default function CaseWiseDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState("")
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

  // Handle login
  // Load cases from backend
  useEffect(() => {
    fetch("http://localhost:8080/api/cases")
      .then(res => res.json())
      .then(data => { if (data.data) setCases(data.data) })
      .catch(() => console.log("Using local data"))
  }, [])

  // Handle login
  const handleLogin = (email: string) => {
    setUserEmail(email)
    setIsLoggedIn(true)
  }

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserEmail("")
    setMyCases([])
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
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

  // Generate new case number
  const generateCaseNumber = () => {
    const nextId = cases.length + 1
    return `CW-2026-${String(nextId).padStart(3, "0")}`
  }

  // Register a new case
 // Register a new case
  const handleRegisterCase = async () => {
    if (!newCase.caseTitle || !newCase.casePartyFirstName || !newCase.casePartyLastName) return

    const roles = Object.entries(newCase.casePartyRole)
      .filter(([_, selected]) => selected)
      .map(([role]) => role)
      .join(", ")

    const payload = {
      firstName: newCase.casePartyFirstName,
      lastName: newCase.casePartyLastName,
      caseNumber: generateCaseNumber(),
      caseTitle: newCase.caseTitle,
      courtName: newCase.court,
      caseSummary: newCase.caseSummary,
      crimeCategory: newCase.crimeCategory,
      crimeType: newCase.crimeType,
      crimeDescription: newCase.crimeDescription,
      crimeCommittedDate: newCase.crimeCommittedDate,
      crimeCommittedTime: newCase.crimeCommittedTime,
      caseParties: [
        {
          firstName: newCase.casePartyFirstName,
          lastName: newCase.casePartyLastName,
          dateOfBirth: newCase.casePartyDOB,
          gender: newCase.casePartyGender,
          phoneNumber: newCase.casePartyPhone,
          email: newCase.casePartyEmail,
          role: roles,
          CaseID: ""
        }
      ],
      attachments: []
    }

    try {
      const response = await fetch("http://localhost:8080/api/cases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        const caseToAdd: Case = {
          id: data.data?.id || cases.length + 1,
          firstName: newCase.casePartyFirstName,
          lastName: newCase.casePartyLastName,
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
          attachments: [] as File[]
        })
      } else {
        alert("Error: " + (data.message || "Failed to register case"))
      }
    } catch (error) {
      alert("Could not connect to server. Is your backend running?")
      console.error(error)
    }
  }

  // Add existing case to My Cases
  const addToMyCases = (caseItem: Case) => {
    if (!myCases.find((c) => c.id === caseItem.id)) {
      setMyCases([...myCases, caseItem])
    }
  }

  // Remove from My Cases
  const removeFromMyCases = (caseId: number) => {
    setMyCases(myCases.filter((c) => c.id !== caseId))
  }

  // Filter cases based on search
  const filteredCases = cases.filter((c) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower) ||
      c.caseNumber.toLowerCase().includes(searchLower)
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
                activeView === "registration"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Case Registration
            </button>
            <button
              onClick={() => setActiveView("myCases")}
              className={`w-full text-left block px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === "myCases"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              My Cases {myCases.length > 0 && `(${myCases.length})`}
            </button>
            <button
              onClick={() => setActiveView("laws")}
              className={`w-full text-left block px-4 py-3 rounded-lg font-medium transition-colors ${
                activeView === "laws"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
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
                    {/* Search Bar */}
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

                    {/* Filter Dropdowns */}
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
                            <span className="capitalize">
                              {filter === "caseNumber" ? "Case Number" : filter}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${activeFilter === filter ? "rotate-180" : ""}`} />
                          </button>

                          {/* Dropdown */}
                          {activeFilter === filter && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                              <div className="max-h-40 overflow-y-auto">
                                {filterOptions[filter].map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => selectFilterOption(filter, option)}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                      selectedFilters[filter] === option
                                        ? "bg-slate-100 text-slate-800 font-medium"
                                        : "text-slate-600"
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

                  {/* Active Filters Display */}
                  {Object.values(selectedFilters).some(Boolean) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">Active:</span>
                      {Object.entries(selectedFilters).map(
                        ([key, value]) =>
                          value && (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                            >
                              {value}
                              <button
                                onClick={() => selectFilterOption(key, value)}
                                className="hover:text-slate-900"
                              >
                                x
                              </button>
                            </span>
                          )
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
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((caseItem, index) => (
                        <tr
                          key={caseItem.id}
                          className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          <td className="px-6 py-4 text-sm text-slate-600">{caseItem.firstName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{caseItem.lastName}</td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">{caseItem.caseNumber}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                caseItem.status === "Open"
                                  ? "bg-green-100 text-green-700"
                                  : caseItem.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => addToMyCases(caseItem)}
                              disabled={myCases.some((c) => c.id === caseItem.id)}
                              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                                myCases.some((c) => c.id === caseItem.id)
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-slate-800 text-white hover:bg-slate-700"
                              }`}
                            >
                              {myCases.some((c) => c.id === caseItem.id) ? "Added" : "Add to My Cases"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Register Button */}
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
                    <p className="text-slate-500 mb-4">
                      Add cases from the Case Registration page or register a new case.
                    </p>
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
                          <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Description</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myCases.map((caseItem, index) => (
                          <tr
                            key={caseItem.id}
                            className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            }`}
                          >
                            <td className="px-6 py-4 text-sm text-slate-600">{caseItem.firstName}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{caseItem.lastName}</td>
                            <td className="px-6 py-4 text-sm text-slate-800 font-medium">{caseItem.caseNumber}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  caseItem.status === "Open"
                                    ? "bg-green-100 text-green-700"
                                    : caseItem.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {caseItem.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{caseItem.description}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => removeFromMyCases(caseItem.id)}
                                className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                Remove
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

            {/* Laws View (placeholder) */}
            {activeView === "laws" && (
              <>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Laws</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Laws Section</h3>
                  <p className="text-slate-500">Coming soon - Legal reference materials will be available here.</p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800">Register New Case</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
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
                        value={generateCaseNumber()}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600"
                        placeholder="Auto-generated"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Title</label>
                      <input
                        type="text"
                        value={newCase.caseTitle}
                        onChange={(e) => setNewCase({ ...newCase, caseTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter case title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Court</label>
                      <input
                        type="text"
                        value={newCase.court}
                        onChange={(e) => setNewCase({ ...newCase, court: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter court name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Summary</label>
                      <textarea
                        value={newCase.caseSummary}
                        onChange={(e) => setNewCase({ ...newCase, caseSummary: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Enter case summary"
                      />
                    </div>
                  </div>
                </div>

                {/* Crime Info */}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Crime Info</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Crime Category</label>
                      <select
                        value={newCase.crimeCategory}
                        onChange={(e) => setNewCase({ ...newCase, crimeCategory: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Criminal Case">Criminal Case</option>
                        <option value="Civil Case">Civil Case</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Crime Type</label>
                      <input
                        type="text"
                        value={newCase.crimeType}
                        onChange={(e) => setNewCase({ ...newCase, crimeType: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter crime type"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Crime Committed Date</label>
                        <input
                          type="date"
                          value={newCase.crimeCommittedDate}
                          onChange={(e) => setNewCase({ ...newCase, crimeCommittedDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Crime Committed Time</label>
                        <input
                          type="time"
                          value={newCase.crimeCommittedTime}
                          onChange={(e) => setNewCase({ ...newCase, crimeCommittedTime: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Crime Description</label>
                      <textarea
                        value={newCase.crimeDescription}
                        onChange={(e) => setNewCase({ ...newCase, crimeDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Enter crime description"
                      />
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
                        <input
                          type="text"
                          value={newCase.casePartyFirstName}
                          onChange={(e) => setNewCase({ ...newCase, casePartyFirstName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="First name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={newCase.casePartyLastName}
                          onChange={(e) => setNewCase({ ...newCase, casePartyLastName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ID Number</label>
                        <input
                          type="text"
                          value={newCase.casePartyIDNumber}
                          onChange={(e) => setNewCase({ ...newCase, casePartyIDNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="ID number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                        <select
                          value={newCase.casePartyGender}
                          onChange={(e) => setNewCase({ ...newCase, casePartyGender: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={newCase.casePartyDOB}
                          onChange={(e) => setNewCase({ ...newCase, casePartyDOB: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          value={newCase.casePartyStatus}
                          onChange={(e) => setNewCase({ ...newCase, casePartyStatus: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newCase.casePartyRole.witness}
                            onChange={(e) => setNewCase({ 
                              ...newCase, 
                              casePartyRole: { ...newCase.casePartyRole, witness: e.target.checked }
                            })}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">Witness</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newCase.casePartyRole.suspect}
                            onChange={(e) => setNewCase({ 
                              ...newCase, 
                              casePartyRole: { ...newCase.casePartyRole, suspect: e.target.checked }
                            })}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">Suspect</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newCase.casePartyRole.defendant}
                            onChange={(e) => setNewCase({ 
                              ...newCase, 
                              casePartyRole: { ...newCase.casePartyRole, defendant: e.target.checked }
                            })}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-700">Defendant</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={newCase.casePartyPhone}
                          onChange={(e) => setNewCase({ ...newCase, casePartyPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={newCase.casePartyEmail}
                          onChange={(e) => setNewCase({ ...newCase, casePartyEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 mb-4">Attachments</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Add Attachments</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setNewCase({ ...newCase, attachments: Array.from(e.target.files || []) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {newCase.attachments.length > 0 && (
                      <div className="mt-2 text-sm text-slate-600">
                        {newCase.attachments.length} file(s) selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterCase}
                disabled={!newCase.caseTitle || !newCase.casePartyFirstName || !newCase.casePartyLastName}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Register Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


