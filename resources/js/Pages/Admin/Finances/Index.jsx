import React, { useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 font-arabic text-right" dir="rtl">
                <p className="font-bold text-gray-900 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-600">{entry.name}:</span>
                        <span className="font-bold font-sans text-gray-900">
                            {Number(entry.value).toLocaleString('en-US')} ل.س
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminFinancesIndex({ transactions, stats, chart_data, filters }) {
    const handleFilterChange = (e) => {
        router.get(route('admin.finances.index'), {
            ...filters,
            [e.target.name]: e.target.value
        }, { preserveState: true, preserveScroll: true });
    };

    // Prepare chart data (reverse to show chronological order)
    const reversedChartData = useMemo(() => {
        if (!chart_data) return [];
        return [...chart_data].reverse();
    }, [chart_data]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <AdminLayout header="المالية والحسابات">
            <Head title="الإدارة المالية" />

            <div className="max-w-7xl mx-auto space-y-8 font-arabic pb-12">
                
                {/* Stats Header */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">أرباح الحجوزات</p>
                                <p className="text-3xl font-black text-gray-900 font-sans tracking-tight">
                                    {Number(stats.total_bookings_revenue).toLocaleString('en-US')} <span className="text-sm font-arabic font-bold text-gray-400">ل.س</span>
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Icon icon="mdi:calendar-check" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">إجمالي الإيداعات</p>
                                <p className="text-3xl font-black text-gray-900 font-sans tracking-tight">
                                    {Number(stats.total_deposits).toLocaleString('en-US')} <span className="text-sm font-arabic font-bold text-gray-400">ل.س</span>
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Icon icon="mdi:arrow-down-bold-circle-outline" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">إجمالي الخصومات</p>
                                <p className="text-3xl font-black text-gray-900 font-sans tracking-tight">
                                    {Number(stats.total_deductions).toLocaleString('en-US')} <span className="text-sm font-arabic font-bold text-gray-400">ل.س</span>
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <Icon icon="mdi:arrow-up-bold-circle-outline" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">أرصدة المحافظ</p>
                                <p className="text-3xl font-black text-gray-900 font-sans tracking-tight">
                                    {Number(stats.total_wallets_balance).toLocaleString('en-US')} <span className="text-sm font-arabic font-bold text-gray-400">ل.س</span>
                                </p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <Icon icon="mdi:wallet" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Chart Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">الأداء المالي (آخر 30 يوماً)</h2>
                            <p className="text-sm text-gray-500 mt-1">مقارنة بين إيرادات الحجوزات وإيداعات المحافظ اليومية</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icon icon="mdi:chart-bell-curve-cumulative" className="w-6 h-6" />
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reversedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                                    dx={-10}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    name="أرباح الحجوزات" 
                                    stroke="#10b981" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="deposits" 
                                    name="إيداعات المحافظ" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorDeposits)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Filters and Transactions List */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    
                    {/* Header and Filters */}
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                <Icon icon="mdi:swap-horizontal-bold" className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">سجل حركات المحافظ</h2>
                                <p className="text-sm text-gray-500 mt-1">عرض ومتابعة كافة عمليات الشحن والخصم بالتفصيل</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative group">
                                <Icon icon="mdi:magnify" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search || ''}
                                    onChange={handleFilterChange}
                                    placeholder="بحث باسم اللاعب أو الوصف..."
                                    className="w-full sm:w-72 pl-4 pr-12 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
                                />
                            </div>
                            
                            <select
                                name="type"
                                value={filters.type || 'all'}
                                onChange={handleFilterChange}
                                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-bold text-gray-700 bg-white transition-all appearance-none cursor-pointer pr-10 relative"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9l6 6l6-6'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'left 12px center',
                                    backgroundSize: '20px'
                                }}
                            >
                                <option value="all">كل الحركات</option>
                                <option value="deposit">الإيداعات فقط</option>
                                <option value="deduction">الخصومات فقط</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-right whitespace-nowrap">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">التاريخ</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">اللاعب</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">النوع</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">المبلغ</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">الوصف</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">بواسطة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.data.map((transaction, index) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        key={transaction.id} 
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-colors">
                                                    <Icon icon="mdi:calendar-clock" className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <span className="text-gray-900 font-bold text-sm font-sans">
                                                    {dayjs(transaction.created_at).locale('en').format('YYYY-MM-DD')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm shadow-inner">
                                                    {transaction.wallet?.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{transaction.wallet?.user?.name || 'غير معروف'}</p>
                                                    <p className="text-xs text-gray-500 font-sans mt-0.5">{transaction.wallet?.user?.phone || 'لا يوجد رقم'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {transaction.type === 'deposit' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100/50 shadow-sm">
                                                    <Icon icon="mdi:arrow-bottom-left" className="w-3.5 h-3.5" />
                                                    إيداع
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-100/50 shadow-sm">
                                                    <Icon icon="mdi:arrow-top-right" className="w-3.5 h-3.5" />
                                                    خصم
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-base font-black font-sans px-3 py-1.5 rounded-lg ${
                                                transaction.type === 'deposit' 
                                                ? 'text-emerald-600 bg-emerald-50/50' 
                                                : 'text-red-600 bg-red-50/50'
                                            }`}>
                                                {transaction.type === 'deposit' ? '+' : '-'}{Number(transaction.amount).toLocaleString('en-US')} <span className="text-xs font-arabic font-bold opacity-70">ل.س</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm text-gray-600 max-w-[250px] truncate bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100/50" title={transaction.description}>
                                                {transaction.description || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:account-tie" className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm font-bold text-gray-600">
                                                    {transaction.creator?.name || 'النظام'}
                                                </p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}

                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                                    <Icon icon="mdi:file-document-outline" className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="font-bold text-lg text-gray-500">لا توجد حركات مالية</p>
                                                <p className="text-sm mt-1">لم يتم العثور على أي حركات مطابقة للبحث أو الفلتر المختار.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                {transactions.links.map((link, i) => {
                                    // Clean up pagination labels
                                    let label = link.label;
                                    if (label.includes('&laquo;')) label = <Icon icon="mdi:chevron-right" className="w-5 h-5" />;
                                    if (label.includes('&raquo;')) label = <Icon icon="mdi:chevron-left" className="w-5 h-5" />;

                                    return (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-sans transition-all duration-200 ${
                                                link.active
                                                    ? 'bg-primary text-gray-900 font-black shadow-lg shadow-[#cbfb45]/30 border border-[#cbfb45]'
                                                    : link.url
                                                    ? 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-bold hover:border-primary/50'
                                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                                            }`}
                                        >
                                            {typeof label === 'string' ? <span dangerouslySetInnerHTML={{ __html: label }} /> : label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>
        </AdminLayout>
    );
}
