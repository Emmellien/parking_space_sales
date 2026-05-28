import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../api/API";
import { Car, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [slots, setSlots] = useState([]);
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchSlots();

        // Establish an automated 10-second background poll synchronization cycle
        const backgroundInterval = setInterval(() => {
            fetchSlots(true);
        }, 10000);

        return () => clearInterval(backgroundInterval);
    }, []);

    const fetchSlots = async (quietMode = false) => {
        if (!quietMode) setIsRefreshing(true);
        try {
            const res = await API.get("/slots");
            setSlots(res.data);
            
            const total = res.data.length;
            const occupied = res.data.filter(s => s.status === "occupied" || s.is_occupied).length;
            const available = total - occupied;
            setStats({ total, occupied, available });
        } catch (err) {
            console.error("Error fetching slot data", err);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex bg-slate-100 min-h-screen antialiased">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 min-w-0 md:ml-72 p-4 md:p-6 transition-all duration-300">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/* STATS COUNTER GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><Car size={24}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Slots</p>
                            <h3 className="text-xl font-black text-slate-800">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-50 text-red-600"><AlertCircle size={24}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Occupied Slots</p>
                            <h3 className="text-xl font-black text-slate-800">{stats.occupied}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-50 text-green-600"><CheckCircle size={24}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available Slots</p>
                            <h3 className="text-xl font-black text-slate-800">{stats.available}</h3>
                        </div>
                    </div>
                </div>

                {/* REAL-TIME SLOTS VISUALIZER MATRIX */}
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Real-time Parking Bay Map</h2>
                            <p className="text-xs text-slate-400">Visual matrix monitor for Rubavu District smart parking zones</p>
                        </div>
                        <button 
                            onClick={() => fetchSlots()}
                            disabled={isRefreshing}
                            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 border rounded-xl hover:bg-slate-100/80 transition flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                        >
                            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                            Sync
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {slots.map((slot) => {
                            const isOccupied = slot.status === "occupied" || slot.is_occupied;
                            return (
                                <div 
                                    key={slot.slot_number} 
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-between text-center transition-all min-h-[125px] ${
                                        isOccupied 
                                        ? "bg-red-50/60 border-red-200 text-red-700 shadow-inner" 
                                        : "bg-green-50/60 border-green-200 text-green-700"
                                    }`}
                                >
                                    <div className="w-full">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bay</span>
                                        <span className="text-2xl font-black tracking-tight block mt-0.5">#{slot.slot_number}</span>
                                    </div>

                                    {/* DYNAMIC LIVE INFORMATION EXTRACTION BLOCK */}
                                    {isOccupied ? (
                                        <div className="my-2 w-full animate-fade-in">
                                            <div className="bg-white/80 border border-red-200/60 rounded-lg py-1 px-1.5 font-mono font-bold text-[11px] text-slate-800 uppercase tracking-wide truncate shadow-sm">
                                                {slot.plate_number || "PARKED"}
                                            </div>
                                            <div className="text-[9px] font-semibold text-slate-500 mt-1 truncate max-w-[120px] mx-auto">
                                                {slot.driver_name || "Active Session"}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="my-3 text-[11px] font-medium text-green-600/80 tracking-wide uppercase">
                                            Ready
                                        </div>
                                    )}

                                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md shadow-sm border tracking-wider ${
                                        isOccupied ? "bg-red-600 text-white border-red-700" : "bg-white text-green-700 border-green-200"
                                    }`}>
                                        {isOccupied ? "Occupied" : "Open"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default Dashboard;