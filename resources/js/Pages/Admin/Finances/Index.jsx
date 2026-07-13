import React, { useMemo, useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

/*
|--------------------------------------------------------------------------
| Transaction Config
|--------------------------------------------------------------------------
*/

const transactionConfig = {

    deposit: {
        label: 'إيداع',
        bg: 'bg-emerald-50',
        text: 'text-[#10B981]',
        border: 'border-emerald-100/50',
        amount: 'text-[#10B981] bg-emerald-50/50',
        icon: 'mdi:arrow-bottom-left',
        sign: '+',
    },

    booking_payment: {
        label: 'دفع حجز',
        bg: 'bg-rose-50',
        text: 'text-[#EF4444]',
        border: 'border-rose-100/50',
        amount: 'text-[#EF4444] bg-rose-50/50',
        icon: 'mdi:calendar-remove',
        sign: '-',
    },
    event_payment: {
        label: 'رسوم فعالية',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-100/50',
        amount: 'text-orange-600 bg-orange-50/50',
        icon: 'mdi:trophy',
        sign: '-',
    },
    expense: {
        label: 'مصروف',
        bg: 'bg-rose-50',
        text: 'text-[#EF4444]',
        border: 'border-rose-100/50',
        amount: 'text-[#EF4444] bg-rose-50/50',
        icon: 'mdi:cash-minus',
        sign: '-',
    },

    refund: {
        label: 'استرجاع',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-100/50',
        amount: 'text-blue-600 bg-blue-50/50',
        icon: 'mdi:cash-refund',
        sign: '+',
    },

    bonus: {
        label: 'مكافأة',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-100/50',
        amount: 'text-amber-600 bg-amber-50/50',
        icon: 'mdi:gift',
        sign: '+',
    },

    manual_adjustment: {
        label: 'خصم إداري',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-100/50',
        amount: 'text-purple-600 bg-purple-50/50',
        icon: 'mdi:shield-edit',
        sign: '-',
    },
};

/*
|--------------------------------------------------------------------------
| Custom Tooltip
|--------------------------------------------------------------------------
*/

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 font-arabic text-right"
                dir="rtl"
            >
                <p className="font-extrabold text-slate-900 mb-2 text-xs">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 text-[11px] font-semibold mb-1"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-500">
                            {entry.name}:
                        </span>
                        <span className="font-bold font-sans text-slate-800 mr-auto">
                            {Number(entry.value).toLocaleString('en-US')} ل.س
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
export default function AdminFinancesIndex({
    transactions,
    expenses,
    stats,
    chart_data,
    filters
}) {

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */
   const [expenseModalOpen, setExpenseModalOpen] = useState(false);
   const {
    data,
    setData,
    post,
    processing,
    reset,
    errors
} = useForm({

    title: '',
    description: '',
    category: 'miscellaneous',
    type: 'one_time',
    amount: '',
    expense_date: '',
    starts_at: '',
    ends_at: '',
});
const submitExpense = (e) => {

    e.preventDefault();

    post(route('admin.expenses.store'), {

        preserveScroll: true,

        onSuccess: () => {

            reset();

            setExpenseModalOpen(false);
        }
    });
};

    const handleFilterChange = (e) => {

        router.get(route('admin.finances.index'), {

            ...filters,
            [e.target.name]: e.target.value

        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Chart Data
    |--------------------------------------------------------------------------
    */

    const formattedChartData = useMemo(() => {

        if (!chart_data) return [];

        if (filters.month === 'all') {
            return chart_data;
        }

        return [...chart_data].reverse();

    }, [chart_data, filters.month]);

    /*
    |--------------------------------------------------------------------------
    | Animations
    |--------------------------------------------------------------------------
    */

    const containerVariants = {
        hidden: { opacity: 0 },

        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {

        hidden: {
            opacity: 0,
            y: 20
        },

        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24
            }
        }
    };
    /*
    |--------------------------------------------------------------------------
    | Month & Year Filters
    |--------------------------------------------------------------------------
    */

    const months = [
        { value: 'all', label: 'طوال السنة' },

        { value: 1, label: 'يناير' },
        { value: 2, label: 'فبراير' },
        { value: 3, label: 'مارس' },
        { value: 4, label: 'أبريل' },
        { value: 5, label: 'مايو' },
        { value: 6, label: 'يونيو' },
        { value: 7, label: 'يوليو' },
        { value: 8, label: 'أغسطس' },
        { value: 9, label: 'سبتمبر' },
        { value: 10, label: 'أكتوبر' },
        { value: 11, label: 'نوفمبر' },
        { value: 12, label: 'ديسمبر' },
    ];

    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;

    const years = [];

    for (let year = currentYear; year >= 2024; year--) {
        years.push(year);
    }

    return (
        <AdminLayout header="المالية والحسابات">

            <Head title="الإدارة المالية" />

            <div className="max-w-7xl mx-auto space-y-8 font-arabic pb-12">

                {/* Stats */}

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="bg-white border border-slate-200/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100 w-full overflow-hidden"
                >
                    {/* Segment 1: Booking Revenue */}
                    <div className="p-6 flex-1 flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                أرباح الحجوزات
                            </p>
                            <p className="text-xl font-bold text-[#0F172A] font-sans">
                                {Number(stats.total_bookings_revenue || 0).toLocaleString('en-US')}
                                <span className="text-xs mr-1 text-[#64748B] font-medium">ل.س</span>
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center">
                            <Icon icon="mdi:calendar-check" className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Segment 2: Deposits */}
                    <div className="p-6 flex-1 flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                إجمالي الإيداعات
                            </p>
                            <p className="text-xl font-bold text-[#0F172A] font-sans">
                                {Number(stats.total_deposits || 0).toLocaleString('en-US')}
                                <span className="text-xs mr-1 text-[#64748B] font-medium">ل.س</span>
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center">
                            <Icon icon="mdi:cash-plus" className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Segment 3: Refunds */}
                    <div className="p-6 flex-1 flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                الاسترجاعات
                            </p>
                            <p className="text-xl font-bold text-[#EF4444] font-sans">
                                {Number(stats.total_refunds || 0).toLocaleString('en-US')}
                                <span className="text-xs mr-1 text-[#64748B] font-medium">ل.س</span>
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-rose-50 text-[#EF4444] flex items-center justify-center">
                            <Icon icon="mdi:cash-refund" className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Segment 4: Expenses */}
                    <div className="p-6 flex-1 flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                المصروفات
                            </p>
                            <p className="text-xl font-bold text-[#EF4444] font-sans">
                                {Number(stats.total_expenses || 0).toLocaleString('en-US')}
                                <span className="text-xs mr-1 text-[#64748B] font-medium">ل.س</span>
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-rose-50 text-[#EF4444] flex items-center justify-center">
                            <Icon icon="mdi:cash-minus" className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Segment 5: Net Profit */}
                    <div className="p-6 flex-1 flex items-center justify-between">
                        {(() => {
                            const isNegative = (stats.net_revenue || 0) < 0;
                            return (
                                <>
                                    <div>
                                        <p className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                            صافي الأرباح
                                        </p>
                                        <p className={`text-xl font-bold ${isNegative ? 'text-[#EF4444]' : 'text-[#10B981]'} font-sans`}>
                                            {Number(stats.net_revenue || 0).toLocaleString('en-US')}
                                            <span className="text-xs mr-1 text-[#64748B] font-medium">ل.س</span>
                                        </p>
                                    </div>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isNegative ? 'bg-rose-50 text-[#EF4444]' : 'bg-emerald-50 text-[#10B981]'}`}>
                                        <Icon icon="mdi:finance" className="w-5 h-5" />
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Segment 6: Wallets */}
                    <div className="p-6 flex-1 flex items-center justify-between">
                        <div>
                            <p className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                أرصدة المحافظ
                            </p>
                            <p className="text-xl font-bold text-[#0F172A] font-sans">
                                {Number(stats.total_wallets_balance || 0).toLocaleString('en-US')}
                                <span className="text-xs mr-1 text-[#64748B] font-medium">ل.س</span>
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center">
                            <Icon icon="mdi:wallet" className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>

                {/* Chart */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60 p-6 lg:p-8"
                >

                    <div className="flex items-center justify-between mb-8">

                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900">
                                الأداء المالي الشهري
                            </h2>

                            <p className="text-xs text-slate-500 mt-0.5">
                                تحليل الإيرادات والإيداعات والاسترجاعات والمصروفات
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                            <Icon icon="mdi:chart-bell-curve-cumulative" className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="h-[350px] w-full" dir="ltr">

                        <ResponsiveContainer width="100%" height="100%">

                            <AreaChart
                                data={formattedChartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0
                                }}
                            >

                                <defs>

                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>

                                </defs>

                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'bold' }}
                                    tickFormatter={(value) => `${(value / 1000).toLocaleString('en-US')}k`}
                                    dx={-10}
                                />

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#F1F5F9"
                                />

                                <Tooltip content={<CustomTooltip />} />

                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    name="أرباح الحجوزات"
                                    stroke="#10B981"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />

                                <Area
                                    type="monotone"
                                    dataKey="deposits"
                                    name="الإيداعات"
                                    stroke="#3B82F6"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorDeposits)"
                                />

                                <Area
                                    type="monotone"
                                    dataKey="refunds"
                                    name="الاسترجاعات"
                                    stroke="#EF4444"
                                    strokeWidth={2.5}
                                    fillOpacity={0}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    name="المصروفات"
                                    stroke="#EF4444"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorExpenses)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="net"
                                    name="صافي الربح"
                                    stroke="#8B5CF6"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorNet)"
                                />

                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
                {/* Expenses Section */}

<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.45 }}
    className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60 overflow-hidden"
>

    {/* Header */}

    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">

        <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/30 flex items-center justify-center text-[#EF4444]">
                <Icon icon="mdi:cash-minus" className="w-5 h-5" />
            </div>

            <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                    إدارة المصروفات
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                    إدارة جميع مصروفات النادي
                </p>
            </div>
        </div>

        <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
            <Icon icon="mdi:plus" className="w-4 h-4" />
            إضافة مصروف
        </button>
    </div>

    {/* Expenses Table */}

    <div className="overflow-x-auto">

        <table className="w-full text-right whitespace-nowrap">

            <thead className="bg-slate-50/50 border-b border-slate-100/80">

                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">
                        العنوان
                    </th>

                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">
                        النوع
                    </th>

                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">
                        المبلغ
                    </th>

                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">
                        البداية
                    </th>

                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">
                        النهاية
                    </th>

                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">
                        الحالة
                    </th>

                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">
                        الإجراءات
                    </th>
                </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80">

                {expenses.map((expense) => (

                    <tr
                        key={expense.id}
                        className="hover:bg-slate-50/45 transition-colors border-b border-slate-100/50"
                    >

                        {/* Title */}

                        <td className="px-6 py-5">

                            <div>
                                <p className="font-extrabold text-slate-900 text-sm">
                                    {expense.title}
                                </p>

                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    {expense.description || 'لا يوجد وصف'}
                                </p>
                            </div>
                        </td>

                        {/* Type */}

                        <td className="px-6 py-5">

                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/40">

                                {expense.type === 'one_time'
                                    ? 'مرة واحدة'
                                    : expense.type === 'monthly'
                                    ? 'شهري'
                                    : 'سنوي'}
                            </span>
                        </td>

                        {/* Amount */}

                        <td className="px-6 py-5">

                            <span className="font-black text-[#EF4444] font-sans text-sm">
                                -{Number(expense.amount).toLocaleString('en-US')} ل.س
                            </span>
                        </td>

                        {/* Start */}

                        <td className="px-6 py-5 text-xs text-slate-600 font-sans font-medium">
                            {expense.starts_at
                                ? dayjs(expense.starts_at).format('YYYY-MM-DD')
                                : expense.expense_date
                                ? dayjs(expense.expense_date).format('YYYY-MM-DD')
                                : '-'}
                        </td>

                        {/* End */}

                        <td className="px-6 py-5 text-xs text-slate-600 font-sans font-medium">
                            {expense.ends_at
                                ? dayjs(expense.ends_at).format('YYYY-MM-DD')
                                : '-'}
                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${
                                expense.active
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                                    : 'bg-slate-100 text-slate-500 border-slate-200/40'
                            }`}>
                                {expense.active ? 'نشط' : 'منتهي'}
                            </span>
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">

                            <div className="flex items-center gap-2">

                                {expense.active && expense.type !== 'one_time' && (

                                    <button
                                        onClick={() => {
                                            if (confirm('إنهاء هذا المصروف؟')) {

                                                router.post(
                                                    route('admin.expenses.end', expense.id)
                                                );
                                            }
                                        }}
                                        className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50 flex items-center justify-center hover:bg-amber-100 transition"
                                    >
                                        <Icon icon="mdi:stop-circle-outline" className="w-5 h-5" />
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        if (confirm('حذف هذا المصروف؟')) {

                                            router.delete(
                                                route('admin.expenses.delete', expense.id)
                                            );
                                        }
                                    }}
                                    className="w-9 h-9 rounded-xl bg-rose-50 text-[#EF4444] border border-rose-100/50 flex items-center justify-center hover:bg-rose-100 transition"
                                >
                                    <Icon icon="mdi:delete-outline" className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}

            </tbody>
        </table>
    </div>
</motion.div>

                {/* Transactions */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60 overflow-hidden"
                >

                    {/* Header */}

                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-200/50 text-slate-700">
                                <Icon icon="mdi:swap-horizontal-bold" className="w-5 h-5" />
                            </div>

                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">
                                    السجل المالي
                                </h2>

                                <p className="text-xs text-slate-500 mt-0.5">
                                    جميع العمليات المالية داخل النظام
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col lg:flex-row gap-3 w-full sm:w-auto">

                            {/* Search */}

                            <div className="relative group">

                                <Icon
                                    icon="mdi:magnify"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search || ''}
                                    onChange={handleFilterChange}
                                    placeholder="بحث..."
                                    className="w-full sm:w-72 pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-slate-400 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none placeholder-slate-400"
                                />
                            </div>

                            {/* Type Filter */}

                            <select
                                name="type"
                                value={filters.type || 'all'}
                                onChange={handleFilterChange}
                                className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-slate-400 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none cursor-pointer"
                            >
                                <option value="all">كل الحركات</option>
                                <option value="deposit">الإيداعات</option>
                                <option value="booking_payment">دفعات الحجوزات</option>
                                <option value="event_payment">رسوم الفعاليات</option>
                                <option value="expense">المصروفات</option>
                                <option value="refund">الاسترجاعات</option>
                                <option value="bonus">المكافآت</option>
                                <option value="manual_adjustment">الخصومات الإدارية</option>
                            </select>

                            {/* Month Filter */}

                            <select
                                name="month"
                                value={filters.month || 'all'}
                                onChange={handleFilterChange}
                                className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-slate-400 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none cursor-pointer"
                            >
                                {months.map((month) => {

                                const isFuture =
                                    month.value !== 'all' &&
                                    Number(filters.year || currentYear) === currentYear &&
                                    month.value > currentMonth;

                                    return (
                                        <option
                                            key={month.value}
                                            value={month.value}
                                            disabled={isFuture}
                                        >
                                            {month.label}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Year Filter */}

                            <select
                                name="year"
                                value={filters.year || currentYear}
                                onChange={handleFilterChange}
                                className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-slate-400 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none cursor-pointer"
                            >
                                {years.map((year) => (
                                    <option
                                        key={year}
                                        value={year}
                                    >
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* Table */}

                    <div className="overflow-x-auto">

                        <table className="w-full text-right whitespace-nowrap">

                            <thead className="bg-slate-50/50 border-b border-slate-100">

                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">التاريخ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">اللاعب</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">النوع</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">المبلغ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">الوصف</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">بواسطة</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100/80">

                                {transactions.data.map((transaction, index) => {

                                    const config =
                                        transactionConfig[transaction.type]
                                        || transactionConfig.deposit;

                                    return (

                                        <motion.tr
                                            key={transaction.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * index }}
                                            className="hover:bg-slate-50/45 transition-colors border-b border-slate-100/50"
                                        >

                                            {/* Date */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-2">

                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100/60">
                                                        <Icon icon="mdi:calendar-clock" className="w-4 h-4 text-slate-400" />
                                                    </div>

                                                    <span className="text-slate-700 font-bold text-xs font-sans">
                                                        {dayjs(transaction.created_at)
                                                            .locale('en')
                                                            .format('YYYY-MM-DD')}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Player */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-xs border border-slate-200/50">
                                                        {transaction.wallet?.user?.name?.charAt(0) || '?'}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-extrabold text-slate-900">
                                                            {transaction.wallet?.user?.name || 'مصروف إداري'}
                                                        </p>

                                                        <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-medium">
                                                            {transaction.wallet?.user?.phone || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Type */}

                                            <td className="px-6 py-5">

                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${config.bg} ${config.text} ${config.border}`}>
                                                    <Icon icon={config.icon} className="w-3.5 h-3.5" />
                                                    {config.label}
                                                </span>
                                            </td>

                                            {/* Amount */}

                                            <td className="px-6 py-5">

                                                <span className={`text-xs font-black font-sans px-2.5 py-1 rounded-lg border shadow-sm ${config.amount} ${config.border}`}>

                                                    {config.sign}

                                                    {Number(transaction.amount).toLocaleString('en-US')}

                                                    <span className="text-[10px] font-arabic font-bold opacity-70 mr-1">
                                                        ل.س
                                                    </span>
                                                </span>
                                            </td>

                                            {/* Description */}

                                            <td className="px-6 py-5">

                                                <p
                                                    className="text-xs text-slate-600 max-w-[250px] truncate bg-slate-50/60 px-2.5 py-1 rounded-lg border border-slate-100/80 font-medium"
                                                    title={(transaction.description || '')
                                                        .replace('Court booking #', 'حجز ملعب #')
                                                        .replace('Refund for cancelled booking #', 'إرجاع حجز ملغي #')}
                                                >
                                                    {(transaction.description || '-')
                                                        .replace('Court booking #', 'حجز ملعب #')
                                                        .replace('Refund for cancelled booking #', 'إرجاع حجز ملغي #')}
                                                </p>
                                            </td>

                                            {/* Creator */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-2">

                                                    <Icon
                                                        icon="mdi:account-tie"
                                                        className="w-4 h-4 text-slate-400"
                                                    />

                                                    <p className="text-xs font-extrabold text-slate-600">
                                                        {transaction.creator?.name || 'النظام'}
                                                    </p>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}

                                {transactions.data.length === 0 && (

                                    <tr>

                                        <td colSpan="6" className="px-6 py-16 text-center">

                                            <div className="flex flex-col items-center justify-center text-slate-400 py-12">

                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                                                    <Icon icon="mdi:file-document-outline" className="w-6 h-6 text-slate-300" />
                                                </div>

                                                <p className="font-bold text-sm text-slate-500">
                                                    لا توجد حركات مالية
                                                </p>

                                                <p className="text-xs mt-1 text-slate-400">
                                                    لم يتم العثور على أي نتائج.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}

                    {transactions.links && transactions.links.length > 3 && (

                        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-center">

                            <div className="flex items-center gap-2">

                                {transactions.links.map((link, i) => {

                                    let label = link.label;

                                    if (typeof label === 'string') {
                                        if (label.includes('&laquo;')) {
                                            label = <Icon icon="mdi:chevron-right" className="w-5 h-5" />;
                                        } else if (label.includes('&raquo;')) {
                                            label = <Icon icon="mdi:chevron-left" className="w-5 h-5" />;
                                        }
                                    }

                                    return (

                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-sans font-bold transition-all duration-200 ${
                                                link.active
                                                    ? 'bg-slate-900 text-white shadow-sm border border-slate-900'
                                                    : link.url
                                                    ? 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                                    : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                                            }`}
                                        >
                                            {typeof label === 'string'
                                                ? <span dangerouslySetInnerHTML={{ __html: label }} />
                                                : label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
            {/* Expense Modal */}

{expenseModalOpen && (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >

            {/* Header */}

            <div className="p-6 border-b border-slate-100 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/30 flex items-center justify-center text-[#EF4444]">
                        <Icon icon="mdi:cash-minus" className="w-5 h-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900">
                            إضافة مصروف
                        </h2>

                        <p className="text-xs text-slate-500 mt-0.5">
                            إضافة مصروف جديد للنظام
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setExpenseModalOpen(false)}
                    className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition"
                >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
            </div>

            {/* Form */}

            <form
                onSubmit={submitExpense}
                className="p-6 space-y-5"
            >

                {/* Title */}

                <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">
                        عنوان المصروف
                    </label>

                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) =>
                            setData('title', e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none placeholder-slate-400"
                        placeholder="مثال: إيجار النادي"
                    />

                    {errors.title && (
                        <p className="text-rose-500 text-[10px] mt-1 font-bold">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Description */}

                <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">
                        الوصف
                    </label>

                    <textarea
                        value={data.description}
                        onChange={(e) =>
                            setData('description', e.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none placeholder-slate-400"
                        rows="3"
                        placeholder="وصف إضافي للمصروف..."
                    />
                </div>

                {/* Grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Category */}

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                            التصنيف
                        </label>

                        <select
                            value={data.category}
                            onChange={(e) =>
                                setData('category', e.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none cursor-pointer"
                        >
                            <option value="rent">إيجار</option>
                            <option value="salary">رواتب</option>
                            <option value="utilities">فواتير</option>
                            <option value="maintenance">صيانة</option>
                            <option value="equipment">معدات</option>
                            <option value="marketing">تسويق</option>
                            <option value="subscription">اشتراكات</option>
                            <option value="tournament">بطولات</option>
                            <option value="supplies">مستلزمات</option>
                            <option value="miscellaneous">أخرى</option>
                        </select>
                    </div>

                    {/* Type */}

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                            النوع
                        </label>

                        <select
                            value={data.type}
                            onChange={(e) =>
                                setData('type', e.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none cursor-pointer"
                        >
                            <option value="one_time">
                                مرة واحدة
                            </option>

                            <option value="monthly">
                                شهري
                            </option>

                            <option value="yearly">
                                سنوي
                            </option>
                        </select>
                    </div>

                    {/* Amount */}

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                            المبلغ (ل.س)
                        </label>

                        <input
                            type="number"
                            value={data.amount}
                            onChange={(e) =>
                                setData('amount', e.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none placeholder-slate-400 font-sans"
                            placeholder="0"
                        />
                    </div>

                    {/* Date */}

                    {data.type === 'one_time' ? (

                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">
                                تاريخ المصروف
                            </label>

                            <input
                                type="date"
                                value={data.expense_date}
                                onChange={(e) =>
                                    setData('expense_date', e.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none placeholder-slate-400 font-sans"
                            />
                        </div>

                    ) : (

                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">
                                تاريخ البداية
                            </label>

                            <input
                                type="date"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData('starts_at', e.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all focus:ring-0 focus:outline-none placeholder-slate-400 font-sans"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">

                    <button
                        type="button"
                        onClick={() => setExpenseModalOpen(false)}
                        className="px-5 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-xs transition-all"
                    >
                        إلغاء
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all text-xs"
                    >
                        {processing
                            ? 'جاري الحفظ...'
                            : 'حفظ المصروف'}
                    </button>
                </div>
            </form>
        </motion.div>
    </div>
)}
        </AdminLayout>
    );
}