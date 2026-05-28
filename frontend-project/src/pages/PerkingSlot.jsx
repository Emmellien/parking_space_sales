import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../api/API";
import { Layers, CheckCircle, AlertCircle, Trash2, PlusCircle, ToggleLeft, Grid, Search } from "lucide-react";

function ParkingSlot() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [slots, setSlots] = useState([]);
    const [seedCount, setSeedCount] = useState("");
    const [singleSlot, setSingleSlot] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); 
    const [message, setMessage] = useState({ type: "", text: "" });

    // Local Search & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const slotsPerPage = 12;

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await API.get("/slots");
            setSlots(res.data);
        } catch (err) {
            console.error("Error loading slot structure:", err);
        }
    };

    // CREATE Single Slot
    const handleCreateSingleSlot = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        try {
            const res = await API.post("/slots", { slot_number: parseInt(singleSlot) });
            setMessage({ type: "success", text: res.data.message });
            setSingleSlot("");
            fetchSlots();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to add slot." });
        }
    };

    // BULK SEED Slots
    const handleSeedSlots = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        try {
            const res = await API.post("/slots/seed", { totalSlots: parseInt(seedCount) });
            setMessage({ type: "success", text: res.data.message });
            setSeedCount("");
            fetchSlots();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to build slot layouts." });
        }
    };

    // UPDATE Status (Toggle manually between available / occupied)
    const handleToggleStatus = async (slot_number, currentStatus) => {
        const target_status = currentStatus === "available" ? "occupied" : "available";
        try {
            const res = await API.put("/slots/toggle-status", { slot_number, target_status });
            setMessage({ type: "success", text: res.data.message });
            fetchSlots();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to modify slot status safely." });
        }
    };

    // DELETE Slot
    const handleDeleteSlot = async (slot_number) => {
        if (!window.confirm(`Are you sure you want to completely remove Slot #${slot_number}?`)) return;
        setMessage({ type: "", text: "" });
        try {
            const res = await API.delete(`/slots/${slot_number}`);
            setMessage({ type: "success", text: res.data.message });
            fetchSlots();
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to remove slot room." });
        }
    };

    const filteredSlots = slots.filter(slot => {
        const matchesStatus = filterStatus === "all" || slot.status === filterStatus;
        const matchesSearch = slot.slot_number.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const indexOfLastSlot = currentPage * slotsPerPage;
    const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
    const currentSlots = filteredSlots.slice(indexOfFirstSlot, indexOfLastSlot);
    const totalPages = Math.ceil(filteredSlots.length / slotsPerPage);

    return (
        <div className="flex bg-slate-100 min-h-screen antialiased">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 min-w-0 md:ml-72 p-4 md:p-6 transition-all duration-300">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
                    
                    {/* LEFT PANEL: CRUD FORMS AND CONTROLS */}
                    <div className="space-y-6 xl:col-span-1">
                        
                        {/* FORM A: ADD SINGLE SLOT */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 h-fit">
                            <div className="flex items-center gap-2 mb-2">
                                <PlusCircle className="text-blue-600" size={20} />
                                <h2 className="text-md font-bold text-slate-800">Add Single Slot</h2>
                            </div>
                            <form onSubmit={handleCreateSingleSlot} className="space-y-3">
                                <input 
                                    type="number" required min="1" placeholder="Slot Number (e.g. 101)" 
                                    className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-slate-50/50 text-sm outline-none transition-all" 
                                    value={singleSlot} onChange={e => setSingleSlot(e.target.value)} 
                                />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-semibold transition">
                                    Create Slot Space
                                </button>
                            </form>
                        </div>

                        {/* FORM B: MASS INITIALIZE CONTROLS */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 h-fit">
                            <div className="flex items-center gap-2 mb-2">
                                <Layers className="text-slate-700" size={20} />
                                <h2 className="text-md font-bold text-slate-800">Bulk Seed Setup</h2>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-4">Auto-generate numerical spaces sequence up to your limit target.</p>
                            
                            {message.text && (
                                <div className={`p-2.5 rounded-xl text-xs mb-3 border font-medium ${
                                    message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSeedSlots} className="space-y-3">
                                <input 
                                    type="number" required min="1" max="200" placeholder="Total Sequence Size (e.g. 30)" 
                                    className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-slate-50/50 text-sm outline-none transition-all font-semibold" 
                                    value={seedCount} onChange={e => setSeedCount(e.target.value)} 
                                />
                                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold transition">
                                    Initialize Mass Array
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT PANEL: RESPONSIVE BAY INTERFACES MAP GRID */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 xl:col-span-3">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Parking Bays Map Matrix</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Manage spaces layout variables across your network lot</p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <div className="flex items-center bg-slate-100 border border-slate-200/30 px-2.5 py-1.5 rounded-xl w-32 sm:w-40">
                                    <Search size={14} className="text-slate-400 shrink-0" />
                                    <input 
                                        type="text" placeholder="Search slot..." 
                                        className="bg-transparent outline-none ml-1.5 text-xs w-full text-slate-700 placeholder-slate-400 font-medium"
                                        value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>

                                <select 
                                    className="text-xs font-semibold px-3 py-2 border rounded-xl border-slate-200 bg-slate-50 text-slate-700 outline-none transition-all"
                                    value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="all">All States</option>
                                    <option value="available">🟢 Available</option>
                                    <option value="occupied">🔴 Occupied</option>
                                </select>
                            </div>
                        </div>

                        {currentSlots.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed rounded-xl font-medium">
                                No matching configured parking slots found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentSlots.map((slot) => (
                                    <div 
                                        key={slot.slot_number}
                                        className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all duration-200 ${
                                            slot.status === "occupied"
                                                ? "bg-red-50/40 border-red-100/70 text-red-700"
                                                : "bg-green-50/40 border-green-100/70 text-green-700"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Unit Slot</span>
                                                <h4 className="text-2xl font-black tracking-tight text-slate-800">#{slot.slot_number}</h4>
                                            </div>
                                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-white border shadow-sm flex items-center gap-1`}>
                                                {slot.status === "occupied" ? (
                                                    <><AlertCircle size={10} className="text-red-500" /> Occupied</>
                                                ) : (
                                                    <><CheckCircle size={10} className="text-green-500" /> Free</>
                                                )}
                                            </span>
                                        </div>

                                        {/* CRUD OPERATIONS FOOTER ACTION FOR INDIVIDUAL SLOTS */}
                                        <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center gap-2">
                                            <button 
                                                onClick={() => handleToggleStatus(slot.slot_number, slot.status)}
                                                className="text-[11px] font-bold flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border shadow-sm transition"
                                                title="Toggle Status Manually"
                                            >
                                                <ToggleLeft size={13}/> Toggle Status
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteSlot(slot.slot_number)}
                                                className="text-red-600 hover:text-red-700 p-1 bg-white hover:bg-red-50 rounded-lg border shadow-sm transition"
                                                title="Delete Slot Unit"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                <span className="text-xs text-slate-400">
                                    Displaying matrix cluster page <span className="font-semibold text-slate-700">{currentPage}</span> of {totalPages}
                                </span>
                                <div className="flex gap-1.5">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} 
                                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    >
                                        Prev
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} 
                                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    >
                                        Next
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

export default ParkingSlot;