import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
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

export default function Dashboard({ stats = {} }) {
    const { auth } = usePage().props;
    const roles = auth.user?.roles || [];

    const isAdmin = roles.includes("Admin");
    const isManager = roles.includes("Manager");
    const isReceptionist = roles.includes("Receptionist");

    const canViewFinance = isAdmin;
    const canViewAdminStats = isAdmin || isManager;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 },
        },
    };

    const renderCustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm font-arabic"
                    dir="rtl"
                >
                    <p className="text-gray-500 mb-1">{label}</p>
                    <p className="font-bold text-primary">
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
            header={
                <h2 className="text-2xl font-bold leading-tight text-primary font-arabic">
                    لوحة القيادة
                </h2>
            }
        >
            <Head title="لوحة القيادة | آيس بادل" />

            <div className="py-8 font-arabic">
                <motion.div
                    className="mx-auto max-w-7xl sm:px-6 lg:px-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Section */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d6e02e]/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                أهلاً بك، {auth.user.name} 👋
                            </h3>
                            <p className="text-gray-500 text-sm">
                                مرحباً بك في مركز عمليات آيس بادل. إليك نظرة
                                شاملة على الأداء والمؤشرات.
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                <Icon
                                    icon="mdi:calendar-today"
                                    className="text-gray-400"
                                />
                                <span className="text-sm font-bold text-primary">
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

                    {/* Top Row: Highlights & Leaderboards (New graphic shape) */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                    >
                        {/* 1. Primary Stat (Revenue / Balance) */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-1 bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-900/20 group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d6e02e]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-[#d6e02e]/20 transition-all duration-700"></div>
                            <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                <Icon
                                    icon={
                                        canViewFinance
                                            ? "mdi:cash-multiple"
                                            : "mdi:wallet"
                                    }
                                    className="w-64 h-64 text-[#d6e02e]"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none"></div>

                            <div className="relative z-20 flex flex-col h-full justify-between gap-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-400 font-medium mb-2 text-lg">
                                            {canViewFinance
                                                ? "أرباح اليوم"
                                                : "الرصيد الحالي"}
                                        </p>
                                        <h3 className="text-5xl font-black text-white flex items-baseline gap-2">
                                            <span
                                                dir="ltr"
                                                className="font-sans"
                                            >
                                                {canViewFinance
                                                    ? (
                                                          stats
                                                              .revenue_data?.[6]
                                                              ?.amount || 0
                                                      ).toLocaleString("en-US")
                                                    : (
                                                          stats.wallet_balance ||
                                                          0
                                                      ).toLocaleString("en-US")}
                                            </span>
                                            <span className="text-xl text-[#d6e02e]">
                                                ل.س
                                            </span>
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                                    <Icon
                                        icon={
                                            canViewFinance
                                                ? "mdi:trending-up"
                                                : "mdi:shield-check"
                                        }
                                        className="text-[#d6e02e] w-5 h-5"
                                    />
                                    <span className="font-medium">
                                        {canViewFinance
                                            ? "أداء ممتاز واستمرارية في النمو"
                                            : "الرصيد آمن ومتاح للاستخدام"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Top Performers (Graphic Card) */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-white/10 transition-all duration-700"></div>
                            <div className="absolute -bottom-10 -left-10 opacity-10 pointer-events-none group-hover:-rotate-12 transition-transform duration-700">
                                <Icon
                                    icon="mdi:trophy"
                                    className="w-48 h-48 text-amber-400"
                                />
                            </div>

                            <div className="relative z-20 flex flex-col h-full gap-5">
                                <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                                    <Icon
                                        icon="mdi:star-circle"
                                        className="w-6 h-6 text-amber-400"
                                    />
                                    أبطال الأكاديمية
                                </h4>

                                <div className="flex flex-col gap-4">
                                    {/* Top Coach */}
                                    <div className="relative p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md overflow-hidden group/coach hover:bg-white/15 transition-colors">
                                        <div className="absolute left-0 top-0 w-1 h-full bg-amber-400"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-lg shrink-0 relative">
                                                <Icon
                                                    icon="mdi:account-tie"
                                                    className="w-6 h-6"
                                                />
                                                <div
                                                    className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                                                    dir="ltr"
                                                >
                                                    1
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-amber-200/80 mb-0.5">
                                                    أفضل مدرب
                                                </p>
                                                <h5 className="font-bold text-base truncate">
                                                    {stats.top_coaches?.[0]
                                                        ?.name ||
                                                        "كابتن النخبة"}
                                                </h5>
                                            </div>
                                            <div className="text-left shrink-0">
                                                <div
                                                    className="text-amber-400 font-black text-lg"
                                                    dir="ltr"
                                                >
                                                    {stats.top_coaches?.[0]
                                                        ?.sessions || 0}
                                                </div>
                                                <p className="text-[10px] text-white/60">
                                                    جلسة منجزة
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Player */}
                                    <div className="relative p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md overflow-hidden group/player hover:bg-white/15 transition-colors">
                                        <div className="absolute left-0 top-0 w-1 h-full bg-emerald-400"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shrink-0 relative">
                                                <Icon
                                                    icon="mdi:tennis"
                                                    className="w-6 h-6"
                                                />
                                                <div
                                                    className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                                                    dir="ltr"
                                                >
                                                    1
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-emerald-200/80 mb-0.5">
                                                    أفضل لاعب
                                                </p>
                                                <h5 className="font-bold text-base truncate">
                                                    {stats.top_players?.[0]
                                                        ?.name || "لاعب محترف"}
                                                </h5>
                                            </div>
                                            <div className="text-left shrink-0">
                                                <div
                                                    className="text-emerald-400 font-black text-lg"
                                                    dir="ltr"
                                                >
                                                    {stats.top_players?.[0]
                                                        ?.matches || 0}
                                                </div>
                                                <p className="text-[10px] text-white/60">
                                                    مباراة ملعوبة
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Upcoming Events / Activity */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-1 bg-[#d6e02e] rounded-[2rem] p-8 text-gray-900 relative overflow-hidden shadow-xl shadow-[#d6e02e]/20 group"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none"></div>
                            <div className="absolute -bottom-6 -left-6 text-black/5 group-hover:rotate-12 transition-transform duration-700">
                                <Icon
                                    icon="mdi:flag-checkered"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="relative z-20 flex flex-col h-full justify-between gap-6">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center backdrop-blur-sm border border-white/50 shadow-sm mb-4">
                                        <Icon
                                            icon="mdi:calendar-star"
                                            className="w-7 h-7 text-gray-900"
                                        />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                                        فعاليات قادمة
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                        بطولة آيس بادل المفتوحة تبدأ قريباً.
                                        تأكد من جاهزية الملاعب والمدربين لتلبية
                                        الطلب العالي للبطولة.
                                    </p>
                                </div>
                                <div className="mt-auto">
                                    <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                                     الفعاليات
                                        <Icon
                                            icon="mdi:arrow-left"
                                            className="w-4 h-4"
                                        />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Second Row: System Overview Grid */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon
                                    icon="mdi:account-group"
                                    className="w-6 h-6"
                                />
                            </div>
                            <p className="text-gray-500 font-bold mb-1 text-sm">
                                إجمالي اللاعبين
                            </p>
                            <p className="text-3xl font-black text-gray-900">
                                <span dir="ltr" className="font-sans">
                                    {(stats.total_players || 0).toLocaleString(
                                        "en-US",
                                    )}
                                </span>
                            </p>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm hover:border-rose-200 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon
                                    icon="mdi:account-tie"
                                    className="w-6 h-6"
                                />
                            </div>
                            <p className="text-gray-500 font-bold mb-1 text-sm">
                                المدربين الفعالين
                            </p>
                            <p className="text-3xl font-black text-gray-900">
                                <span dir="ltr" className="font-sans">
                                    {(stats.total_coaches || 0).toLocaleString(
                                        "en-US",
                                    )}
                                </span>
                            </p>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon
                                    icon="mdi:calendar-check"
                                    className="w-6 h-6"
                                />
                            </div>
                            <p className="text-gray-500 font-bold mb-1 text-sm">
                                إجمالي الحجوزات
                            </p>
                            <p className="text-3xl font-black text-gray-900">
                                <span dir="ltr" className="font-sans">
                                    {(stats.total_bookings || 0).toLocaleString(
                                        "en-US",
                                    )}
                                </span>
                            </p>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon icon="mdi:stadium" className="w-6 h-6" />
                            </div>
                            <p className="text-gray-500 font-bold mb-1 text-sm">
                                الملاعب المتاحة
                            </p>
                            <p className="text-3xl font-black text-gray-900">
                                <span dir="ltr" className="font-sans">
                                    {(stats.active_courts || 0).toLocaleString(
                                        "en-US",
                                    )}
                                </span>
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Charts & Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart Area */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                                    <Icon
                                        icon="mdi:chart-areaspline"
                                        className="w-6 h-6 text-[#d6e02e]"
                                    />
                                    {canViewFinance
                                        ? "إيرادات آخر 7 أيام"
                                        : "معدل حجوزاتك (آخر 7 أيام)"}
                                </h4>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {canViewFinance ? (
                                        <AreaChart
                                            data={stats.revenue_data}
                                            margin={{
                                                top: 10,
                                                right: 0,
                                                left: 0,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="colorRevenue"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#d6e02e"
                                                        stopOpacity={0.4}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#d6e02e"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f3f4f6"
                                            />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: "#9ca3af",
                                                }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: "#9ca3af",
                                                }}
                                                tickFormatter={(value) =>
                                                    `${value / 1000}k`
                                                }
                                                dx={-10}
                                            />
                                            <Tooltip
                                                content={renderCustomTooltip}
                                            />
                                            <Area
                                                type="monotone"
                                                name="الأرباح"
                                                dataKey="amount"
                                                stroke="#9bc72b"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                            />
                                        </AreaChart>
                                    ) : (
                                        <BarChart
                                            data={stats.bookings_data}
                                            margin={{
                                                top: 10,
                                                right: 0,
                                                left: 0,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f3f4f6"
                                            />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: "#9ca3af",
                                                }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: "#9ca3af",
                                                }}
                                                allowDecimals={false}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                content={renderCustomTooltip}
                                                cursor={{ fill: "#f3f4f6" }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                name="الحجوزات"
                                                fill="#111111"
                                                radius={[6, 6, 0, 0]}
                                                barSize={30}
                                            />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Recent Activity Sidebar */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                                    <Icon
                                        icon="mdi:history"
                                        className="w-6 h-6 text-gray-400"
                                    />
                                    أحدث النشاطات
                                </h4>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                {stats.recent_activity &&
                                stats.recent_activity.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recent_activity.map(
                                            (activity, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: 0.3 + idx * 0.1,
                                                    }}
                                                    className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                                >
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            activity.status ===
                                                            "approved"
                                                                ? "bg-emerald-100 text-emerald-600"
                                                                : activity.status ===
                                                                    "pending"
                                                                  ? "bg-amber-100 text-amber-600"
                                                                  : activity.status ===
                                                                      "cancelled"
                                                                    ? "bg-rose-100 text-rose-600"
                                                                    : "bg-gray-200 text-gray-600"
                                                        }`}
                                                    >
                                                        <Icon
                                                            icon={
                                                                activity.status ===
                                                                "approved"
                                                                    ? "mdi:calendar-check"
                                                                    : activity.status ===
                                                                        "pending"
                                                                      ? "mdi:calendar-clock"
                                                                      : activity.status ===
                                                                          "cancelled"
                                                                        ? "mdi:calendar-remove"
                                                                        : "mdi:calendar"
                                                            }
                                                            className="w-5 h-5"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {activity.time}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                                                                activity.status ===
                                                                "approved"
                                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                                    : activity.status ===
                                                                        "pending"
                                                                      ? "bg-amber-50 text-amber-600 border-amber-100"
                                                                      : activity.status ===
                                                                          "cancelled"
                                                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                                                        : "bg-gray-50 text-gray-500 border-gray-200"
                                                            }`}
                                                        >
                                                            {activity.status ===
                                                            "approved"
                                                                ? "مؤكد"
                                                                : activity.status ===
                                                                    "pending"
                                                                  ? "قيد الانتظار"
                                                                  : activity.status ===
                                                                      "cancelled"
                                                                    ? "ملغي"
                                                                    : activity.status ===
                                                                        "completed"
                                                                      ? "مكتمل"
                                                                      : activity.status ===
                                                                          "rejected"
                                                                        ? "مرفوض"
                                                                        : activity.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                                        <Icon
                                            icon="mdi:history"
                                            className="w-16 h-16 text-gray-300 mb-3"
                                        />
                                        <p className="text-sm font-bold text-gray-400">
                                            لا يوجد نشاطات حديثة
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <a
                                    href={route(
                                        canViewFinance
                                            ? "admin.bookings"
                                            : "booking.index",
                                    )}
                                    className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-primary font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    عرض كل الحجوزات
                                    <Icon
                                        icon="mdi:arrow-left"
                                        className="w-4 h-4"
                                    />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
