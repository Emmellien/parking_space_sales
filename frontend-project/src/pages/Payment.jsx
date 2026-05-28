import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../api/API";
import { 
    LogOut, 
    Receipt, 
    Clock, 
    ShieldAlert, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle2,
    Eye
} from "lucide-react";

function Payment() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeRecords, setActiveRecords] = useState([]);
    const [completedPayments, setCompletedPayments] = useState([]); 
    const [selectedRecordId, setSelectedRecordId] = useState("");
    const [livePreview, setLivePreview] = useState(null);
    const [bill, setBill] = useState(null); // Holds the active receipt/invoice state display
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Search & Pagination States
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    useEffect(() => {
        fetchActiveParkingRecords();
        fetchCompletedPayments();
    }, []);

    const fetchActiveParkingRecords = async () => {
        try {
            const res = await API.get("/parking/active");
            setActiveRecords(res.data);
        } catch (err) {
            console.error("Failed loading active parking records:", err);
        }
    };

    const fetchCompletedPayments = async () => {
        try {
            const todayStr = new Date().toISOString().split("T")[0];
            const res = await API.get(`/reports/daily?date=${todayStr}`);
            setCompletedPayments(res.data);
        } catch (err) {
            console.error("Failed loading completed collections:", err);
        }
    };

    const handleCarSelection = (recordId) => {
        setSelectedRecordId(recordId);
        setBill(null);
        setError("");

        if (!recordId) {
            setLivePreview(null);
            return;
        }

        const record = activeRecords.find(r => r.id === parseInt(recordId));
        if (record) {
            const entryTime = new Date(record.entry_time);
            const now = new Date();
            const diffInMs = Math.abs(now - entryTime);
            const computedHours = Math.ceil(diffInMs / (1000 * 60 * 60)) || 1; 
            const estimatedAmount = computedHours * 500; 

            setLivePreview({
                ...record,
                duration_hours: computedHours,
                estimated_amount: estimatedAmount
            });
        }
    };

    const handleExecutePayment = async () => {
        if (!selectedRecordId) return;
        setError("");
        setBill(null);
        setLoading(true);

        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            const currentUserId = userData?.id || 1; 
            const record = activeRecords.find(r => r.id === parseInt(selectedRecordId));

            const res = await API.post("/parking/exit", { 
                plate_number: record.plate_number, 
                user_id: currentUserId 
            });

            setBill(res.data.bill);
            setLivePreview(null);
            setSelectedRecordId("");
            
            fetchActiveParkingRecords();
            fetchCompletedPayments();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to complete checkout processing.");
        } finally {
            setLoading(false);
        }
    };

    // Action function to dynamically display an old paid record back into the main invoice slip element
    const handleViewPastInvoice = (pastPayment) => {
        setBill({
            plate_number: pastPayment.plate_number,
            driver_name: pastPayment.driver_name,
            slot_number: pastPayment.slot_number,
            entry_time: pastPayment.entry_time,
            exit_time: pastPayment.exit_time || pastPayment.payment_date,
            duration_hours: pastPayment.duration_hours,
            processed_by: pastPayment.billed_by || "System Cashier",
            amount_paid: pastPayment.amount_paid
        });
    };

    const filteredPayments = completedPayments.filter(pay => 
        pay.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.slot_number.toString().includes(searchTerm)
    );

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredPayments.length / recordsPerPage);

    return (
        <div className="flex bg-slate-100 min-h-screen antialiased">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 min-w-0 md:ml-72 p-4 md:p-6 transition-all duration-300">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <div className="max-w-4xl mx-auto mt-4 grid grid-cols-1 gap-6">
                    
                    {/* TOP CONTROL GRID: ENTRY EXIT ACTION DESK + REALTIME INVOICE REPRINT CONTAINER */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* INPUT PANEL SELECTION WORKSPACE */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex flex-col justify-between">
                            <div>
                                <h2 className="text-base font-black text-slate-800 mb-1 uppercase tracking-tight">Process Vehicle Exit</h2>
                                <p className="text-xs text-slate-400 mb-4">Select a vehicle currently occupying a slot to calculate its payment due</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                            Active Parked Vehicles
                                        </label>
                                        <select 
                                            className="w-full px-3 py-2.5 border rounded-xl border-slate-200 text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 font-semibold text-slate-700 transition-all"
                                            value={selectedRecordId}
                                            onChange={e => handleCarSelection(e.target.value)}
                                        >
                                            <option value="">-- Choose Car Plate Room --</option>
                                            {activeRecords.map(rec => (
                                                <option key={rec.id} value={rec.id}>
                                                    {rec.plate_number.toUpperCase()} ➔ Slot #{rec.slot_number} ({rec.driver_name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* LIVE PREVIEW LOGIC INFO PANEL */}
                                    {livePreview && (
                                        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100/70 space-y-2 animate-fade-in">
                                            <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px] uppercase tracking-wider">
                                                <Clock size={13} /> Live Preview Computation
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold text-slate-500">
                                                <div>Entry Clock: <span className="text-slate-700 font-mono">{new Date(livePreview.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                                                <div>Duration: <span className="text-slate-700 font-bold">{livePreview.duration_hours} Hr(s)</span></div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-blue-200/30">
                                                <span className="text-xs font-bold text-slate-500">Amount Accrued:</span>
                                                <span className="text-sm font-black text-blue-700">{livePreview.estimated_amount} RWF</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <button 
                                    onClick={handleExecutePayment} 
                                    disabled={!selectedRecordId || loading}
                                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <LogOut size={14}/> {loading ? "Processing Ledger..." : "Confirm Settlement & Clear"}
                                </button>
                                
                                {error && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 font-medium flex items-center gap-1.5">
                                        <ShieldAlert size={13} /> {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* OFFICIAL INVOICE DISPLAY SLIP (UPDATED RE-PRINT FRAME VIEW) */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 min-h-[220px] flex flex-col justify-center">
                            {bill ? (
                                <div className="bg-white border-2 border-dashed border-slate-200 p-4 rounded-xl relative overflow-hidden bg-gradient-to-b from-white to-slate-50/20">
                                    <div className="text-center mb-3">
                                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <Receipt size={16}/>
                                        </div>
                                        <h3 className="font-black text-xs text-slate-800 tracking-tight uppercase">OFFICIAL PAID INVOICE</h3>
                                        <p className="text-[9px] font-bold text-slate-400">Rubavu Smart Network • Transaction Completed</p>
                                    </div>
                                    <div className="space-y-1.5 text-[11px] text-slate-500 font-semibold">
                                        <div className="flex justify-between"><span>Plate Number:</span><span className="font-bold text-slate-800 uppercase font-mono">{bill.plate_number}</span></div>
                                        <div className="flex justify-between"><span>Driver Identity:</span><span className="text-slate-700 font-bold">{bill.driver_name}</span></div>
                                        <div className="flex justify-between"><span>Assigned Zone Bay:</span><span className="text-blue-600 font-bold">Slot #{bill.slot_number}</span></div>
                                        <div className="flex justify-between"><span>Entry Timestamp:</span><span className="text-slate-600 font-mono">{new Date(bill.entry_time).toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span>Exit Timestamp:</span><span className="text-slate-600 font-mono">{new Date(bill.exit_time).toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span>Duration Charged:</span><span className="font-bold text-slate-800 px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{bill.duration_hours} Hour(s)</span></div>
                                        <div className="flex justify-between"><span>Processed By Cashier:</span><span className="text-slate-700 font-bold">{bill.processed_by}</span></div>
                                        <div className="border-t border-slate-100 my-2"></div>
                                        <div className="flex justify-between items-center bg-slate-900 text-white p-2.5 rounded-lg">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">Total Paid Balance</span>
                                            <span className="text-sm font-black text-green-400">{bill.amount_paid} RWF</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 text-xs font-medium flex flex-col items-center gap-1.5 py-6">
                                    <CheckCircle2 size={22} className="text-slate-300" />
                                    Choose an active vehicle checkout above or click "Bill Details" on any payment record below to view its invoice template.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* HISTORY LEDGER SECTION FRAME */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Today's Paid Invoices</h2>
                                <p className="text-xs text-slate-400">Audit trail of completed collections and processing logs</p>
                            </div>
                            <div className="flex items-center bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-xl w-full sm:w-56">
                                <Search size={13} className="text-slate-400 shrink-0" />
                                <input 
                                    type="text" placeholder="Filter invoices..." 
                                    className="bg-transparent outline-none ml-1.5 text-xs w-full text-slate-700 font-semibold placeholder-slate-400"
                                    value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto w-full">
                            {currentPayments.length === 0 ? (
                                <div className="text-center py-8 text-xs font-semibold text-slate-400">
                                    No processed invoice transactions found matches.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                            <th className="p-3 pl-4">Plate Number</th>
                                            <th className="p-3">Driver Profile</th>
                                            <th className="p-3 text-center">Slot</th>
                                            <th className="p-3">Charged Hours</th>
                                            <th className="p-3 text-right">Amount Paid</th>
                                            <th className="p-3 text-center pr-4">Invoice Record</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                                        {currentPayments.map((pay, i) => (
                                            <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="p-3 pl-4 font-bold text-slate-800 font-mono tracking-wide uppercase">{pay.plate_number}</td>
                                                <td className="p-3">
                                                    <div className="font-semibold text-slate-700">{pay.driver_name}</div>
                                                    <div className="text-[9px] text-slate-400 font-mono">{pay.phone_number}</div>
                                                </td>
                                                <td className="p-3 text-center font-bold text-blue-600">#{pay.slot_number}</td>
                                                <td className="p-3"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[10px]">{pay.duration_hours} hr(s)</span></td>
                                                <td className="p-3 text-right font-black text-green-600">{parseInt(pay.amount_paid).toLocaleString()} RWF</td>
                                                <td className="p-3 text-center pr-4">
                                                    <button
                                                        onClick={() => handleViewPastInvoice(pay)}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all border border-slate-200/40 flex items-center gap-1 mx-auto"
                                                    >
                                                        <Eye size={12}/> Bill Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50/30">
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Page <span className="font-bold text-slate-700">{currentPage}</span> of {totalPages}
                                </span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} 
                                        className="p-1 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} 
                                        className="p-1 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Payment;