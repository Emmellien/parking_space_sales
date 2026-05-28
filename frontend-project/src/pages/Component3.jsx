import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Component3() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex bg-slate-100 min-h-screen antialiased">
            {/* Sidebar with state controls */}
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main content wrapper */}
            <div className="flex-1 min-w-0 md:ml-72 p-4 md:p-6 transition-all duration-300">
                {/* Header with trigger callback */}
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-5">
                            Upcoming Appointments
                        </h2>

                        <div className="space-y-4">
                            <div className="border border-slate-200/80 rounded-xl p-4 hover:bg-slate-50/50 transition-colors">
                                <h3 className="font-semibold text-slate-800">
                                    Dr John & Patient Alice
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                                    Monday • 09:00 AM
                                </p>
                            </div>

                            <div className="border border-slate-200/80 rounded-xl p-4 hover:bg-slate-50/50 transition-colors">
                                <h3 className="font-semibold text-slate-800">
                                    Dr Emma & Patient David
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                                    Tuesday • 11:30 AM
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Status */}
                    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/60">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-5">
                            Appointment Status
                        </h2>

                        <div className="space-y-5">
                            {/* Completed */}
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-600 font-medium">
                                    <span>Completed</span>
                                    <span className="text-slate-900">80%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-3 rounded-full w-[80%]" />
                                </div>
                            </div>

                            {/* Pending */}
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-600 font-medium">
                                    <span>Pending</span>
                                    <span className="text-slate-900">15%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                    <div className="bg-yellow-500 h-3 rounded-full w-[15%]" />
                                </div>
                            </div>

                            {/* Cancelled */}
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-slate-600 font-medium">
                                    <span>Cancelled</span>
                                    <span className="text-slate-900">5%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-3 rounded-full w-[5%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Component3;