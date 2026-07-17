import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState } from 'react';
import Swal from 'sweetalert2';
import { usePage } from '@inertiajs/react';
import usePermissions from "@/hooks/usePermissions";

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-600">{label}</label>
        {children}
    </div>
);

const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const value = `${hh}:${mm}`;
            
            const ampm = h >= 12 ? 'م' : 'ص';
            const displayHour = h % 12 === 0 ? 12 : h % 12;
            const displayHourStr = String(displayHour).padStart(2, '0');
            const label = `${displayHourStr}:${mm} ${ampm}`;
            
            options.push({ value, label });
        }
    }
    return options;
};
const TIME_OPTIONS = generateTimeOptions();

export default function PilatesIndex({ sessions, filters, stats, coaches = [] }) {

        const { can } = usePermissions();
    const { roles } = usePage().props;

    const canCreatePilatesSession =
        can('pilates.create') &&
        (roles.includes('Admin') || roles.includes('Pilates Admin'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [date, setDate] = useState(filters?.date || '');

    const applyFilters = (overrides = {}) => {
        const p = { search: overrides.search ?? search, date: overrides.date ?? date };
        Object.keys(p).forEach(k => { if (!p[k]) delete p[k]; });
        router.get(route('admin.pilates.index'), p, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setDate('');
        router.get(route('admin.pilates.index'));
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        description: '',
        coach_id: '',
        session_type: 'indoor',
        capacity: 10,
        price_per_session: 15.00,
        session_date: '',
        start_time: '',
        end_time: '',
        status: 'active',
    });

    const openAdd = () => {
        clearErrors();
        reset();
        setEditingSession(null);
        setIsModalOpen(true);
    };

    const openEdit = (s) => {
        clearErrors();
        setEditingSession(s);
        setData({
            title: s.title,
            description: s.description || '',
            coach_id: s.coach_id || '',
            session_type: s.session_type || 'indoor',
            capacity: s.capacity,
            price_per_session: parseFloat(s.price_per_session),
            session_date: s.session_date,
            start_time: s.start_time.substring(0, 5),
            end_time: s.end_time.substring(0, 5),
            status: s.status,
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingSession) {
            router.post(route('admin.pilates.update', editingSession.id), {
                _method: 'PUT',
                ...data
            }, {
                onSuccess: () => { setIsModalOpen(false); reset(); },
                onError: (errs) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'خطأ في المدخلات',
                        text: Object.values(errs).join('\n'),
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#222831'
                    });
                }
            });
        } else {
            post(route('admin.pilates.store'), {
                onSuccess: () => { setIsModalOpen(false); reset(); },
                onError: (errs) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'حدث خطأ ما',
                        text: Object.values(errs).join('\n'),
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#222831'
                    });
                }
            });
        }
    };

    const cancelSession = (id) => {
        Swal.fire({
            title: 'إلغاء الجلسة وإرجاع الرصيد؟',
            text: 'سيتم إلغاء هذه الجلسة وإخطار المشتركين فوراً، مع إرجاع قيمة الجلسة إلى محافظهم.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، قم بالإلغاء',
            cancelButtonText: 'تراجع'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.pilates.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('تم الإلغاء', 'تم إلغاء جلسة البيلاتس بنجاح وإرجاع المبالغ للمشتركين.', 'success');
                    }
                });
            }
        });
    };

    return (
        <AdminLayout header="جلسات البيلاتس">
            <Head title="إدارة جلسات البيلاتس" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'إجمالي الجلسات', value: stats.total_sessions, icon: 'mdi:yoga', color: 'text-primary bg-primary/10' },
                            { label: 'حجوزات نشطة', value: stats.total_bookings, icon: 'mdi:calendar-check', color: 'text-blue-600 bg-blue-50' },
                            { label: 'إجمالي الإيرادات المؤكدة', value: `${stats.total_revenue.toLocaleString('en-US')} ل.س`, icon: 'mdi:cash-multiple', color: 'text-green-600 bg-green-50' },
                        ].map(c => (
                            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                                    <Icon icon={c.icon} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-gray-900">{c.value}</p>
                                    <p className="text-xs text-gray-400">{c.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Header Action Button */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-primary">جلسات البيلاتس</h3>
                            <p className="text-gray-400 text-sm">{sessions.total} جلسة مسجلة</p>
                        </div>
                            {canCreatePilatesSession && (
                                <button
                                    onClick={openAdd}
                                    className="bg-[#d6e02e] text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#b8c21a] transition-colors"
                                >
                                    <Icon icon="mdi:plus-circle-outline" className="w-5 h-5" />
                                    إنشاء جلسة جديدة
                                </button>
                            )}
                    </div>

                    {/* Filter bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Icon icon="mdi:magnify" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input type="text" placeholder="بحث باسم الجلسة أو المدرب..." value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                                    className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Date Filter */}
                            <div className="relative min-w-[150px]">
                                <input type="date" value={date}
                                    onChange={e => { setDate(e.target.value); applyFilters({ date: e.target.value }); }}
                                    className="w-full py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary" />
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => applyFilters()} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 flex items-center gap-1">
                                    بحث
                                </button>
                                {(search || date) && (
                                    <button onClick={resetFilters} className="px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold flex items-center gap-1">
                                        مسح
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-5 py-3.5">اسم الجلسة</th>
                                        <th className="px-5 py-3.5">المدرب</th>
                                        <th className="px-5 py-3.5">التاريخ والوقت</th>
                                        <th className="px-5 py-3.5">القدرة الاستيعابية / الشواغر</th>
                                        <th className="px-5 py-3.5">السعر</th>
                                        <th className="px-5 py-3.5">الحالة</th>
                                        <th className="px-5 py-3.5">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sessions.data.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-5 py-3.5 font-bold text-primary">{s.title}</td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                <div className="font-bold">{s.coach ? s.coach.name : 'غير محدد'}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                    {s.session_type === 'indoor' ? 'صالة داخلية (Indoor)' : 'خارجية (Outdoor)'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                <div>{s.session_date}</div>
                                                <div className="text-xs text-gray-400">
                                                    <span dir="ltr">{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-bold">
                                                <span className="text-gray-900">{s.bookings_count}</span>
                                                <span className="text-gray-400 text-xs"> / {s.capacity} مشترك</span>
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-slate-800">{parseFloat(s.price_per_session).toLocaleString()} ل.س</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    s.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    s.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {
                                                        s.status === 'active' ? 'نشطة' :
                                                        s.status === 'completed' ? 'منتهية' : 'ملغاة'
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => openEdit(s)}
                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="تعديل">
                                                        <Icon icon="mdi:pencil" className="w-4 h-4" />
                                                    </button>
                                                    {s.status === 'active' && (
                                                        <button onClick={() => cancelSession(s.id)}
                                                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="إلغاء الجلسة">
                                                            <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {sessions.data.length === 0 && (
                                <div className="py-16 text-center">
                                    <Icon icon="mdi:yoga" className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 font-bold">لا يوجد جلسات بيلاتس حالياً</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                            <h3 className="text-lg font-bold text-primary">{editingSession ? 'تعديل بيانات الجلسة' : 'إنشاء جلسة بيلاتس جديدة'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><Icon icon="mdi:close" className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={submit} className="p-5 space-y-4">
                            <Field label="عنوان الجلسة *">
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                                    placeholder="مثال: بيلاتس للمبتدئين"
                                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm" />
                                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                            </Field>

                            <Field label="اسم المدرب *">
                                <select value={data.coach_id} onChange={e => setData('coach_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm">
                                    <option value="">-- اختر المدرب --</option>
                                    {coaches.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.coach_id && <p className="text-red-500 text-xs">{errors.coach_id}</p>}
                            </Field>

                            <Field label="نوع الجلسة *">
                                <select value={data.session_type} onChange={e => setData('session_type', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm">
                                    <option value="indoor">صالة داخلية (Indoor)</option>
                                    <option value="outdoor">خارجية (Outdoor)</option>
                                </select>
                                {errors.session_type && <p className="text-red-500 text-xs">{errors.session_type}</p>}
                            </Field>

                            <Field label="وصف الجلسة">
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                    placeholder="وصف تفصيلي للجلسة (اختياري)"
                                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm" rows="3" />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="القدرة الاستيعابية (عدد اللاعبين) *">
                                    <input type="number" min="1" value={data.capacity} onChange={e => setData('capacity', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm" />
                                    {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity}</p>}
                                </Field>

                                <Field label="سعر الجلسة (ل.س) *">
                                    <input type="number" min="0" step="any" value={data.price_per_session} onChange={e => setData('price_per_session', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm" />
                                    {errors.price_per_session && <p className="text-red-500 text-xs">{errors.price_per_session}</p>}
                                </Field>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <Field label="تاريخ الجلسة *">
                                    <input type="date" value={data.session_date} onChange={e => setData('session_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm" />
                                    {errors.session_date && <p className="text-red-500 text-xs">{errors.session_date}</p>}
                                </Field>

                                <Field label="وقت البدء *">
                                    <select value={data.start_time} onChange={e => setData('start_time', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm">
                                        <option value="">-- اختر وقت البدء --</option>
                                        {TIME_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    {errors.start_time && <p className="text-red-500 text-xs">{errors.start_time}</p>}
                                </Field>

                                <Field label="وقت الانتهاء *">
                                    <select value={data.end_time} onChange={e => setData('end_time', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm">
                                        <option value="">-- اختر وقت الانتهاء --</option>
                                        {TIME_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    {errors.end_time && <p className="text-red-500 text-xs">{errors.end_time}</p>}
                                </Field>
                            </div>

                            {editingSession && (
                                <Field label="الحالة *">
                                    <select value={data.status} onChange={e => setData('status', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm">
                                        <option value="active">نشطة</option>
                                        <option value="completed">منتهية (انتهت)</option>
                                        <option value="canceled">ملغاة</option>
                                    </select>
                                </Field>
                            )}

                            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 text-sm" disabled={processing}>إلغاء</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 text-sm flex items-center gap-2">
                                    {processing && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                                    {editingSession ? 'حفظ التعديلات' : 'إضافة الجلسة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
