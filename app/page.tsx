"use client"

import { useState } from "react"
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
  const [newCase, setNewCase] = useState({ firstName: "", lastName: "", description: "" })

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
  const handleRegisterCase = () => {
    if (!newCase.firstName || !newCase.lastName) return

    const caseToAdd: Case = {
      id: cases.length + 1,
      firstName: newCase.firstName,
      lastName: newCase.lastName,
      caseNumber: generateCaseNumber(),
      status: "Open",
      description: newCase.description || "New case registration",
    }

    setCases([...cases, caseToAdd])
    setMyCases([...myCases, caseToAdd])
    setNewCase({ firstName: "", lastName: "", description: "" })
    setShowRegisterModal(false)
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Register New Case</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={newCase.firstName}
                  onChange={(e) => setNewCase({ ...newCase, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={newCase.lastName}
                  onChange={(e) => setNewCase({ ...newCase, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Case Description</label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter case description"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-600">
                  Case Number: <span className="font-semibold text-slate-800">{generateCaseNumber()}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Status: <span className="font-semibold text-green-600">Open</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterCase}
                disabled={!newCase.firstName || !newCase.lastName}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
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
