import {
    LayoutDashboard,
    SquareParking,
    Car,
    ClipboardList,
    CreditCard,
    BarChart3,
    LogOut,
    X
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar({ open, setOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard size={20} />
        },
         {
            name: "Parking Slot",
            path: "/ParkingSlot",
            icon: <SquareParking size={20} />
        },
        {
            name: "Car",
            path: "/Car",
            icon: <Car size={20} />
        },
        {
            name: "Parking Records",
            path: "/ParkingRecord",
            icon: <ClipboardList size={20} />
        },
        {
            name: "Payment",
            path: "/Payment",
            icon: <CreditCard size={20} />
        },
        {
            name: "Reports",
            path: "/report",
            icon: <BarChart3 size={20} />
        }
    ];

    return (
        <>
            {/* OVERLAY FOR MOBILE CLOSING */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setOpen(false)}
                ></div>
            )}

            {/* SIDEBAR PANEL */}
            <div className={`
                fixed top-0 left-0 z-50
                h-screen w-72
                bg-slate-900 text-white
                p-6 flex flex-col justify-between
                transform transition-transform duration-300 ease-in-out
                shadow-2xl
                ${open ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0
            `}>
                <div>
                    {/* BRANDING HEADER */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">SmartPark</h1>
                            <p className="text-slate-400 text-xs mt-0.5">PSSMS Management System</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="md:hidden hover:bg-slate-800 p-2 rounded-lg transition text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* USER DETAILS INFO */}
                    <div className="bg-slate-800 rounded-2xl p-4 mb-8 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-bold text-sm truncate">{user?.name || "User Name"}</h2>
                                <p className="text-slate-400 text-xs truncate">Administrator</p>
                            </div>
                        </div>
                    </div>

                    {/* NAVIGATION MENU ITEMS */}
                    <nav className="space-y-1.5">
                        <ul className="space-y-1">
                            {menuItems.map((item, index) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <li key={index}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setOpen(false)}
                                            className={`
                                                flex items-center gap-3.5
                                                px-4 py-3 rounded-xl
                                                transition-all duration-150
                                                text-sm font-semibold
                                                ${isActive 
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                                                    : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                                                }
                                            `}
                                        >
                                            <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}>
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>

                {/* LOGOUT BUTTON FOOTER */}
                <div>
                    <button
                        onClick={logout}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 hover:scale-[1.01]"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;