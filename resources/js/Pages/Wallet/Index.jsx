import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
dayjs.locale('ar');

export default function WalletIndex({ wallet, transactions }) {
    const { auth, flash, errors: pageErrors } = usePage().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') || auth?.user?.roles?.includes('Receptionist');

    const [showDepositModal, setShowDepositModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        description: '',
    });

    const submitDeposit = (e) => {
        e.preventDefault();
        post(route('wallet.deposit', wallet.id), {
            onSuccess: () => {
                setShowDepositModal(false);
                reset();
            },
        });
    };

    const formatAmount = (amount) =>
        parseFloat(amount).toLocaleString('en-US') + ' ل.س';

    return (
        <AdminLayout header="المحفظة الإلكترونية">
            <Head title="المحفظة الإلكترونية" />

            <div className="py-6" dir="rtl">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm font-medium">
                            <Icon icon="mdi:check-circle" className="w-5 h-5 shrink-0" />
                            {flash.success}
                        </div>
                    )}
                    {(pageErrors?.error || pageErrors?.amount) && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm font-medium">
                            <Icon icon="mdi:alert-circle" className="w-5 h-5 shrink-0" />
                            {pageErrors.error || pageErrors.amount}
                        </div>
                    )}

                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-primary to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden">
                        {/* decorative circles */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-white/5 rounded-full" />

                        <div className="relative flex justify-between items-start">
                            <div>
                                <p className="text-white/70 text-sm font-medium mb-2">الرصيد الحالي</p>
                                <p className="text-5xl font-black tracking-tight">
                                    {parseFloat(wallet.balance).toLocaleString('en-US')}
                                </p>
                                <p className="text-white/60 text-sm mt-1">ليرة سورية</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Icon icon="mdi:wallet" className="w-7 h-7 text-white" />
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="relative mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-2xl p-4">
                                <p className="text-white/60 text-xs mb-1">إجمالي الإيداع</p>
                                <p className="text-white font-bold text-lg">
                                    {formatAmount(
                                        transactions
                                            .filter(t => t.type === 'credit')
                                            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                    )}
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4">
                                <p className="text-white/60 text-xs mb-1">إجمالي الخصم</p>
                                <p className="text-white font-bold text-lg">
                                    {formatAmount(
                                        transactions
                                            .filter(t => t.type === 'debit')
                                            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Add Funds button — Admin only */}
                        {isAdmin && (
                            <div className="relative mt-6">
                                <button
                                    onClick={() => setShowDepositModal(true)}
                                    className="flex items-center gap-2 bg-[#cbfb45] text-primary font-bold px-5 py-2.5 rounded-xl hover:bg-[#b5e03e] transition-colors"
                                >
                                    <Icon icon="mdi:plus-circle" className="w-5 h-5" />
                                    إضافة رصيد
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <Icon icon="mdi:history" className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-gray-900">سجل المعاملات</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                {transactions.length} معاملة
                            </span>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="py-16 text-center">
                                <Icon icon="mdi:receipt-text-outline" className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">لا توجد معاملات حتى الآن</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-4">التاريخ</th>
                                            <th className="px-6 py-4">الوصف</th>
                                            <th className="px-6 py-4">النوع</th>
                                            <th className="px-6 py-4 text-left">المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                    {dayjs(tx.created_at).format('DD MMM YYYY - HH:mm')}
                                                </td>
                                                <td className="px-6 py-4 text-gray-800 font-medium">
                                                    {tx.description || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {tx.type === 'credit' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                                            <Icon icon="mdi:arrow-down-circle" className="w-3.5 h-3.5" />
                                                            إيداع
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                                                            <Icon icon="mdi:arrow-up-circle" className="w-3.5 h-3.5" />
                                                            خصم
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`px-6 py-4 font-bold text-left whitespace-nowrap ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en-US')} ل.س
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" dir="rtl">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowDepositModal(false)} />
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-primary">إضافة رصيد للمحفظة</h3>
                            <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={submitDeposit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">
                                    المبلغ <span className="text-gray-400 font-normal">(ل.س)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={data.amount}
                                        onFocus={e => e.target.select()}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 1 && val.startsWith('0')) {
                                                val = val.replace(/^0+/, '');
                                            }
                                            setData('amount', val);
                                        }}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary text-left pl-16"
                                        placeholder="مثال: 5000"
                                        dir="ltr"
                                        required
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">ل.س</span>
                                </div>
                                {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">سبب الإيداع</label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                    placeholder="مثال: شحن رصيد من الاستقبال"
                                    required
                                />
                                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                            </div>

                            {/* Quick amount presets */}
                            <div className="flex flex-wrap gap-2">
                                {[5000, 10000, 25000, 50000].map(preset => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setData('amount', preset)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                            data.amount == preset
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-gray-200 text-gray-600 hover:border-primary/50'
                                        }`}
                                    >
                                        {preset.toLocaleString('en-US')} ل.س
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4 flex gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowDepositModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                                    تأكيد الإيداع
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
