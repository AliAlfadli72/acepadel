import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function PilatesBookings({ bookings, sessions, filters }) {
    const [status, setStatus] = useState(filters?.status || '');
    const [sessionId, setSessionId] = useState(filters?.session_id || '');

    const applyFilters = (overrides = {}) => {
        const p = { status: overrides.status ?? status, session_id: overrides.session_id ?? sessionId };
        Object.keys(p).forEach(k => { if (!p[k]) delete p[k]; });
        router.get(route('admin.pilates.bookings.index'), p, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setStatus('');
        setSessionId('');
        router.get(route('admin.pilates.bookings.index'));
    };

    const confirmBooking = (id) => {
        Swal.fire({
            title: 'تأكيد الحجز؟',
            text: 'هل ترغب في تأكيد حجز هذا اللاعب؟ سيتم إخطار اللاعب وتأكيد السداد.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#84cc16',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، قم بالتأكيد',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.pilates.bookings.confirm', id), {}, {
                    onSuccess: () => {
                        Swal.fire('تم التأكيد', 'تم تأكيد حجز اللاعب بنجاح وإرسال إشعار فوري له.', 'success');
                    }
                });
            }
        });
    };

    const cancelBooking = (id) => {
        Swal.fire({
            title: 'إلغاء حجز اللاعب؟',
            text: 'سيتم إلغاء الحجز، وفي حال كان الدفع عبر المحفظة سيتم إرجاع الرصيد تلقائياً إلى محفظة اللاعب.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، قم بالإلغاء',
            cancelButtonText: 'تراجع'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.pilates.bookings.cancel', id), {}, {
                    onSuccess: () => {
                        Swal.fire('تم الإلغاء', 'تم إلغاء الحجز بنجاح وإرجاع المبالغ للمحفظة إن وجدت.', 'success');
                    }
                });
            }
        });
    };

    const statusBadge = (s) => {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'confirmed': 'bg-green-100 text-green-700',
            'canceled': 'bg-red-100 text-red-700'
        };
        const labels = {
            'pending': 'بانتظار التأكيد',
            'confirmed': 'مؤكد',
            'canceled': 'ملغى'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${classes[s] || 'bg-gray-100 text-gray-500'}`}>
                {labels[s] || s}
            </span>
        );
    };

    return (
        <AdminLayout header="حجوزات البيلاتس">
            <Head title="إدارة حجوزات البيلاتس" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header Title */}
                    <div>
                        <h3 className="text-xl font-bold text-primary">حجوزات المشتركين</h3>
                        <p className="text-gray-400 text-sm">{bookings.total} حجز مسجل</p>
                    </div>

                    {/* Filter bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Session Filter */}
                            <div className="flex-1 min-w-[220px]">
                                <label className="block text-xs text-gray-400 font-bold mb-1.5">تصفية حسب الجلسة</label>
                                <select value={sessionId}
                                    onChange={e => { setSessionId(e.target.value); applyFilters({ session_id: e.target.value }); }}
                                    className="w-full py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary">
                                    <option value="">جميع الجلسات</option>
                                    {sessions.map(s => (
                                        <option key={s.id} value={s.id}>{s.title} ({s.session_date})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="min-w-[150px]">
                                <label className="block text-xs text-gray-400 font-bold mb-1.5">تصفية حسب الحالة</label>
                                <select value={status}
                                    onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                                    className="w-full py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary">
                                    <option value="">جميع الحالات</option>
                                    <option value="pending">بانتظار التأكيد (نقدي)</option>
                                    <option value="confirmed">مؤكدة</option>
                                    <option value="canceled">ملغاة</option>
                                </select>
                            </div>

                            <div className="flex gap-2 self-end">
                                <button onClick={() => applyFilters()} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90">
                                    تصفية
                                </button>
                                {(status || sessionId) && (
                                    <button onClick={resetFilters} className="px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold">
                                        مسح
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-5 py-3.5">اللاعب المشترك</th>
                                        <th className="px-5 py-3.5">الجلسة</th>
                                        <th className="px-5 py-3.5">طريقة الدفع</th>
                                        <th className="px-5 py-3.5">المبلغ المدفوع</th>
                                        <th className="px-5 py-3.5">حالة الحجز</th>
                                        <th className="px-5 py-3.5">تاريخ الحجز</th>
                                        <th className="px-5 py-3.5">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.data.map(b => (
                                        <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-primary">{b.user?.name || 'مستخدم محذوف'}</div>
                                                <div className="text-xs text-gray-400" dir="ltr">{b.user?.phone || '—'}</div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-gray-800">{b.pilates_session?.title}</div>
                                                <div className="text-xs text-gray-400">مع المدرب: {b.pilates_session?.coach_name}</div>
                                                <div className="text-xs text-gray-400">التاريخ: {b.pilates_session?.session_date}</div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                <span className="flex items-center gap-1.5">
                                                    <Icon 
                                                        icon={
                                                            b.payment_method === 'wallet' ? 'mdi:wallet' : 
                                                            b.payment_method === 'package' ? 'mdi:ticket-percent' : 'mdi:cash'
                                                        } 
                                                        className={`w-4 h-4 ${
                                                            b.payment_method === 'package' ? 'text-emerald-600' : 'text-slate-400'
                                                        }`} 
                                                    />
                                                    {
                                                        b.payment_method === 'wallet' ? 'محفظة' : 
                                                        b.payment_method === 'package' ? 'باقة اشتراك' : 'نقداً'
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-slate-800">{parseFloat(b.paid_amount).toLocaleString()} ل.س</td>
                                            <td className="px-5 py-3.5">{statusBadge(b.status)}</td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(b.created_at).toLocaleDateString('ar-SY-u-nu-latn')}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    {b.status === 'pending' && (
                                                        <button onClick={() => confirmBooking(b.id)}
                                                            className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold flex items-center gap-1"
                                                            title="تأكيد الحجز">
                                                            <Icon icon="mdi:check-circle-outline" className="w-4 h-4" />
                                                            تأكيد
                                                        </button>
                                                    )}
                                                    {b.status !== 'canceled' && (
                                                        <button onClick={() => cancelBooking(b.id)}
                                                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="إلغاء الحجز">
                                                            <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bookings.data.length === 0 && (
                                <div className="py-16 text-center">
                                    <Icon icon="mdi:calendar-search" className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 font-bold">لا توجد حجوزات مطابقة للفلاتر المحددة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
