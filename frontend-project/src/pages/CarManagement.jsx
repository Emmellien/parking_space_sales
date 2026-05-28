import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../api/API";
import { Search, ChevronLeft, ChevronRight, Car, UserPlus, AlertCircle } from "lucide-react";

function CarManagement() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [cars, setCars] = useState([]);
    const [formData, setFormData] = useState({ plate_number: "", driver_name: "", phone_number: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [validationErrors, setValidationErrors] = useState({}); // Tracking inline UI alerts

    // Search and Pagination states
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6;

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await API.get("/cars");
            setCars(res.data);
        } catch (err) {
            console.error("Error retrieving vehicle database registry:", err);
        }
    };

    // Client-side execution validator logic
    const validateForm = () => {
        const errors = {};
        
        // 1. Rwandan Plate format verification (Accepts 2-3 Letters, space, 3 digits, space, 1 letter)
        const plateRegex = /^[A-Z]{2,3}\s?\d{3}\s?[A-Z]$/i;
        if (!plateRegex.test(formData.plate_number.trim())) {
            errors.plate_number = "Invalid format. Use regular patterns like 'RAD 123A' or 'GR 250C'.";
        }

        // 2. Name field string length restriction
        if (formData.driver_name.trim().length < 3) {
            errors.driver_name = "Driver identifier name must contain at least 3 characters.";
        }

        // 3. Rwandan Telco network matching code rules (078/079/072/073 followed by 7 digits)
        const phoneRegex = /^(078|079|072|073)\d{7}$/;
        if (!phoneRegex.test(formData.phone_number.trim())) {
            errors.phone_number = "Must be a valid 10-digit number starting with 078, 079, 072, or 073.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0; // Returns true if clean
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        
        // Prevent transaction execution if verification conditions fail
        if (!validateForm()) return;

        try {
            // Normalize formatting properties for backend storage consistency
            const structuredPayload = {
                plate_number: formData.plate_number.trim().toUpperCase(),
                driver_name: formData.driver_name.trim(),
                phone_number: formData.phone_number.trim()
            };

            const res = await API.post("/cars", structuredPayload);
            setMessage({ type: "success", text: res.data.message || "Profile stored successfully!" });
            setFormData({ plate_number: "", driver_name: "", phone_number: "" });
            setValidationErrors({});
            fetchCars();
        } catch (err) {
            setMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Failed to process vehicle profile." 
            });
        }
    };

    // Client-side search optimization
    const filteredCars = cars.filter(car =>
        car.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.phone_number.includes(searchTerm)
    );

    // Client-side pagination steps
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredCars.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredCars.length / rowsPerPage);

    return (
        <div className="flex bg-slate-100 min-h-screen antialiased">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 min-w-0 md:ml-72 p-4 md:p-6 transition-all duration-300">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                    {/* LEFT PANEL: PROFILE CREATION CARD */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 xl:col-span-1 h-fit">
                        <div className="flex items-center gap-2 mb-2">
                            <UserPlus className="text-blue-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-800">Register Driver/Car</h2>
                        </div>
                        <p className="text-xs text-slate-400 mb-5">Pre-register driver details manually into SmartPart</p>

                        {message.text && (
                            <div className={`p-3 rounded-xl text-xs mb-4 border font-semibold ${
                                message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Plate Number</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. RAD 123A" 
                                    className={`w-full mt-1.5 px-3 py-2 border rounded-xl text-sm outline-none transition-all uppercase font-semibold ${
                                        validationErrors.plate_number ? "border-red-300 bg-red-50/20 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                    }`}
                                    value={formData.plate_number} 
                                    onChange={e => setFormData({ ...formData, plate_number: e.target.value })} 
                                />
                                {validationErrors.plate_number && (
                                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1"><AlertCircle size={12}/> {validationErrors.plate_number}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    className={`w-full mt-1.5 px-3 py-2 border rounded-xl text-sm outline-none transition-all ${
                                        validationErrors.driver_name ? "border-red-300 bg-red-50/20 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                    }`}
                                    value={formData.driver_name} 
                                    onChange={e => setFormData({ ...formData, driver_name: e.target.value })} 
                                />
                                {validationErrors.driver_name && (
                                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1"><AlertCircle size={12}/> {validationErrors.driver_name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 078XXXXXXX" 
                                    className={`w-full mt-1.5 px-3 py-2 border rounded-xl text-sm font-mono outline-none transition-all ${
                                        validationErrors.phone_number ? "border-red-300 bg-red-50/20 focus:ring-2 focus:ring-red-500/10" : "border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                    }`}
                                    value={formData.phone_number} 
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })} 
                                />
                                {validationErrors.phone_number && (
                                    <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1"><AlertCircle size={12}/> {validationErrors.phone_number}</p>
                                )}
                            </div>
                            
                            <button type="submit" className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold transition shadow-md">
                                Save Profile
                            </button>
                        </form>
                    </div>

                    {/* RIGHT PANEL: LIVE SEARCH REGISTRY LIST */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 xl:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">SmartPart Vehicle Directory</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Total registered cars in Rubavu District database</p>
                            </div>

                            <div className="flex items-center bg-slate-100 border border-slate-200/30 px-3 py-2 rounded-xl w-full sm:w-64">
                                <Search size={16} className="text-slate-400 shrink-0" />
                                <input type="text" placeholder="Search plates, drivers..." className="bg-transparent outline-none ml-2 text-xs w-full text-slate-700 font-semibold placeholder-slate-400" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100 text-left">
                                <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3.5">Plate Number</th>
                                        <th className="px-5 py-3.5">Driver Name</th>
                                        <th className="px-5 py-3.5">Phone Number</th>
                                        <th className="px-5 py-3.5 text-center">Lifetime Trips</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 bg-white">
                                    {currentRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">No registered car entries found.</td>
                                        </tr>
                                    ) : (
                                        currentRows.map((car) => (
                                            <tr key={car.plate_number} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="px-5 py-3.5 font-bold text-slate-800 font-mono tracking-wide flex items-center gap-2 uppercase">
                                                    <Car size={14} className="text-slate-400"/> {car.plate_number}
                                                </td>
                                                <td className="px-5 py-3.5 font-semibold text-slate-700">{car.driver_name}</td>
                                                <td className="px-5 py-3.5 font-mono text-slate-500">{car.phone_number}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                                        {car.total_trips || 0} Visits
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION INTERACT PANEL */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-5 pt-2 border-t border-slate-100">
                                <span className="text-xs text-slate-400">
                                    Showing page <span className="font-semibold text-slate-700">{currentPage}</span> of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                                        <ChevronLeft size={16}/>
                                    </button>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                                        <ChevronRight size={16}/>
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

export default CarManagement;