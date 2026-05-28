import { Bell, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

function Header({ onMenuToggle }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const location = useLocation();

    // Map your active application path directories to clean header layouts
    const titles = {
        "/dashboard": "Dashboard",
        "/ParkingSlot": "Parking Slots Directory",
        "/Car": "Vehicle Management Profiles",
        "/ParkingRecord": "Live Parking Log Records",
        "/Payment": "Transactions & Payments",
        "/report": "Analytical Reports"
    };

    const pageTitle = titles[location.pathname] || "SmartPark Console";

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 px-4 py-4 md:px-6 md:py-5 mb-6">
            <div className="flex items-center justify-between gap-4">
                
                {/* LEFT INFO: TITLE & MOBILE TRIGGER TOGGLE */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onMenuToggle}
                        className="md:hidden p-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition shrink-0"
                    >
                        <Menu size={22} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{pageTitle}</h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5 hidden sm:block">{currentDate}</p>
                    </div>
                </div>

                {/* RIGHT ACTIONS: NOTIFICATIONS BUTTON & USER PROFILE BADGES */}
                <div className="flex items-center gap-3 shrink-0">
                    
                    {/* NOTIFICATIONS TRIGGER */}
                    <button className="relative bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 transition text-slate-600 shrink-0">
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    {/* MOBILE ACCOUNT WELCOME INDICATOR */}
                    <div className="md:hidden text-right">
                        <p className="text-xs text-slate-400 font-medium">Hi,</p>
                        <p className="text-xs font-bold text-slate-700 leading-tight">{user?.name?.split(' ')[0] || "Admin"}</p>
                    </div>

                    {/* DESKTOP FULL PROFILE PLACARD */}
                    <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/40 pl-2 pr-3 py-1.5 rounded-xl shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="text-left">
                            <h3 className="text-xs font-bold text-slate-800 leading-tight">{user?.name || "User"}</h3>
                            <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">Admin</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Header;