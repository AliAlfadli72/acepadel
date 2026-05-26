import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

// Real-Time Countdown Timer Component for Next Padel Tournament (Light Theme)
function CountdownTimer() {
    const getNextFriday = () => {
        const now = new Date();
        const nextFriday = new Date();
        // Day 5 is Friday
        nextFriday.setDate(now.getDate() + ((5 + 7 - now.getDay()) % 7 || 7));
        nextFriday.setHours(18, 0, 0, 0);
        if (nextFriday < now) {
            nextFriday.setDate(nextFriday.getDate() + 7);
        }
        return nextFriday;
    };

    const [targetDate] = useState(getNextFriday());
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const difference = targetDate - now;
            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex gap-1.5 justify-center font-mono font-black" dir="ltr">
            <div className="flex flex-col items-center bg-slate-50 border border-slate-200/60 rounded-xl px-2 py-1 min-w-[42px] shadow-sm">
                <span className="text-slate-800 text-xs leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[7px] text-slate-400 mt-0.5 uppercase tracking-wider">Days</span>
            </div>
            <span className="text-slate-400 text-xs self-center font-bold">:</span>
            <div className="flex flex-col items-center bg-slate-50 border border-slate-200/60 rounded-xl px-2 py-1 min-w-[42px] shadow-sm">
                <span className="text-slate-800 text-xs leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[7px] text-slate-400 mt-0.5 uppercase tracking-wider">Hrs</span>
            </div>
            <span className="text-slate-400 text-xs self-center font-bold">:</span>
            <div className="flex flex-col items-center bg-slate-50 border border-slate-200/60 rounded-xl px-2 py-1 min-w-[42px] shadow-sm">
                <span className="text-slate-800 text-xs leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[7px] text-slate-400 mt-0.5 uppercase tracking-wider">Min</span>
            </div>
            <span className="text-slate-400 text-xs self-center font-bold">:</span>
            <div className="flex flex-col items-center bg-slate-50 border border-slate-200/60 rounded-xl px-2 py-1 min-w-[42px] shadow-sm">
                <span className="text-[#84CC16] text-xs leading-none animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[7px] text-slate-400 mt-0.5 uppercase tracking-wider">Sec</span>
            </div>
        </div>
    );
}

// Custom Dynamic SVG Sparkline Graph
function Sparkline({ data = [] }) {
    if (data.length === 0) return null;
    
    const width = 300;
    const height = 50;
    const padding = 4;
    
    const amounts = data.map(d => d.amount || 0);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const range = max - min === 0 ? 1 : max - min;
    
    const points = data.map((d, index) => {
        const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
        const amount = d.amount || 0;
        const y = height - ((amount - min) / range) * (height - 2 * padding) - padding;
        return { x, y };
    });
    
    const pathD = points.reduce((acc, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");
    
    const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    
    return (
        <div className="w-full relative mt-4 h-[50px] overflow-hidden">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                <defs>
                    <linearGradient id="sparklineGradLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#84CC16" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#84CC16" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <path d={fillD} fill="url(#sparklineGradLight)" />
                <path d={pathD} fill="none" stroke="#84CC16" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {points.length > 0 && (
                    <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3.5} fill="#84CC16" className="animate-ping" />
                )}
                {points.length > 0 && (
                    <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2} fill="#84CC16" />
                )}
            </svg>
        </div>
    );
}

// Mini Sparkline Graph for Lower Cards
function MiniSparkline({ trend = 'up' }) {
    const path = trend === 'up' 
        ? "M 5 25 L 15 20 L 25 22 L 35 15 L 45 18 L 55 5" 
        : "M 5 5 L 15 12 L 25 10 L 35 18 L 45 15 L 55 25";
    return (
        <svg width="60" height="30" viewBox="0 0 60 30" className="opacity-80">
            <path d={path} fill="none" stroke="#84CC16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Dashboard({ stats = {} }) {
    const { auth } = usePage().props;
    const roles = auth.user?.roles || [];

    const isAdmin = roles.includes("Admin");
    const isManager = roles.includes("Manager");

    const canViewFinance = isAdmin;
    const isArabic = true;

    // Staggered Container Animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    // Card/Cell entrance transition
    const cellVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 },
        },
    };

    // Recharts custom tooltips
    const renderCustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 text-xs font-arabic" dir="rtl">
                    <p className="text-slate-500 mb-1 font-semibold">{label}</p>
                    <p className="font-bold text-[#0F172A]">
                        {payload[0].value.toLocaleString("en-US")}{" "}
                        {payload[0].name === "الأرباح" ? "ل.س" : "حجز"}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout
            dark={false}
            header={
                <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A] font-arabic">
                    لوحة القيادة
                </h2>
            }
        >
            <Head title="لوحة القيادة | آيس بادل" />

            <div className="py-6 font-arabic text-slate-800 bg-[#F8FAFC] min-h-screen">
                <motion.div
                    className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Welcome Header Card */}
                    <motion.div
                        variants={cellVariants}
                        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#84CC16]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-[#0F172A] mb-1.5">
                                أهلاً بك، {auth.user.name} 👋
                            </h3>
                            <p className="text-[#64748B] text-xs font-medium">
                                مرحباً بك في مركز عمليات آيس بادل. إليك نظرة شاملة على الأداء والمؤشرات.
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2">
                                <Icon icon="mdi:calendar-today" className="text-[#84CC16]" />
                                <span className="text-xs font-bold text-slate-700">
                                    {new Date().toLocaleDateString(
                                        "ar-EG-u-nu-latn",
                                        {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        },
                                    )}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bento Grid Row 1 (Asymmetric 60/40 Split: lg:grid-cols-5) */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                        
                        {/* Financial Analytics Cell (60% Width / lg:col-span-3) */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="lg:col-span-3 bg-white border border-slate-200/60 rounded-[2rem] p-6 text-slate-800 relative overflow-hidden flex flex-col justify-between h-[360px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#84CC16]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                {/* Earnings summary heading */}
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-1">
                                            {canViewFinance ? "أرباح اليوم" : "الرصيد الحالي"}
                                        </p>
                                        <div className="flex items-baseline gap-1.5">
                                            <h3 className="text-3xl font-black text-[#0F172A] tracking-tight leading-none">
                                                <span dir="ltr" className="font-sans">
                                                    {canViewFinance
                                                        ? (stats.revenue_data?.[6]?.amount || 0).toLocaleString("en-US")
                                                        : (stats.wallet_balance || 0).toLocaleString("en-US")}
                                                </span>
                                            </h3>
                                            <span className="text-xs text-[#84CC16] font-black uppercase">ل.س</span>
                                            {canViewFinance && (
                                                <span className="text-[10px] bg-[#84CC16]/10 text-[#84CC16] px-2 py-0.5 rounded-full font-bold ml-2 flex items-center gap-0.5">
                                                    <Icon icon="solar:arrow-right-up-linear" className="w-3 h-3" />
                                                    12%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400">
                                        <Icon icon={canViewFinance ? "solar:hand-stars-bold-duotone" : "solar:wallet-2-bold-duotone"} className="w-6 h-6 text-[#84CC16]" />
                                    </div>
                                </div>

                                {/* Main Area / Bar Chart */}
                                <div className="h-56 w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {canViewFinance ? (
                                            <AreaChart
                                                data={stats.revenue_data}
                                                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorRevenueLight" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#84CC16" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#84CC16" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: "#64748B", fontWeight: "bold" }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: "#64748B", fontWeight: "bold" }}
                                                    tickFormatter={(value) => `${value / 1000}k`}
                                                    dx={-10}
                                                />
                                                <Tooltip content={renderCustomTooltip} />
                                                <Area
                                                    type="monotone"
                                                    name="الأرباح"
                                                    dataKey="amount"
                                                    stroke="#84CC16"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorRevenueLight)"
                                                    animationDuration={800}
                                                    animationEasing="ease-out"
                                                />
                                            </AreaChart>
                                        ) : (
                                            <BarChart
                                                data={stats.bookings_data}
                                                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: "#64748B", fontWeight: "bold" }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: "#64748B", fontWeight: "bold" }}
                                                    allowDecimals={false}
                                                    dx={-10}
                                                />
                                                <Tooltip content={renderCustomTooltip} cursor={{ fill: "rgba(15,23,42,0.01)" }} />
                                                <Bar
                                                    dataKey="count"
                                                    name="الحجوزات"
                                                    fill="#84CC16"
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={20}
                                                    animationDuration={800}
                                                    animationEasing="ease-out"
                                                />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>

                        {/* Court Occupancy Graphic Cell (40% Width / lg:col-span-2) */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="lg:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-6 text-slate-800 relative overflow-hidden flex flex-col justify-between h-[360px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300"
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-[#0F172A] font-extrabold text-sm flex items-center gap-1.5">
                                            <Icon icon="solar:chart-2-bold-duotone" className="w-5 h-5 text-[#84CC16]" />
                                            إشغال الملاعب
                                        </h4>
                                        <span className="text-[10px] bg-slate-50 border border-slate-200/60 text-[#64748B] px-2 py-0.5 rounded-full font-bold">
                                            معدل اليوم: 68%
                                        </span>
                                    </div>
                                    <p className="text-[#64748B] text-[10px] font-bold tracking-widest uppercase mb-4">
                                        COURT UTILIZATION STATISTICS
                                    </p>

                                    {/* Court progress meters */}
                                    <div className="space-y-4 my-2">
                                        {[
                                            { name: 'الملعب الأول (أزرق)', percentage: 85, bookings: '12 حجز' },
                                            { name: 'الملعب الثاني (أحمر)', percentage: 60, bookings: '8 حجوزات' },
                                            { name: 'الملعب الثالث (عشب)', percentage: 40, bookings: '5 حجوزات' },
                                            { name: 'الملعب الرابع (داخلي)', percentage: 90, bookings: '14 حجز' },
                                        ].map((court, idx) => (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-800">{court.name}</span>
                                                    <span className="text-[#84CC16] font-mono">{court.percentage}% ({court.bookings})</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${court.percentage}%` }}
                                                        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: idx * 0.08 }}
                                                        className="h-full bg-[#84CC16] rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bento Grid Row 2 (3 Columns: lg:grid-cols-3) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        
                        {/* Academy Champions Cell */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="bg-white border border-slate-200/60 rounded-[2rem] p-6 text-slate-800 relative overflow-hidden flex flex-col justify-between h-[250px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300"
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <h4 className="text-xs font-black text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-2">
                                    <Icon icon="solar:cup-first-bold-duotone" className="w-4.5 h-4.5 text-[#84CC16]" />
                                    {isArabic ? "أبطال الأكاديمية" : "ACADEMY CHAMPIONS"}
                                </h4>

                                <div className="grid grid-cols-2 gap-4 flex-1 items-center">
                                    {/* Column 1: Top Coach */}
                                    <div className="flex items-center gap-3 border-l border-slate-100 pr-1">
                                        <div className="relative w-11 h-11 shrink-0">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative">
                                                <Icon icon="solar:user-linear" className="w-6 h-6 text-slate-500" />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-tr from-[#84CC16] to-lime-300 text-slate-900 text-[8px] font-black rounded-full flex items-center justify-center shadow-md">1</div>
                                            </div>
                                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-bold truncate">أفضل مدرب</p>
                                            <h5 className="font-extrabold text-xs text-slate-800 truncate mt-0.5">
                                                {stats.top_coaches?.[0]?.name || "كابتن النخبة"}
                                            </h5>
                                            <p className="text-[9px] text-[#84CC16] font-bold mt-0.5">
                                                {stats.top_coaches?.[0]?.sessions || 0} جلسة
                                            </p>
                                        </div>
                                    </div>

                                    {/* Column 2: Top Player */}
                                    <div className="flex items-center gap-3 pl-1">
                                        <div className="relative w-11 h-11 shrink-0">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative">
                                                <Icon icon="solar:user-linear" className="w-6 h-6 text-slate-500" />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-tr from-[#84CC16] to-lime-300 text-slate-900 text-[8px] font-black rounded-full flex items-center justify-center shadow-md">1</div>
                                            </div>
                                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-bold truncate">أفضل لاعب</p>
                                            <h5 className="font-extrabold text-xs text-slate-800 truncate mt-0.5">
                                                {stats.top_players?.[0]?.name || "لاعب محترف"}
                                            </h5>
                                            <p className="text-[9px] text-[#84CC16] font-bold mt-0.5">
                                                {stats.top_players?.[0]?.matches || 0} مباراة
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Upcoming Events Cell */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="bg-white border border-slate-200/60 rounded-[2rem] p-6 text-slate-800 relative overflow-hidden flex flex-col justify-between h-[250px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300"
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-black text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                                            <Icon icon="solar:stopwatch-bold-duotone" className="w-4.5 h-4.5 text-[#84CC16]" />
                                            فعاليات قادمة
                                        </h4>
                                        <span className="text-[9px] font-bold bg-[#84CC16]/10 text-[#84CC16] border border-[#84CC16]/20 px-2 py-0.5 rounded-full">
                                            قريباً
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                        بطولة آيس بادل المفتوحة تبدأ قريباً. تأكد من جاهزية الملاعب والمدربين لتلبية الطلب العالي للبطولة.
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <CountdownTimer />
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Activity Cell */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="bg-white border border-slate-200/60 rounded-[2rem] p-6 text-slate-800 relative overflow-hidden flex flex-col justify-between h-[250px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300"
                        >
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 shrink-0">
                                    <h4 className="text-xs font-black text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                                        <Icon icon="solar:history-bold-duotone" className="w-4.5 h-4.5 text-[#64748B]" />
                                        أحدث النشاطات
                                    </h4>
                                    <a href={route(canViewFinance ? "admin.bookings" : "booking.index")} className="text-[9px] font-bold text-[#84CC16] hover:underline">
                                        عرض الكل
                                    </a>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                    {stats.recent_activity && stats.recent_activity.length > 0 ? (
                                        stats.recent_activity.slice(0, 3).map((activity, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                                            >
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                                    activity.status === "approved"
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : activity.status === "pending"
                                                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                          : "bg-rose-50 text-rose-600 border border-rose-100"
                                                }`}>
                                                    <Icon
                                                        icon={
                                                            activity.status === "approved"
                                                                ? "mdi:calendar-check"
                                                                : activity.status === "pending"
                                                                  ? "mdi:calendar-clock"
                                                                  : "mdi:calendar-remove"
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-slate-800 truncate">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-[8px] text-slate-400 font-medium">
                                                        {activity.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                            <p className="text-[10px] font-bold text-slate-400">لا يوجد نشاطات حديثة</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Performance Metrics Row (Lower Section: lg:grid-cols-4) */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        {/* Metric 1: Total Players */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", translateY: -2, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="bg-white border border-slate-200/60 rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 relative group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                        <Icon icon="mdi:account-group-outline" className="w-5.5 h-5.5" />
                                    </div>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" dir="ltr">
                                        +8%
                                        <Icon icon="solar:arrow-right-up-linear" className="w-3 h-3" />
                                    </span>
                                </div>
                                <p className="text-[#64748B] font-extrabold text-[11px] uppercase tracking-wider mb-1">
                                    إجمالي اللاعبين
                                </p>
                                <p className="text-3xl font-black text-slate-900 mt-1">
                                    <span dir="ltr" className="font-sans">
                                        {(stats.total_players || 0).toLocaleString("en-US")}
                                    </span>
                                </p>
                            </div>
                            <div className="flex justify-end mt-4 border-t border-slate-100/60 pt-3">
                                <MiniSparkline trend="up" />
                            </div>
                        </motion.div>

                        {/* Metric 2: Active Coaches */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", translateY: -2, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="bg-white border border-slate-200/60 rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 relative group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/50 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                        <Icon icon="mdi:whistle" className="w-5.5 h-5.5" />
                                    </div>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" dir="ltr">
                                        +4%
                                        <Icon icon="solar:arrow-right-up-linear" className="w-3 h-3" />
                                    </span>
                                </div>
                                <p className="text-[#64748B] font-extrabold text-[11px] uppercase tracking-wider mb-1">
                                    المدربين الفعالين
                                </p>
                                <p className="text-3xl font-black text-slate-900 mt-1">
                                    <span dir="ltr" className="font-sans">
                                        {(stats.total_coaches || 0).toLocaleString("en-US")}
                                    </span>
                                </p>
                            </div>
                            <div className="flex justify-end mt-4 border-t border-slate-100/60 pt-3">
                                <MiniSparkline trend="up" />
                            </div>
                        </motion.div>

                        {/* Metric 3: Total Bookings */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", translateY: -2, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="bg-white border border-slate-200/60 rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 relative group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                        <Icon icon="mdi:calendar-check-outline" className="w-5.5 h-5.5" />
                                    </div>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" dir="ltr">
                                        +15%
                                        <Icon icon="solar:arrow-right-up-linear" className="w-3 h-3" />
                                    </span>
                                </div>
                                <p className="text-[#64748B] font-extrabold text-[11px] uppercase tracking-wider mb-1">
                                    إجمالي الحجوزات
                                </p>
                                <p className="text-3xl font-black text-slate-900 mt-1">
                                    <span dir="ltr" className="font-sans">
                                        {(stats.total_bookings || 0).toLocaleString("en-US")}
                                    </span>
                                </p>
                            </div>
                            <div className="flex justify-end mt-4 border-t border-slate-100/60 pt-3">
                                <MiniSparkline trend="up" />
                            </div>
                        </motion.div>

                        {/* Metric 4: Active Courts */}
                        <motion.div
                            variants={cellVariants}
                            whileHover={{ borderColor: "#CBD5E1", translateY: -2, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}
                            className="bg-white border border-slate-200/60 rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 relative group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                        <Icon icon="mdi:tennis" className="w-5.5 h-5.5" />
                                    </div>
                                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5" dir="ltr">
                                        نشط
                                    </span>
                                </div>
                                <p className="text-[#64748B] font-extrabold text-[11px] uppercase tracking-wider mb-1">
                                    الملاعب المتاحة
                                </p>
                                <p className="text-3xl font-black text-slate-900 mt-1">
                                    <span dir="ltr" className="font-sans">
                                        {(stats.active_courts || 0).toLocaleString("en-US")}
                                    </span>
                                </p>
                            </div>
                            <div className="flex justify-end mt-4 border-t border-slate-100/60 pt-3">
                                <MiniSparkline trend="up" />
                            </div>
                        </motion.div>

                    </motion.div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
