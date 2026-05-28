import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../api/API";
import { 
    BarChart3, 
    Download, 
    Printer, 
    Search, 
    Calendar, 
    RefreshCw, 
    ChevronLeft, 
    ChevronRight, 
    TrendingUp, 
    Car, 
    Clock 
} from "lucide-react";

function Report() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    // Pagination State Configuration
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        fetchDailyReport();
    }, [selectedDate]);

    // Fetches closed financial checkout transactions from the server
    const fetchDailyReport = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/reports/daily?date=${selectedDate}`);
            setReportData(res.data);
            setCurrentPage(1); // Reset page selection on fresh query criteria
        } catch (err) {
            console.error("Failed executing database data synchronization:", err);
        } finally {
            setLoading(false);
        }
    };

    // Client-side text filtration matrices combining across multiple string structures
    const filteredRecords = reportData.filter(rec => {
        return (
            rec.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rec.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rec.slot_number.toString().includes(searchTerm) ||
            (rec.billed_by && rec.billed_by.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    // Compute live math aggregates dynamically for our high-level layout statistic blocks
    const totalRevenue = filteredRecords.reduce((sum, item) => sum + parseFloat(item.amount_paid || 0), 0);
    const totalVehiclesCheckedOut = filteredRecords.length;
    const avgDuration = filteredRecords.length 
        ? (filteredRecords.reduce((sum, item) => sum + item.duration_hours, 0) / filteredRecords.length).toFixed(1) 
        : 0;

    // Pagination Split Calculations
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

    // Triggers standard native system document browser printer setup arrays
    const handlePrintRegistry = () => {
        window.print();
    };

    // Formats tracking items cleanly to download structured spreadsheets on client machines
    const handleDownloadCSV = () => {
        if (filteredRecords.length === 0) return alert("No ledger data matrix values available to map.");
        
        const headers = ["Plate Number", "Driver Name", "Phone Contact", "Slot Assignment", "Entry Log Time", "Exit Log Time", "Duration (Hours)", "Fee Charged (RWF)", "Authorized Cashier"];
        const rows = filteredRecords.map(rec => [
            rec.plate_number.toUpperCase(),
            rec.driver_name,
            rec.phone_number,
            `Slot ${rec.slot_number}`,
            new Date(rec.entry_time).toLocaleString(),
            new Date(rec.exit_time).toLocaleString(),
            rec.duration_hours,
            rec.amount_paid,
            rec.billed_by || "System Admin"
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SmartPark_Daily_Revenue_Report_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex bg-slate-100 min-h-screen antialiased print:bg-white">
            {/* Hides platform navigation side rails when document printing engine executes */}
            <div className="print:hidden">
                <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            </div>

            <div className="flex-1 min-w-0 md:ml-72 p-4 md:p-6 transition-all duration-300 print:ml-0 print:p-0">
                <div className="print:hidden">
                    <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                </div>

                {/* HEADER CONTROL TOOLBAR COMPONENT */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pb-5 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2 text-slate-800">
                            <BarChart3 className="text-blue-600 print:hidden" size={22} />
                            <h1 className="text-xl font-black tracking-tight uppercase">Daily Revenue Hub</h1>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Auditing closed parking sessions, accounting data collections, and processing logs</p>
                    </div>

                    {/* INTERACTION ACTION CONTROLS */}
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-sm">
                            <Calendar size={14} className="text-slate-400 mr-2" />
                            <input 
                                type="date" className="text-xs font-bold text-slate-700 outline-none bg-transparent"
                                value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <button onClick={handleDownloadCSV} className="bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                            <Download size={14}/> Export Spreadsheet
                        </button>

                        <button onClick={handlePrintRegistry} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                            <Printer size={14}/> Print Auditing Slip
                        </button>
                    </div>
                </div>

                {/* SYSTEM BROWSER ENGINE PRINTING COVER NOTE */}
                <div className="hidden print:block text-center my-6">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">SMARTPARK REVENUE LEDGER SYSTEM SUMMARY</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Ledger Statement Target Date: {new Date(selectedDate).toDateString()}</p>
                    <div className="border-b-2 border-slate-900 my-4"></div>
                </div>

                {/* OVERVIEW METRIC SUMMARY DISPLAY CONTAINER CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Collected Cash</span>
                            <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalRevenue.toLocaleString()} RWF</h3>
                        </div>
                        <div className="w-9 h-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                            <TrendingUp size={18} />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cleared Out Vehicles</span>
                            <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalVehiclesCheckedOut} Car(s)</h3>
                        </div>
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <Car size={18} />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Stay Window</span>
                            <h3 className="text-xl font-black text-slate-800 mt-0.5">{avgDuration} Hour(s)</h3>
                        </div>
                        <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                            <Clock size={18} />
                        </div>
                    </div>
                </div>

                {/* SEARCH FILTER BAR PANEL SECTION */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 print:hidden">
                        <div className="flex items-center bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl w-full max-w-sm focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                            <Search size={15} className="text-slate-400 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search plate number, driver profile, lane slot, cashier..." 
                                className="bg-transparent outline-none ml-2 text-xs w-full text-slate-700 placeholder-slate-400 font-semibold"
                                value={searchTerm} 
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <button onClick={fetchDailyReport} className="p-2 text-slate-500 hover:text-slate-800 border rounded-xl hover:bg-slate-50 transition shrink-0" title="Synchronize Records">
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {/* RESPONSIVE STRUCTURED DATA GRID VIEW TABLE */}
                    <div className="overflow-x-auto w-full">
                        {loading ? (
                            <div className="text-center py-12 text-xs font-semibold text-slate-400 flex flex-col items-center gap-2">
                                <RefreshCw size={18} className="animate-spin text-blue-500" /> Loading auditing database arrays...
                            </div>
                        ) : currentRecords.length === 0 ? (
                            <div className="text-center py-12 text-xs font-medium text-slate-400">
                                No verified parking payments match your specified processing filters.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="p-3.5 pl-5">Plate Number</th>
                                        <th className="p-3.5">Driver Identity</th>
                                        <th className="p-3.5 text-center">Bay Slot</th>
                                        <th className="p-3.5">Check-In Time</th>
                                        <th className="p-3.5">Check-Out Time</th>
                                        <th className="p-3.5 text-center">Charged Span</th>
                                        <th className="p-3.5 text-right pr-5">Amount Paid</th>
                                        <th className="p-3.5 pl-6 print:hidden">Logged Cashier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                                    {currentRecords.map((rec, index) => (
                                        <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="p-3.5 pl-5 font-bold text-slate-800 font-mono tracking-wide uppercase">{rec.plate_number}</td>
                                            <td className="p-3.5">
                                                <div className="font-semibold text-slate-700">{rec.driver_name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rec.phone_number}</div>
                                            </td>
                                            <td className="p-3.5 text-center font-bold text-blue-600">#{rec.slot_number}</td>
                                            <td className="p-3.5 text-slate-500">{new Date(rec.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                            <td className="p-3.5 text-slate-500">{new Date(rec.exit_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                            <td className="p-3.5 text-center"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">{rec.duration_hours} hr(s)</span></td>
                                            <td className="p-3.5 text-right font-black text-green-600 pr-5">{rec.amount_paid.toLocaleString()} RWF</td>
                                            <td className="p-3.5 pl-6 text-slate-500 italic print:hidden">{rec.billed_by || "System Manager"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* PAGINATION PANEL CONTROLS ELEMENT */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 print:hidden">
                            <span className="text-xs text-slate-400 font-medium">
                                Showing entries <span className="font-bold text-slate-700">{indexOfFirstRecord + 1}</span> to <span className="font-bold text-slate-700">{Math.min(indexOfLastRecord, filteredRecords.length)}</span> of {filteredRecords.length}
                            </span>
                            <div className="flex gap-1.5">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                                    disabled={currentPage === 1} 
                                    className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                                    disabled={currentPage === totalPages} 
                                    className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Report;