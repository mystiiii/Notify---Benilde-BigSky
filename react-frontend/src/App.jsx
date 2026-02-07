import { useState, useMemo } from 'react';

// Skeleton Component for a cleaner main file
const SkeletonCard = () => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center animate-pulse">
    <div className="space-y-3">
      <div className="h-3 w-20 bg-gray-200 rounded-full"></div>
      <div className="h-5 w-48 bg-gray-200 rounded-md"></div>
    </div>
    <div className="space-y-2 text-right">
      <div className="h-2 w-12 bg-gray-200 rounded ml-auto"></div>
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Helper to calculate days remaining
const getDaysRemaining = (dueDate) => {
  if (!dueDate || dueDate === 'No Due Date') return null;
  try {
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return null; // Handle invalid dates safely
    const diff = due - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  } catch (e) {
    return null;
  }
};

// Modal Component
const Modal = ({ title, message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title || "Error"}</h3>
              <p className="text-sm text-gray-500">Something went wrong</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-gray-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [data, setData] = useState({ user: null, assignments: [] });
  const [isLoading, setIsLoading] = useState(false);
  // State for advanced filtering
  const [viewMode, setViewMode] = useState("timeline"); // 'timeline' or 'course'
  const [selectedCourses, setSelectedCourses] = useState([]); // Array of strings
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Error State
  const [errorState, setErrorState] = useState({ title: "", message: null });

  const showError = (title, message) => {
    setErrorState({ title, message });
  };

  const closeError = () => {
    setErrorState({ title: "", message: null });
  };

  const handleScrape = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/scrape-assignments');
      const result = await response.json();

      if (response.ok) {
        setData(result);
        setSelectedCourses([]); // Reset filters on new sync
      } else {
        showError("Sync Failed", result.error || "Unknown error occurred during sync.");
      }
    } catch (error) {
      console.error("Scrape failed:", error);
      showError("Connection Error", "Could not connect to the scraper backend. Please ensure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const courseList = useMemo(() => {
    const courses = data.assignments.map(a => a.course);
    return [...new Set(courses)];
  }, [data.assignments]);

  // Handle multi-select toggle
  const toggleCourseFilter = (course) => {
    setSelectedCourses(prev => {
      if (prev.includes(course)) {
        return prev.filter(c => c !== course);
      } else {
        return [...prev, course];
      }
    });
  };

  const clearFilters = () => {
    setSelectedCourses([]);
    setShowUrgentOnly(false);
  };

  const filteredAssignments = useMemo(() => {
    // Defensive check: ensure data.assignments is an array
    if (!data || !Array.isArray(data.assignments)) {
      return [];
    }

    let result = data.assignments;

    // Filter by Course (Multi-select)
    if (selectedCourses.length > 0) {
      result = result.filter(a => a && a.course && selectedCourses.includes(a.course));
    }

    // Filter by Urgency
    if (showUrgentOnly) {
      result = result.filter(a => {
        try {
          if (!a || !a.due) return false;
          const days = getDaysRemaining(a.due);
          return days !== null && days <= 3 && days >= 0;
        } catch (error) {
          console.warn("Error filtering assignment:", a, error);
          return false;
        }
      });
    }

    return result;
  }, [selectedCourses, showUrgentOnly, data.assignments]);



  const handleRemoveAssignment = (indexToRemove) => {
    setData(prev => ({
      ...prev,
      assignments: prev.assignments.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // --- Export Helpers ---

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCSV = () => {
    const headers = ["Title", "Course", "Due Date", "Days Remaining"];
    const rows = filteredAssignments.map(a => [
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.course.replace(/"/g, '""')}"`,
      `"${a.due}"`,
      getDaysRemaining(a.due)
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadFile(csvContent, "assignments.csv", "text/csv;charset=utf-8;");
  };

  const downloadNotionCSV = () => {
    // Notion auto-detects 'Name', 'Date', 'Tags'
    const headers = ["Name", "Due Date", "Course", "Status"];
    const rows = filteredAssignments.map(a => [
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.due}"`, // Notion relies on standard date strings, might need YYYY-MM-DD if strict
      `"${a.course.replace(/"/g, '""')}"`,
      "To Do"
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadFile(csvContent, "notion_import.csv", "text/csv;charset=utf-8;");
  };

  const downloadICS = () => {
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === 'No Due Date') return null;
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 8); // YYYYMMDD
      } catch (e) { return null; }
    };

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Notify//Assignments//EN\n";

    filteredAssignments.forEach(a => {
      const dtStart = formatDate(a.due);
      if (dtStart) {
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${a.title}\n`;
        icsContent += `DTSTART;VALUE=DATE:${dtStart}\n`;
        icsContent += `DESCRIPTION:Course: ${a.course}\n`;
        icsContent += "STATUS:CONFIRMED\n";
        icsContent += "END:VEVENT\n";
      }
    });

    icsContent += "END:VCALENDAR";
    downloadFile(icsContent, "assignments.ics", "text/calendar;charset=utf-8;");
  };
  // ----------------------

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/logout', { method: 'POST' });
      setData({ user: null, assignments: [] });
    } catch (err) {
      console.error("Logout failed:", err);
      showError("Logout Error", "Failed to clear session data.");
    }
  };

  const renderAssignmentCard = (item, index) => {
    const originalIndex = data.assignments.indexOf(item);
    const daysLeft = getDaysRemaining(item.due);
    return (
      <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-blue-400 transition-all group relative pr-12 mb-3 last:mb-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              {item.course}
            </span>
            {daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && (
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-red-100 text-red-600 rounded-full animate-pulse">
                Urgent
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{item.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Due</p>
          <p className={`text-xs font-bold ${item.due === 'No Due Date' ? 'text-gray-300' : 'text-gray-700'}`}>
            {item.due}
          </p>
          {daysLeft !== null && (
            <p className={`text-[10px] font-medium ${daysLeft < 0 ? 'text-gray-400' : daysLeft <= 2 ? 'text-red-500' : 'text-green-600'}`}>
              {daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
            </p>
          )}
        </div>

        <button
          onClick={() => handleRemoveAssignment(originalIndex)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
          title="Remove assignment"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Modal
        title={errorState.title}
        message={errorState.message}
        onClose={closeError}
      />

      <nav className="bg-white border-b border-gray-200 py-3 mb-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-blue-600">NOT!FY</h1>
          </div>

          {data.user && (
            <div className="relative group">
              <button
                className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="text-right hidden sm:block pl-2">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Connected</p>
                  <p className="text-xs font-bold text-gray-800 capitalize">{data.user.name.toLowerCase()}</p>
                </div>
                <img
                  src={data.user.avatar}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-gray-100 object-cover bg-gray-50"
                  onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${data.user.name}&background=DBEAFE&color=2563EB`}
                />
              </button>

              <div className="absolute right-0 pt-2 w-48 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-1 overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-9 space-y-6">
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold">Assignments</h2>
                <p className="text-xs text-gray-500">Syncing for {data.user ? data.user.name : '...'}</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto items-center">
                {/* Advanced Filtering & View Controls */}
                {data.assignments.length > 0 && (
                  <>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'timeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                          }`}
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => setViewMode('course')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'course' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                          }`}
                      >
                        By Course
                      </button>
                    </div>

                    <div className="relative group">
                      <button
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${selectedCourses.length > 0 || showUrgentOnly
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </button>

                      <div className="absolute right-0 pt-2 w-64 z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-gray-800">Filters</h3>
                            {(selectedCourses.length > 0 || showUrgentOnly) && (
                              <button onClick={clearFilters} className="text-xs text-red-500 font-medium hover:underline cursor-pointer">Clear All</button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg -mx-1.5 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={showUrgentOnly}
                                  onChange={(e) => setShowUrgentOnly(e.target.checked)}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-medium text-gray-700">Show Urgent Only (≤ 3 Days)</span>
                              </label>
                            </div>

                            <div className="border-t border-gray-100 pt-3">
                              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Courses</p>
                              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                {courseList.map(course => (
                                  <label key={course} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg -mx-1.5 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={selectedCourses.includes(course)}
                                      onChange={() => toggleCourseFilter(course)}
                                      className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-700 truncate">{course}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleScrape}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-lg font-bold text-sm text-white transition-all flex items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 cursor-pointer'
                    }`}
                >
                  {isLoading && (
                    <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Syncing...' : 'Sync'}
                </button>
              </div>
            </section>

            <section className="space-y-4">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredAssignments.length > 0 ? (
                viewMode === 'timeline' ? (
                  // TIMELINE VIEW (Flat list)
                  filteredAssignments.map((item, index) => renderAssignmentCard(item, index))
                ) : (
                  // GROUPED BY COURSE VIEW
                  courseList
                    .filter(course => selectedCourses.length === 0 || selectedCourses.includes(course))
                    .map(course => {
                      const courseAssignments = filteredAssignments.filter(a => a.course === course);
                      if (courseAssignments.length === 0) return null;

                      return (
                        <div key={course} className="space-y-2">
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1 border-l-4 border-blue-400 ml-1 mb-2">
                            {course} <span className="text-gray-300 ml-1">({courseAssignments.length})</span>
                          </h3>
                          {courseAssignments.map((item, index) => renderAssignmentCard(item, index))}
                        </div>
                      );
                    })
                )
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                  <div className="mb-2 opacity-20">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <p className="text-sm italic font-medium">
                    {data.user ? "No assignments match your filters." : "Sync to start."}
                  </p>
                  {(selectedCourses.length > 0 || showUrgentOnly) && (
                    <button onClick={clearFilters} className="mt-2 text-blue-600 font-bold text-xs hover:underline cursor-pointer">Clear Filters</button>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="mb-2 px-1">
              <h1 className="text-4xl font-black tracking-tighter text-blue-600">NOT!FY</h1>
            </div>

            <section className="bg-blue-600 p-5 rounded-2xl text-white shadow-lg relative">
              <div className="mb-4">
                <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Export Options</h2>
                <p className="text-blue-100 text-xs mt-1 leading-relaxed opacity-90">
                  Sync with your favorite tools.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={downloadICS}
                  disabled={filteredAssignments.length === 0 || isLoading}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all text-left px-4 flex items-center justify-between bg-blue-700 text-blue-100 border border-transparent hover:bg-white hover:text-blue-600 cursor-pointer ${filteredAssignments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>Calendar / To Do</span>
                  <span className="text-[10px] opacity-70">.ics</span>
                </button>
                <button
                  onClick={downloadNotionCSV}
                  disabled={filteredAssignments.length === 0 || isLoading}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all text-left px-4 flex items-center justify-between bg-blue-700 text-blue-100 border border-transparent hover:bg-white hover:text-blue-600 cursor-pointer ${filteredAssignments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>Notion</span>
                  <span className="text-[10px] opacity-70">.csv</span>
                </button>
                <button
                  onClick={downloadCSV}
                  disabled={filteredAssignments.length === 0 || isLoading}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all text-left px-4 flex items-center justify-between bg-blue-700 text-blue-100 border border-transparent hover:bg-white hover:text-blue-600 cursor-pointer ${filteredAssignments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>Excel / Sheets</span>
                  <span className="text-[10px] opacity-70">.csv</span>
                </button>
              </div>
            </section>

            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure & Private
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                All assignments are processed locally on your device. We do not have login access to your accounts and your password is never saved.
              </p>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;