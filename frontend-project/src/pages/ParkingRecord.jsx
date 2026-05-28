import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../api/API";
import { PlusCircle, Trash2, CheckSquare, Edit3, Printer, X, RefreshCw } from "lucide-react";

function ParkingRecord() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [registeredCars, setRegisteredCars] = useState([]);
    const [activeRecords, setActiveRecords] = useState([]);
    
    // Form and UI control states
    const [formData, setFormData] = useState({ plate_number: '', slot_number: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Invoice Modal State
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    // Mock active logged-in worker session ID (e.g., Cashier/Manager)
    const currentUserId = 1; 

    useEffect(() => {
        refreshDashboard();
    }, []);

    const refreshDashboard = () => {
        fetchAvailableSlots();
        fetchRegisteredCars();
        fetchActiveRecords();
    };

    const fetchAvailableSlots = async () => {
        try {
            const res = await API.get("/slots/available");
            setAvailableSlots(res.data);
        } catch (err) {
            console.error("Error fetching available slots:", err);
        }
    };

    const fetchRegisteredCars = async () => {
        try {
            const res = await API.get("/cars");
            setRegisteredCars(res.data);
        } catch (err) {
            console.error("Error fetching registered cars:", err);
        }
    };

    const fetchActiveRecords = async () => {
        try {
            const res = await API.get("/parking/active");
            setActiveRecords(res.data);
        } catch (err) {
            console.error("Error fetching active parking logs:", err);
        }
    };

    // CREATE or UPDATE handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            if (isEditing) {
                // UPDATE route: updates slot assignments for active vehicle logs
                const res = await API.put(`/parking/update/${editingRecordId}`, { slot_number: formData.slot_number });
                setMessage({ type: 'success', text: res.data.message });
                setIsEditing(false);
                setEditingRecordId(null);
            } else {
                // CREATE route: Check-In an entry
                // Find driver details locally to supply expected route payload parameters
                const chosenCar = registeredCars.find(c => c.plate_number === formData.plate_number);
                const res = await API.post("/parking/entry", {
                    plate_number: formData.plate_number,
                    slot_number: formData.slot_number,
                    driver_name: chosenCar?.driver_name || 'N/A',
                    phone_number: chosenCar?.phone_number || 'N/A'
                });
                setMessage({ type: 'success', text: res.data.message });
            }
            setFormData({ plate_number: '', slot_number: '' });
            refreshDashboard();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Transaction submission failed.' });
        }
    };

    // DELETE handler: Terminate record log without clearing balance
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this active parking record?")) return;
        try {
            const res = await API.delete(`/parking/record/${id}`);
            setMessage({ type: 'success', text: res.data.message });
            refreshDashboard();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to erase log entry.' });
        }
    };

    // CHECKOUT / EXIT handler: Triggers the billing engine 
    const handleCheckout = async (plateNumber) => {
        try {
            const res = await API.post("/parking/exit", {
                plate_number: plateNumber,
                user_id: currentUserId
            });
            setInvoiceData(res.data.bill);
            setShowInvoice(true);
            refreshDashboard();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Checkout compilation error.' });
        }
    };

    const startEdit = (record) => {
        setIsEditing(true);
        setEditingRecordId(record.id);
        setFormData({
            plate_number: record.plate_number,
            slot_number: record.slot_number
        });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingRecordId(null);
        setFormData({ plate_number: '', slot_number: '' });
    };

    return (
        <div className="flex bg-slate-100 min-h-screen antialiased">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 min-w-0 md:ml-72 p-4 md:p-6 transition-all duration-300">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                    
                    {/* LEFT PANEL: PARKING ACTION FORM */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 xl:col-span-1 h-fit">
                        <h2 className="text-lg font-bold text-slate-800 mb-1">
                            {isEditing ? "Modify Slot Assignment" : "Vehicle Intake Check-In"}
                        </h2>
                        <p className="text-xs text-slate-400 mb-5">
                            {isEditing ? "Swap active track locations for this vehicle" : "Initialize a brand new session slot allocation"}
                        </p>

                        {message.text && (
                            <div className={`p-3 rounded-xl text-sm mb-4 border font-medium ${
                                message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Plate Number</label>
                                <select 
                                    required 
                                    disabled={isEditing}
                                    className="w-full mt-1.5 px-3 py-2 border rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold"
                                    onChange={e => setFormData({...formData, plate_number: e.target.value})} 
                                    value={formData.plate_number}
                                >
                                    <option value="">-- Choose Car Registry --</option>
                                    {registeredCars.map(car => (
                                        <option key={car.plate_number} value={car.plate_number}>
                                            {car.plate_number} ({car.driver_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assign Parking Slot</label>
                                <select 
                                    required 
                                    className="w-full mt-1.5 px-3 py-2 border rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                                    onChange={e => setFormData({...formData, slot_number: e.target.value})} 
                                    value={formData.slot_number}
                                >
                                    <option value="">-- Choose Available Slot --</option>
                                    {/* If editing, append current slot option into select window list */}
                                    {isEditing && <option value={formData.slot_number}>Slot #{formData.slot_number} (Current)</option>}
                                    {availableSlots.map(slot => (
                                        <option key={slot.slot_number} value={slot.slot_number}>Slot #{slot.slot_number}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {isEditing && (
                                    <button type="button" onClick={cancelEdit} className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className={`bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-2 ${isEditing ? 'w-1/2' : 'w-full'}`}>
                                    <PlusCircle size={18}/> {isEditing ? "Update Unit" : "Check-In Entry"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT PANEL: LIVE RUNNING ACTIVE MONITORS TABLE */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60 xl:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Active Live Tracking</h2>
                                <p className="text-xs text-slate-400">Vehicles currently parked in our lot zones</p>
                            </div>
                            <button onClick={refreshDashboard} className="p-2 border rounded-xl bg-slate-50 hover:bg-slate-100 transition text-slate-500">
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100 text-left">
                                <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Car Plate</th>
                                        <th className="px-4 py-3">Slot Room</th>
                                        <th className="px-4 py-3">Entry Clock</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 bg-white">
                                    {activeRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">No active vehicles tracked inside the parking array right now.</td>
                                        </tr>
                                    ) : (
                                        activeRecords.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3.5 font-bold text-slate-800">{record.plate_number}</td>
                                                <td className="px-4 py-3.5"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold text-[10px]">Slot {record.slot_number}</span></td>
                                                <td className="px-4 py-3.5 text-slate-500">{new Date(record.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                                <td className="px-4 py-3.5 flex justify-center gap-1.5">
                                                    <button onClick={() => handleCheckout(record.plate_number)} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition" title="Process Checkout Invoice">
                                                        <CheckSquare size={14}/>
                                                    </button>
                                                    <button onClick={() => startEdit(record)} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition" title="Change Slot Room">
                                                        <Edit3 size={14}/>
                                                    </button>
                                                    <button onClick={() => handleDelete(record.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition" title="Erase Record Log">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* INVOICE BILL RECEIPT GENERATOR MODAL */}
            {showInvoice && invoiceData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full border border-slate-100">
                        <div className="flex justify-between items-center pb-3 border-b border-dashed">
                            <div>
                                <h3 className="text-md font-bold text-slate-900">SMARTPART OFFICIAL RECEIPT</h3>
                                <p className="text-[10px] text-slate-400 font-mono">Invoice Ref: #000{invoiceData.record_id || 'PR'}</p>
                            </div>
                            <button onClick={() => setShowInvoice(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-400 hover:text-slate-600">
                                <X size={16}/>
                            </button>
                        </div>

                        {/* Invoice Content Area */}
                        <div id="printable-receipt-area" className="my-5 space-y-3.5 text-xs text-slate-600 font-medium">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Plate Number:</span>
                                <span className="font-bold text-slate-800">{invoiceData.plate_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Driver Full Name:</span>
                                <span className="text-slate-800">{invoiceData.driver_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Assigned Slot Room:</span>
                                <span className="text-slate-800 font-semibold">Slot #{invoiceData.slot_number}</span>
                            </div>
                            <hr className="border-slate-100"/>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Entry Time:</span>
                                <span className="text-slate-700 font-mono">{new Date(invoiceData.entry_time).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Exit Time:</span>
                                <span className="text-slate-700 font-mono">{new Date(invoiceData.exit_time).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Total Duration:</span>
                                <span className="text-slate-800 font-bold">{invoiceData.duration_hours} Hour(s)</span>
                            </div>
                            <hr className="border-slate-100"/>
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Amount Paid</span>
                                <span className="text-lg font-black text-blue-600">{invoiceData.amount_paid} RWF</span>
                            </div>
                            <div className="flex justify-between pt-2 text-[11px]">
                                <span className="text-slate-400">Billed Issued By:</span>
                                <span className="font-bold text-slate-700">{invoiceData.billed_by}</span>
                            </div>
                        </div>

                        {/* Modal Action Controls */}
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => window.print()} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-2">
                                <Printer size={16}/> Print Slip Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ParkingRecord;