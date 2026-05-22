import React, { useMemo, useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
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
        text: 'text-emerald-700',
        border: 'border-emerald-100/50',
        amount: 'text-emerald-600 bg-emerald-50/50',
        icon: 'mdi:arrow-bottom-left',
        sign: '+',
    },

    booking_payment: {
        label: 'دفع حجز',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-100/50',
        amount: 'text-red-600 bg-red-50/50',
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
        text: 'text-rose-700',
        border: 'border-rose-100/50',
        amount: 'text-rose-600 bg-rose-50/50',
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
                className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 font-arabic text-right"
                dir="rtl"
            >
                <p className="font-bold text-gray-900 mb-2">
                    {label}
                </p>

                {payload.map((entry, index) => (

                    <div
                        key={index}
                        className="flex items-center gap-2 text-sm mb-1"
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />

                        <span className="text-gray-600">
                            {entry.name}:
                        </span>

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
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6"
                >

                    {/* Revenue */}

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full" />

                        <div className="relative flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">
                                    أرباح الحجوزات
                                </p>

                                <p className="text-3xl font-black text-gray-900 font-sans">
                                    {Number(stats.total_bookings_revenue || 0).toLocaleString('en-US')}

                                    <span className="text-sm mr-1 text-gray-400">
                                        ل.س
                                    </span>
                                </p>
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Icon icon="mdi:calendar-check" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Deposits */}

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full" />

                        <div className="relative flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">
                                    إجمالي الإيداعات
                                </p>

                                <p className="text-3xl font-black text-gray-900 font-sans">
                                    {Number(stats.total_deposits || 0).toLocaleString('en-US')}

                                    <span className="text-sm mr-1 text-gray-400">
                                        ل.س
                                    </span>
                                </p>
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <Icon icon="mdi:cash-plus" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Refunds */}

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full" />

                        <div className="relative flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">
                                    الاسترجاعات
                                </p>

                                <p className="text-3xl font-black text-gray-900 font-sans">
                                    {Number(stats.total_refunds || 0).toLocaleString('en-US')}

                                    <span className="text-sm mr-1 text-gray-400">
                                        ل.س
                                    </span>
                                </p>
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                                <Icon icon="mdi:cash-refund" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>
                    {/* Expenses */}

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full" />

                        <div className="relative flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">
                                    المصروفات
                                </p>

                                <p className="text-3xl font-black text-gray-900 font-sans">
                                    {Number(stats.total_expenses || 0).toLocaleString('en-US')}

                                    <span className="text-sm mr-1 text-gray-400">
                                        ل.س
                                    </span>
                                </p>
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                                <Icon icon="mdi:cash-minus" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Net Revenue */}

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full" />

                        <div className="relative flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">
                                    صافي الأرباح
                                </p>

                                <p className="text-3xl font-black text-gray-900 font-sans">
                                    {Number(stats.net_revenue || 0).toLocaleString('en-US')}

                                    <span className="text-sm mr-1 text-gray-400">
                                        ل.س
                                    </span>
                                </p>
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                                <Icon icon="mdi:finance" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Wallets */}

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full" />

                        <div className="relative flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">
                                    أرصدة المحافظ
                                </p>

                                <p className="text-3xl font-black text-gray-900 font-sans">
                                    {Number(stats.total_wallets_balance || 0).toLocaleString('en-US')}

                                    <span className="text-sm mr-1 text-gray-400">
                                        ل.س
                                    </span>
                                </p>
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <Icon icon="mdi:wallet" className="w-7 h-7" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Chart */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8"
                >

                    <div className="flex items-center justify-between mb-8">

                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                الأداء المالي الشهري
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                تحليل الإيرادات والإيداعات والاسترجاعات
                            </p>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icon icon="mdi:chart-bell-curve-cumulative" className="w-6 h-6" />
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
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f3f4f6"
                                />

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
                                    name="الإيداعات"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorDeposits)"
                                />

                                <Area
                                    type="monotone"
                                    dataKey="refunds"
                                    name="الاسترجاعات"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={0}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    name="المصروفات"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpenses)"
                                />
                                <Area
                                    type="monotone"
                                        dataKey="net"
                                        name="صافي الربح"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
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
    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
>

    {/* Header */}

    <div className="p-6 border-b border-gray-100 flex items-center justify-between">

        <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Icon icon="mdi:cash-minus" className="w-6 h-6" />
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900">
                    إدارة المصروفات
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    إدارة جميع مصروفات الأكاديمية
                </p>
            </div>
        </div>

        <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-primary text-gray-900 font-bold flex items-center gap-2 hover:scale-105 transition"
        >
            <Icon icon="mdi:plus" className="w-5 h-5" />
            إضافة مصروف
        </button>
    </div>

    {/* Expenses Table */}

    <div className="overflow-x-auto">

        <table className="w-full text-right whitespace-nowrap">

            <thead className="bg-gray-50 border-b border-gray-100">

                <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-400">
                        العنوان
                    </th>

                    <th className="px-6 py-4 text-sm font-bold text-gray-400">
                        النوع
                    </th>

                    <th className="px-6 py-4 text-sm font-bold text-gray-400">
                        المبلغ
                    </th>

                    <th className="px-6 py-4 text-sm font-bold text-gray-400">
                        البداية
                    </th>

                    <th className="px-6 py-4 text-sm font-bold text-gray-400">
                        النهاية
                    </th>

                    <th className="px-6 py-4 text-sm font-bold text-gray-400">
                        الحالة
                    </th>

                    <th className="px-6 py-4 text-sm font-bold text-gray-400">
                        الإجراءات
                    </th>
                </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">

                {expenses.map((expense) => (

                    <tr
                        key={expense.id}
                        className="hover:bg-gray-50/70 transition"
                    >

                        {/* Title */}

                        <td className="px-6 py-5">

                            <div>
                                <p className="font-bold text-gray-900">
                                    {expense.title}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    {expense.description || 'لا يوجد وصف'}
                                </p>
                            </div>
                        </td>

                        {/* Type */}

                        <td className="px-6 py-5">

                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700">

                                {expense.type === 'one_time'
                                    ? 'مرة واحدة'
                                    : expense.type === 'monthly'
                                    ? 'شهري'
                                    : 'سنوي'}
                            </span>
                        </td>

                        {/* Amount */}

                        <td className="px-6 py-5">

                            <span className="font-black text-rose-600 font-sans">
                                -{Number(expense.amount).toLocaleString('en-US')} ل.س
                            </span>
                        </td>

                        {/* Start */}

                        <td className="px-6 py-5 text-sm text-gray-700 font-sans">
                            {expense.starts_at
                                ? dayjs(expense.starts_at).format('YYYY-MM-DD')
                                : expense.expense_date
                                ? dayjs(expense.expense_date).format('YYYY-MM-DD')
                                : '-'}
                        </td>

                        {/* End */}

                        <td className="px-6 py-5 text-sm text-gray-700 font-sans">
                            {expense.ends_at
                                ? dayjs(expense.ends_at).format('YYYY-MM-DD')
                                : '-'}
                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                                expense.active
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-600'
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
                                        className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition"
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
                                    className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition"
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
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >

                    {/* Header */}

                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">

                        <div className="flex items-center gap-3">

                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                <Icon icon="mdi:swap-horizontal-bold" className="w-6 h-6 text-gray-700" />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    السجل المالي
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
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
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />

        <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleFilterChange}
            placeholder="بحث..."
            className="w-full sm:w-72 pl-4 pr-12 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
        />
    </div>

    {/* Type Filter */}

    <select
        name="type"
        value={filters.type || 'all'}
        onChange={handleFilterChange}
        className="px-5 py-3 rounded-2xl border border-gray-200 text-sm font-bold"
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
        className="px-5 py-3 rounded-2xl border border-gray-200 text-sm font-bold"
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
        className="px-5 py-3 rounded-2xl border border-gray-200 text-sm font-bold"
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

                            <thead className="bg-white border-b border-gray-100">

                                <tr>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400">التاريخ</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400">اللاعب</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400">النوع</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400">المبلغ</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400">الوصف</th>
                                    <th className="px-6 py-5 text-sm font-bold text-gray-400">بواسطة</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">

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
                                            className="hover:bg-gray-50/80 transition-colors"
                                        >

                                            {/* Date */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-2">

                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                        <Icon icon="mdi:calendar-clock" className="w-4 h-4 text-gray-400" />
                                                    </div>

                                                    <span className="text-gray-900 font-bold text-sm font-sans">
                                                        {dayjs(transaction.created_at)
                                                            .locale('en')
                                                            .format('YYYY-MM-DD')}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Player */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                                                        {transaction.wallet?.user?.name?.charAt(0) || '?'}
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {transaction.wallet?.user?.name || 'مصروف إداري'}
                                                        </p>

                                                        <p className="text-xs text-gray-500 font-sans mt-0.5">
                                                            {transaction.wallet?.user?.phone || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Type */}

                                            <td className="px-6 py-5">

                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${config.bg} ${config.text} ${config.border}`}>
                                                    <Icon icon={config.icon} className="w-3.5 h-3.5" />
                                                    {config.label}
                                                </span>
                                            </td>

                                            {/* Amount */}

                                            <td className="px-6 py-5">

                                                <span className={`text-base font-black font-sans px-3 py-1.5 rounded-lg ${config.amount}`}>

                                                    {config.sign}

                                                    {Number(transaction.amount).toLocaleString('en-US')}

                                                    <span className="text-xs font-arabic font-bold opacity-70 mr-1">
                                                        ل.س
                                                    </span>
                                                </span>
                                            </td>

                                            {/* Description */}

                                            <td className="px-6 py-5">

                                                <p
                                                    className="text-sm text-gray-600 max-w-[250px] truncate bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100/50"
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
                                                        className="w-4 h-4 text-gray-400"
                                                    />

                                                    <p className="text-sm font-bold text-gray-600">
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

                                            <div className="flex flex-col items-center justify-center text-gray-400">

                                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                                    <Icon icon="mdi:file-document-outline" className="w-8 h-8 text-gray-300" />
                                                </div>

                                                <p className="font-bold text-lg text-gray-500">
                                                    لا توجد حركات مالية
                                                </p>

                                                <p className="text-sm mt-1">
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

                        <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-center">

                            <div className="flex items-center gap-2">

                                {transactions.links.map((link, i) => {

                                    let label = link.label;

                                    if (label.includes('&laquo;')) {
                                        label = <Icon icon="mdi:chevron-right" className="w-5 h-5" />;
                                    }

                                    if (label.includes('&raquo;')) {
                                        label = <Icon icon="mdi:chevron-left" className="w-5 h-5" />;
                                    }

                                    return (

                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-sans transition-all duration-200 ${
                                                link.active
                                                    ? 'bg-primary text-gray-900 font-black shadow-lg shadow-[#d6e02e]/30 border border-[#d6e02e]'
                                                    : link.url
                                                    ? 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-bold'
                                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                                            }`}
                                        >
                                            {typeof label === 'string'
                                                ? <span dangerouslySetInnerHTML={{ __html: label }} />
                                                : label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
            {/* Expense Modal */}

{expenseModalOpen && (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >

            {/* Header */}

            <div className="p-6 border-b border-gray-100 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                        <Icon icon="mdi:cash-minus" className="w-6 h-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-gray-900">
                            إضافة مصروف
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            إضافة مصروف جديد للنظام
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setExpenseModalOpen(false)}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                    <Icon icon="mdi:close" className="w-5 h-5" />
                </button>
            </div>

            {/* Form */}

            <form
                onSubmit={submitExpense}
                className="p-6 space-y-5"
            >

                {/* Title */}

                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                        عنوان المصروف
                    </label>

                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) =>
                            setData('title', e.target.value)
                        }
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                        placeholder="مثال: إيجار النادي"
                    />

                    {errors.title && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Description */}

                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                        الوصف
                    </label>

                    <textarea
                        value={data.description}
                        onChange={(e) =>
                            setData('description', e.target.value)
                        }
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                        rows="3"
                    />
                </div>

                {/* Grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Category */}

                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                            التصنيف
                        </label>

                        <select
                            value={data.category}
                            onChange={(e) =>
                                setData('category', e.target.value)
                            }
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3"
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
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                            النوع
                        </label>

                        <select
                            value={data.type}
                            onChange={(e) =>
                                setData('type', e.target.value)
                            }
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3"
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
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                            المبلغ
                        </label>

                        <input
                            type="number"
                            value={data.amount}
                            onChange={(e) =>
                                setData('amount', e.target.value)
                            }
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                        />
                    </div>

                    {/* Date */}

                    {data.type === 'one_time' ? (

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                                تاريخ المصروف
                            </label>

                            <input
                                type="date"
                                value={data.expense_date}
                                onChange={(e) =>
                                    setData('expense_date', e.target.value)
                                }
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                            />
                        </div>

                    ) : (

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                                تاريخ البداية
                            </label>

                            <input
                                type="date"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData('starts_at', e.target.value)
                                }
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">

                    <button
                        type="button"
                        onClick={() => setExpenseModalOpen(false)}
                        className="px-5 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                    >
                        إلغاء
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 rounded-2xl bg-primary text-gray-900 font-black hover:scale-105 transition"
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