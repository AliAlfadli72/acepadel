import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import usePermissions from "@/hooks/usePermissions";
import 'dayjs/locale/ar';

dayjs.locale('ar');

export default function BookingsIndex({ bookings, courts, players, coaches, stats, filters }) {
    const { can } = usePermissions();

    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── local filter state (mirrors URL params) ────────────────────────
    const [search,    setSearch]    = useState(filters?.search    || '');
    const [status,    setStatus]    = useState(filters?.status    || 'all');
    const [date,      setDate]      = useState(filters?.date      || '');
    const [timeSlot,  setTimeSlot]  = useState(filters?.time_slot || '');
    const [courtId,   setCourtId]   = useState(filters?.court_id  || '');

    // Sync state when filters prop changes (e.g., via browser back button)
    useEffect(() => {
        setSearch(filters?.search || '');
        setStatus(filters?.status || 'all');
        setDate(filters?.date || '');
        setTimeSlot(filters?.time_slot || '');
        setCourtId(filters?.court_id || '');
    }, [filters]);

    // Send filters to server — pass ALL current values explicitly to avoid stale-closure bugs
    const go = (overrides = {}) => {
        const p = {
            search:    overrides.search    !== undefined ? overrides.search    : search,
            status:    overrides.status    !== undefined ? overrides.status    : status,
            date:      overrides.date      !== undefined ? overrides.date      : date,
            time_slot: overrides.time_slot !== undefined ? overrides.time_slot : timeSlot,
            court_id:  overrides.court_id  !== undefined ? overrides.court_id  : courtId,
        };
        Object.keys(p).forEach(k => { if (!p[k] || p[k] === 'all') delete p[k]; });
        router.get(route('admin.bookings'), p, { preserveState: true, preserveScroll: true, replace: true });
    };

    const resetFilters = () => {
        setSearch(''); setStatus('all'); setDate(''); setTimeSlot(''); setCourtId('');
        router.get(route('admin.bookings'), {}, { preserveScroll: true, replace: true });
    };

    const hasActiveFilters = search || (status && status !== 'all') || date || timeSlot || courtId;

    // ── booking form ───────────────────────────────────────────────────
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '', court_id: '', coach_profile_id: '',
        date: dayjs().format('YYYY-MM-DD'),
        start_time: '18:00', duration: 1,
    });

    const submitBooking = (e) => {
        e.preventDefault();
        post(route('admin.bookings.store'), { onSuccess: () => { setIsModalOpen(false); reset(); } });
    };

    const updateStatus = (id, action) => {

    if (!can('players.edit')) {
        return;
    }
        const msgs = { approve: 'تأكيد هذا الحجز؟', reject: 'إلغاء هذا الحجز؟', complete: 'تعليمه كمكتمل؟' };
        
        Swal.fire({
            title: 'تأكيد العملية',
            text: `هل أنت متأكد من ${msgs[action]}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'نعم، تأكيد',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
            router.post(
                route(`admin.bookings.${action}`, id),
                {},
                {
                    preserveScroll: true,

                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'تم تنفيذ العملية بنجاح',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },

                    onError: (errors) => {

                        console.log(errors);

                        Swal.fire({
                            icon: 'error',
                            title: 'خطأ',
                            text:
                                errors.error ||
                                errors.message ||
                                'حدث خطأ غير متوقع',
                        });
                    },
                }
            );           
         }
        });
    };
    const getPaymentBadge = (status) => {

        const map = {

            unpaid: [
                'غير مدفوع',
                'bg-red-100 text-red-600 border-red-200'
            ],

            partial: [
                'دفع جزئي',
                'bg-yellow-100 text-yellow-700 border-yellow-200'
            ],

            paid: [
                'مدفوع',
                'bg-green-100 text-green-700 border-green-200'
            ],
        };

        const [label, cls] = map[status] || [
            '—',
            'bg-gray-100 text-gray-500'
        ];

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>
                {label}
            </span>
        );
    };
    const [paymentModal, setPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [paymentData, setPaymentData] = useState({
        amount: '',
        payment_method: 'cash',
    });

    const getStatusBadge = (s) => {
        const map = {
            pending:   ['قيد الانتظار', 'bg-yellow-100 text-yellow-700 border-yellow-200'],
            approved:  ['مؤكد',         'bg-[#cbfb45]/20 text-[#6a871d] border-[#cbfb45]/50'],
            completed: ['مكتمل',        'bg-gray-100 text-gray-600 border-gray-200'],
            cancelled: ['ملغي',         'bg-red-100 text-red-600 border-red-200'],
        };
        const [label, cls] = map[s] || ['—', 'bg-gray-100 text-gray-500'];
        return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>{label}</span>;
    };
    const openPaymentModal = (booking) => {

        setSelectedBooking(booking);

        setPaymentData({
            amount: booking.total_price - (booking.paid_amount || 0),
            payment_method: 'cash',
        });

        setPaymentModal(true);
    };
    const submitPayment = () => {

    router.post(
        route('admin.bookings.payment', selectedBooking.id),
        paymentData,
        {
            preserveScroll: true,

            onSuccess: () => {

                setPaymentModal(false);

                Swal.fire({
                    icon: 'success',
                    title: 'تمت إضافة الدفعة بنجاح',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        }
    );
};

    const statusButtons = [
        { key: 'all',       label: 'الكل' },
        { key: 'pending',   label: 'قيد الانتظار' },
        { key: 'approved',  label: 'مؤكد' },
        { key: 'completed', label: 'مكتمل' },
        { key: 'cancelled', label: 'ملغي' },
    ];

    const timeSlots = [
        { key: '',          label: 'كل الأوقات', icon: '' },
        { key: 'morning',   label: 'صباحي (6-12)', icon: 'mdi:weather-sunset-up' },
        { key: 'afternoon', label: 'ظهري (12-5)', icon: 'mdi:weather-sunny' },
        { key: 'evening',   label: 'مسائي (+5)', icon: 'mdi:weather-night' },
    ];

    return (
        <AdminLayout header=" الحجوزات">
            <Head title=" الحجوزات" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ── Stats Cards ───────────────────────────────── */}
                        {can('bookings.manage') && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'إجمالي الحجوزات', value: stats.total,    icon: 'mdi:calendar-check',    color: 'text-primary bg-primary/10' },
                            { label: 'قيد الانتظار',     value: stats.pending,  icon: 'mdi:clock-outline',     color: 'text-yellow-600 bg-yellow-50' },
                            { label: 'مؤكدة',            value: stats.approved, icon: 'mdi:check-circle',      color: 'text-green-600 bg-green-50' },
                            { label: 'حجوزات اليوم',     value: stats.today,    icon: 'mdi:calendar-today',    color: 'text-blue-600 bg-blue-50' },
                        ].map(card => (
                            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                                    <Icon icon={card.icon} className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-gray-900">{card.value}</p>
                                    <p className="text-xs text-gray-500">{card.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                        )}

                    {/* ── Header + Add Button ───────────────────────── */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-primary">سجل الحجوزات</h3>
                            <p className="text-gray-500 text-sm">
                                {bookings.total} حجز{hasActiveFilters && <span className="text-primary font-bold"> (فلتر مفعّل)</span>}
                            </p>
                        </div>
                        {can('bookings.create') && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#cbfb45] text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#b5e03e] transition-colors"
                        >
                            <Icon icon="mdi:calendar-plus" className="w-5 h-5" />
                            حجز جديد (يدوي)
                        </button>
                        )}
                    </div>

                    {/* ── Filter Bar ────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                        {/* Row 1: search + date + court */}
                        <div className={`grid gap-3 ${
                            can('bookings.manage')
                                ? 'grid-cols-1 md:grid-cols-3'
                                : 'grid-cols-1 md:grid-cols-2'
                        }`}>                           
                         {/* Search */}
                         {can('bookings.manage') && (

                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="بحث بالاسم، جوال، ملعب..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && go({ search: e.target.value })}
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary"
                                />
                            </div>
                            )}

                            {/* Date */}
                            <div className="relative">
                                <Icon icon="mdi:calendar" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => { setDate(e.target.value); go({ date: e.target.value }); }}
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary text-left"
                                />
                            </div>

                            {/* Court */}
                            <div className="relative">
                                <Icon icon="mdi:tennis" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={courtId}
                                    onChange={e => { setCourtId(e.target.value); go({ court_id: e.target.value }); }}
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary appearance-none"
                                >
                                    <option value="">كل الملاعب</option>
                                    {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: status + time_slot + search button + reset */}
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                            {can('bookings.manage') && (

                            <div className="flex flex-wrap gap-2">
                                {/* Status buttons */}
                                {statusButtons.map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => { setStatus(s.key); go({ status: s.key }); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                                            status === s.key
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}

                                <div className="w-px bg-gray-200 mx-1" />

                                {/* Time slot buttons */}
                                {timeSlots.map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => { setTimeSlot(t.key); go({ time_slot: t.key }); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                                            timeSlot === t.key
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {t.icon && <Icon icon={t.icon} className={timeSlot === t.key ? "w-4 h-4 text-white" : "w-4 h-4 text-orange-400"} />}
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                                )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => go()}
                                    className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1"
                                >
                                    <Icon icon="mdi:magnify" className="w-4 h-4" />
                                    بحث
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                                    >
                                        <Icon icon="mdi:close" className="w-4 h-4" />
                                        مسح الفلاتر
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Table ─────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-4">#</th>
                                        <th className="px-5 py-4">اللاعب</th>
                                        <th className="px-5 py-4">الملعب</th>
                                        <th className="px-5 py-4">المدرب</th>
                                        <th className="px-5 py-4">التاريخ والوقت</th>
                                        {can('bookings.edit') && (
                                            <th className="px-5 py-4">السعر</th>
                                        )}
                                         {/* {can('bookings.edit') && ( */}
                                        <th className="px-5 py-4">الدفع</th>
                                        {/*  )} */}
                                        {/* {can('bookings.edit') && ( */}
                                        <th className="px-5 py-4">المدفوع</th>
                                        {/* )} */}
                                        <th className="px-5 py-4">الحالة</th>
                                       {can('players.create') && (
                                            <th className="px-5 py-4">إجراءات</th>
                                            )}                                 
                                        </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.data.map((booking) => {
                                        const start = dayjs(booking.start_time);
                                        const end   = dayjs(booking.end_time);
                                        const dur   = end.diff(start, 'hour');

                                        return (
                                            <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* # */}
                                                <td className="px-5 py-4 font-mono font-bold text-gray-400 text-xs">#{booking.id}</td>

                                                {/* Player */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {booking.user?.image_path
                                                                ? <img src={`/storage/${booking.user.image_path}`} className="w-full h-full object-cover" />
                                                                : <Icon icon="mdi:account" className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-primary text-sm flex items-center gap-1.5">
                                                                {booking.guest_name || booking.user?.name || 'محذوف'}
                                                                {!booking.user && (
                                                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">زائر</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-400" dir="ltr">
                                                                {booking.guest_phone || booking.user?.phone || ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Court */}
                                                <td className="px-5 py-4 font-bold text-gray-800 text-sm">{booking.court?.name || '—'}</td>

                                                {/* Coach */}
                                                <td className="px-5 py-4">
                                                    {booking.coach_profile ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Icon icon="mdi:whistle" className="w-3 h-3 text-primary" />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700">
                                                                {booking.coach_profile.user?.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-sm">—</span>
                                                    )}
                                                </td>

                                                {/* Date & Time */}
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-gray-800 text-sm">{start.format('DD MMM YYYY')}</div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Icon icon="mdi:clock-outline" className="w-3 h-3" />
                                                        <span dir="ltr">{start.format('HH:mm')} – {end.format('HH:mm')}</span>
                                                        <span className="text-primary font-bold">({dur}س)</span>
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                {can('bookings.edit') && (
                                                    <td className="px-5 py-4 font-bold text-green-600 text-sm" dir="ltr">
                                                        {parseInt(booking.total_price).toLocaleString('en-US')} <span className="text-gray-400 font-normal text-xs">ل.س</span>
                                                    </td>
                                                )}
                                                <td className="px-5 py-4">
                                                    {getPaymentBadge(booking.payment_status)}
                                                </td>

                                                <td className="px-5 py-4 font-bold text-primary">
                                                    {parseInt(booking.paid_amount || 0).toLocaleString('en-US')} <span className="text-gray-400 font-normal text-xs">ل.س</span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">{getStatusBadge(booking.status)}</td>

                                                {/* Actions */}
                                                {can('players.create') && (
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                        {booking.status === 'pending' && (<>
                                                            <button onClick={() => updateStatus(booking.id, 'approve')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="تأكيد">
                                                                <Icon icon="mdi:check" className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => updateStatus(booking.id, 'reject')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="رفض">
                                                                <Icon icon="mdi:close" className="w-4 h-4" />
                                                            </button>
                                                        </>)}
                                                        {booking.status === 'approved' && (<>
                                                            <button onClick={() => updateStatus(booking.id, 'complete')} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="إكمال">
                                                                <Icon icon="mdi:flag-checkered" className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => updateStatus(booking.id, 'reject')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="إلغاء">
                                                                <Icon icon="mdi:close" className="w-4 h-4" />
                                                            </button>
                                                        </>)}
                                                        {booking.payment_status !== 'paid' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openPaymentModal(booking)}
                                                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                                title="إضافة دفعة"
                                                            >
                                                                <Icon icon="mdi:cash-plus" className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                </td>
                                                     )} 
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {bookings.data.length === 0 && (
                                <div className="py-16 text-center">
                                    <Icon icon="mdi:calendar-search" className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-gray-400">لا توجد حجوزات مطابقة</h4>
                                    {hasActiveFilters && (
                                        <button onClick={resetFilters} className="mt-3 text-primary font-bold text-sm hover:underline">
                                            مسح الفلاتر
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Pagination ─────────────────────────────── */}
                        {bookings.last_page > 1 && (
                            <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <p className="text-xs text-gray-500">
                                    عرض <span className="font-bold">{bookings.from}</span>–<span className="font-bold">{bookings.to}</span> من <span className="font-bold">{bookings.total}</span> حجز
                                </p>
                                <div className="flex gap-1 flex-wrap justify-center">
                                    {bookings.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                            disabled={!link.url || link.active}
                                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors border ${
                                                link.active
                                                    ? 'bg-primary text-white border-primary'
                                                    : link.url
                                                        ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                                        : 'bg-white text-gray-300 border-gray-100 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Manual Booking Modal ──────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                            <h3 className="text-xl font-bold text-primary">إضافة حجز يدوي</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={submitBooking} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">اللاعب</label>
                                <select value={data.user_id} onChange={e => setData('user_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary" required>
                                    <option value="">-- اختر اللاعب --</option>
                                    {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone || p.email})</option>)}
                                </select>
                                {errors.user_id && <p className="text-red-500 text-xs">{errors.user_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">الملعب</label>
                                <select value={data.court_id} onChange={e => setData('court_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary" required>
                                    <option value="">-- اختر الملعب --</option>
                                    {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.court_id && <p className="text-red-500 text-xs">{errors.court_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">المدرب (اختياري)</label>
                                <select value={data.coach_profile_id} onChange={e => setData('coach_profile_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary">
                                    <option value="">-- بدون مدرب --</option>
                                    {coaches.map(c => <option key={c.id} value={c.id}>{c.user?.name} ({c.specialty || 'بدون تخصص'})</option>)}
                                </select>
                                {errors.coach_profile_id && <p className="text-red-500 text-xs">{errors.coach_profile_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">التاريخ</label>
                                    <input type="date" value={data.date} onChange={e => setData('date', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary" required />
                                    {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                                </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">
                                            وقت البدء
                                        </label>

                                        <select
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                            required
                                        >
                                            {Array.from({ length: 96 }).map((_, index) => {
                                                const hour = String(Math.floor(index / 4)).padStart(2, '0');
                                                const minute = String((index % 4) * 15).padStart(2, '0');

                                                const time = `${hour}:${minute}`;

                                                return (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        {errors.start_time && (
                                            <p className="text-red-500 text-xs">
                                                {errors.start_time}
                                            </p>
                                        )}

                                        {errors.time && (
                                            <p className="text-red-500 text-xs">
                                                {errors.time}
                                            </p>
                                        )}
                                    </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">المدة (ساعات)</label>
                                <select value={data.duration} onChange={e => setData('duration', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary">
                                    {[1,2,3,4].map(h => <option key={h} value={h}>{h === 1 ? 'ساعة واحدة' : h === 2 ? 'ساعتان' : `${h} ساعات`}</option>)}
                                </select>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors" disabled={processing}>
                                    إلغاء
                                </button>
                                <button type="submit" disabled={processing}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2">
                                    {processing && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                                    تأكيد الحجز
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
                
            )}
                                {paymentModal && (

<div className="fixed inset-0 z-[80] flex items-center justify-center px-4">

    <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setPaymentModal(false)}
    />

    <div className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10">

        <h3 className="text-xl font-bold text-primary mb-6">
            إضافة دفعة
        </h3>

        <div className="space-y-4">

            <div>
                <label className="block text-sm font-bold mb-2">
                    المبلغ
                </label>

                <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) =>
                        setPaymentData({
                            ...paymentData,
                            amount: e.target.value
                        })
                    }
                    className="w-full rounded-xl border-gray-200"
                />
            </div>

            <div>
                <label className="block text-sm font-bold mb-2">
                    طريقة الدفع
                </label>

                <select
                    value={paymentData.payment_method}
                    onChange={(e) =>
                        setPaymentData({
                            ...paymentData,
                            payment_method: e.target.value
                        })
                    }
                    className="w-full rounded-xl border-gray-200"
                >
                    <option value="cash">كاش</option>
                    <option value="wallet">محفظة</option>
                    <option value="card">بطاقة</option>
                    <option value="transfer">تحويل</option>
                </select>
            </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">

            <button
                onClick={() => setPaymentModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100"
            >
                إلغاء
            </button>

            <button
                onClick={submitPayment}
                className="px-4 py-2 rounded-xl bg-primary text-white"
            >
                حفظ الدفعة
            </button>

        </div>

    </div>

</div>
)}
        </AdminLayout>
    );
}
