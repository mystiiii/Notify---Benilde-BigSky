import { useState } from 'react';

function App() {
  const [ids, setIds] = useState(""); 
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async () => {
    if (!ids) return alert("Please enter at least one Course ID");
    
    setIsLoading(true);
    try {
      // Converting string "123, 456" into array ["123", "456"]
      const courseArray = ids.split(',').map(id => id.trim()).filter(id => id !== "");
      
      const response = await fetch('http://localhost:3000/scrape-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: courseArray })
      });
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">BigSky Assignment Scraper</h1>
          <p className="text-gray-600 mt-2">Enter Course IDs separated by commas to sync your reminders.</p>
        </header>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={ids} 
              onChange={(e) => setIds(e.target.value)} 
              placeholder="e.g. 436482, 438311, 436561" 
            />
            <button 
              onClick={handleScrape}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
              }`}
            >
              {isLoading ? 'Scraping...' : 'Run Scraper'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-lg border-l-4 border-blue-500 shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{item.course}</span>
                  <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 uppercase font-semibold">Due Date</p>
                  <p className={`text-sm ${item.due === 'No Due Date' ? 'text-gray-400' : 'text-red-500 font-medium'}`}>
                    {item.due}
                  </p>
                </div>
              </div>
            ))
          ) : !isLoading && (
            <div className="text-center py-20 text-gray-400 italic">
              No assignments found. Enter IDs and click run.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;