import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Car, 
    ShieldCheck, 
    Zap, 
    MapPin, 
    Mail, 
    Phone, 
    Clock, 
    ArrowRight, 
    AlertCircle, 
    CheckCircle2 
} from "lucide-react";

function Home() {
    const navigate = useNavigate();
    
    // Contact Form States
    const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState({ type: "", text: "" });

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setStatus({ type: "", text: "" });

        // Basic Contact Validation
        if (contactForm.name.trim().length < 3) {
            setStatus({ type: "error", text: "Please enter your full name (min 3 characters)." });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactForm.email.trim())) {
            setStatus({ type: "error", text: "Please enter a valid email address." });
            return;
        }
        if (contactForm.message.trim().length < 10) {
            setStatus({ type: "error", text: "Your message must be at least 10 characters long." });
            return;
        }

        // Simulating success action
        setStatus({ type: "success", text: "Thank you! Your message has been sent to the Rubavu SmartPark team." });
        setContactForm({ name: "", email: "", message: "" });
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-600 antialiased selection:bg-blue-600 selection:text-white">
            
            {/* STICKY LANDING NAVIGATION BAR */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 max-w-7xl mx-auto rounded-b-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-900 p-2 rounded-xl text-white shadow-md">
                        <Car size={20} />
                    </div>
                    <div>
                        <span className="text-xl font-black text-slate-800 tracking-tight block">SmartPark</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block -mt-1">Rubavu District</span>
                    </div>
                </div>
                
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                    <a href="#hero" className="hover:text-slate-900 transition">Home</a>
                    <a href="#about" className="hover:text-slate-900 transition">About Us</a>
                    <a href="#contact" className="hover:text-slate-900 transition">Contact</a>
                </div>

                <button 
                    onClick={() => navigate("/login")}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-md shadow-slate-900/10 flex items-center gap-1.5 group"
                >
                    System Login
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </nav>

            {/* HERO PROMOTION SECTION */}
            <section id="hero" className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 text-left space-y-6">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/50 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        <MapPin size={12} /> Rubavu Smart City Initiative
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                        Automated Space Management <br/>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">For Modern Spaces.</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-400 max-w-xl font-medium leading-relaxed">
                        Welcome to SmartPark (PSSMS)—the official real-time parking space allocation and automated sales tracking infrastructure serving border logistics and public zones in Rubavu.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => navigate("/login")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-blue-600/20 text-center"
                        >
                            Access Dashboard Workspace
                        </button>
                        <a 
                            href="#about"
                            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold px-8 py-3.5 rounded-xl text-sm transition shadow-sm text-center"
                        >
                            Learn More
                        </a>
                    </div>
                </div>

                {/* GRAPHIC STATS DISPLAY CARD */}
                <div className="lg:col-span-5 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Zone Active Registry</h3>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Operational District</span>
                            <span className="text-xs font-bold text-slate-800">Rubavu Sectors</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Network Monitoring</span>
                            <span className="text-xs font-bold text-slate-800">Real-time IoT Sensors</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Core Operations</span>
                            <span className="text-xs font-bold text-blue-600">Pre-Booking & Sales</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT US SECTION */}
            <section id="about" className="bg-white border-y border-slate-200/60 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">About Our Architecture</h2>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">Optimizing Congestion, Streamlining Revenue</p>
                        <p className="text-sm text-slate-400 font-medium">
                            SmartPark helps city administrators, cashiers, and safety officials manage parking, track lifetime trips, and generate instant revenue analytics.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/40 space-y-4 text-left">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                <Zap size={22} />
                            </div>
                            <h3 className="text-base font-black text-slate-800">Instant Matrix Mapping</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Avoid visual guesswork. Cashiers view real-time maps showing open slots versus occupied parking spaces immediately.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/40 space-y-4 text-left">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                <ShieldCheck size={22} />
                            </div>
                            <h3 className="text-base font-black text-slate-800">Regulated Verification</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Form validation protects the database entry flow, handling Rwandan license plates and national telco numbers seamlessly.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/40 space-y-4 text-left">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                                <Clock size={22} />
                            </div>
                            <h3 className="text-base font-black text-slate-800">Automated Financial Syncing</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Background polling fetches updates every 10 seconds to keep your logs and payment ledgers matching actual activity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT US SECTION */}
            <section id="contact" className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: OFFICE CONTACT DATA */}
                    <div className="lg:col-span-5 text-left space-y-6 lg:pr-6">
                        <div className="space-y-2">
                            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Connect With Us</h2>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">Need Assistance?</p>
                            <p className="text-sm text-slate-400 font-medium">
                                Reach out directly to the Rubavu Central Station Support Desks regarding access permits, account creation, or technical issues.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 shrink-0"><MapPin size={18}/></div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Location Headquarters</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Rubavu District Office, Western Province, Rwanda</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 shrink-0"><Mail size={18}/></div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Inquiry</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">support@rubavu.smartpark.gov.rw</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 shrink-0"><Phone size={18}/></div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Direct Hotline</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">+250 788 XX XX XX</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: VALIDATED INPUT FORM BLOCK */}
                    <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm text-left">
                        <h3 className="text-lg font-black text-slate-800 mb-1">Send a Message</h3>
                        <p className="text-xs text-slate-400 mb-6">Fill out the quick support ticket manually below</p>

                        {status.text && (
                            <div className={`p-3 rounded-xl text-xs mb-5 border font-semibold flex items-center gap-2 ${
                                status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                                {status.type === "success" ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                                {status.text}
                            </div>
                        )}

                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                                <input 
                                    type="text"
                                    placeholder="Enter full name"
                                    className="w-full mt-1.5 px-3 py-2.5 border rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={contactForm.name}
                                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                <input 
                                    type="text"
                                    placeholder="name@domain.com"
                                    className="w-full mt-1.5 px-3 py-2.5 border rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={contactForm.email}
                                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Message Description</label>
                                <textarea 
                                    rows="4"
                                    placeholder="Explain your technical issue or requirement..."
                                    className="w-full mt-1.5 px-3 py-2.5 border rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                    value={contactForm.message}
                                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-bold transition shadow-md"
                            >
                                Dispatch Support Request
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            {/* LANDING FOOTER MARKER */}
            <footer className="border-t border-slate-200/60 max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400 font-semibold">
                &copy; {new Date().getFullYear()} SmartPark PSSMS. All Rights Reserved. Rubavu District Local Authority.
            </footer>
        </div>
    );
}

export default Home;