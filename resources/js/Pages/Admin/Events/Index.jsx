import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import Swal from 'sweetalert2';
import usePermissions from "@/hooks/usePermissions";

export default function Index({ events }) {
    const { can } = usePermissions();
    const { auth } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: null,
        title_ar: '',
        title_en: '',
        desc_ar: '',
        desc_en: '',
        category: 'Tournament',
        level: 'Open',
        date: '',
        time: '',
        fee: 0,
        prize_ar: '',
        prize_en: '',
        max_participants: 0,
        color_class: 'bg-primary text-white',
        status: 'upcoming',
        image: null,
        _method: 'post'
    });

    const handleCreate = () => {

        if (!can('events.create')) {
            return;
        }

        setEditMode(false);
        reset();
        setData('id', null);
        setData('_method', 'post');
        setIsModalOpen(true);
    };

    const handleEdit = (event) => {

         if (!can('events.edit')) {
            return;
        }
        setEditMode(true);
        setData({
            id: event.id,
            title_ar: event.title_ar,
            title_en: event.title_en,
            desc_ar: event.desc_ar,
            desc_en: event.desc_en,
            category: event.category,
            level: event.level,
            date: event.date ? event.date.split('T')[0] : '',

            time: event.time
                ? event.time.split(':').slice(0, 2).join(':')
                : '',

            fee: event.fee,
            prize_ar: event.prize_ar || '',
            prize_en: event.prize_en || '',
            max_participants: event.max_participants || 0,
            color_class: event.color_class,
            status: event.status,
            image: null,
            _method: 'put'
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (editMode) {
            post(route('admin.events.update', data.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.events.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'تأكيد الحذف',
            text: 'هل أنت متأكد من حذف هذه الفعالية؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
            router.delete(route('admin.events.destroy', id), {

                onError: (errors) => {

                    Swal.fire({
                        icon: 'error',
                        title: 'تعذر حذف الفعالية',
                        text: errors.error || 'حدث خطأ غير متوقع',
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#d33',
                    });
                },

                onSuccess: () => {

                    Swal.fire({
                        icon: 'success',
                        title: 'تم حذف الفعالية',
                        text: 'تم حذف الفعالية واسترجاع الرسوم للمشتركين.',
                        confirmButtonColor: '#10b981',
                    });
                }
            });            
        }
        });
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ongoing': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'upcoming': return 'قادمة';
            case 'ongoing': return 'جارية';
            case 'completed': return 'مكتملة';
            default: return status;
        }
    };

    return (
        <AdminLayout header=" الفعاليات">
            <Head title=" الفعاليات" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Icon icon="mdi:trophy" className="text-primary w-8 h-8" />
                            الفعاليات والبطولات
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">إدارة فعاليات الأكاديمية ومتابعة طلبات التسجيل</p>
                    </div>
                    {can('events.create') && (
                        <button 
                            onClick={handleCreate}
                            className="btn-primary"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
                            إضافة فعالية جديدة
                        </button>
                    )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className={`h-2 ${event.color_class.split(' ')[0]}`}></div>
                            {event.image_path && (
                                <img src={`/storage/${event.image_path}`} alt={event.title_ar} className="h-40 w-full object-cover" />
                            )}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusStyle(event.status)}`}>
                                        {getStatusText(event.status)}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link href={route('admin.events.show', event.id)} className="text-gray-400 hover:text-green-500 transition-colors">
                                            <Icon icon="mdi:eye-outline" className="w-5 h-5" />
                                        </Link>
                                        {can('events.edit') && (
                                            <button onClick={() => handleEdit(event)} className="text-gray-400 hover:text-blue-500 transition-colors">
                                                <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
                                            </button>
                                        )}
                                        {can('events.delete') && (
                                            <button onClick={() => handleDelete(event.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Icon icon="mdi:trash-can-outline" className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{event.title_ar}</h3>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{event.desc_ar}</p>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Icon icon="mdi:calendar" className="text-gray-400" />
                                        <span>{new Date(event.date).toLocaleDateString('ar-SY')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Icon icon="mdi:account-group" className="text-gray-400" />
                                        <span>{event.registrations_count} / {event.max_participants || '∞'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Icon icon="mdi:cash" className="text-gray-400" />
                                        <span>{event.fee > 0 ? `${event.fee} ل.س` : 'مجاني'}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100">

    {/* ================= ADMIN VIEW ================= */}
    {can('events.edit') ? (
        <>

            {event.pending_registrations_count > 0 && (
                <div className="mb-3 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon
                            icon="mdi:alert-circle-outline"
                            className="w-4 h-4"
                        />
                        <span>
                            {event.pending_registrations_count} طلب جديد
                        </span>
                    </div>
                </div>
            )}

            <div className="space-y-2">

                <h4 className="text-xs font-bold text-gray-500 uppercase">
                    الطلبات الأخيرة
                </h4>

                {event.registrations && event.registrations.length > 0 ? (

                    event.registrations.map(reg => (

                        <div
                            key={reg.id}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm"
                        >

                            <span className="font-semibold text-gray-700">
                                {reg.user.name}
                            </span>

                            <div className="flex items-center gap-2">

                                {reg.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'admin.events.registrations.status',
                                                        [event.id, reg.id]
                                                    ),
                                                    { status: 'approved' }
                                                )
                                            }
                                            className="text-green-600 hover:bg-green-100 p-1 rounded"
                                        >
                                            <Icon
                                                icon="mdi:check"
                                                className="w-4 h-4"
                                            />
                                        </button>

                                        <button
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'admin.events.registrations.status',
                                                        [event.id, reg.id]
                                                    ),
                                                    { status: 'rejected' }
                                                )
                                            }
                                            className="text-red-600 hover:bg-red-100 p-1 rounded"
                                        >
                                            <Icon
                                                icon="mdi:close"
                                                className="w-4 h-4"
                                            />
                                        </button>
                                    </>
                                )}

                                {reg.status === 'approved' && (
                                    <span className="text-green-600 text-xs font-bold px-2">
                                        مقبول
                                    </span>
                                )}

                                {reg.status === 'rejected' && (
                                    <span className="text-red-600 text-xs font-bold px-2">
                                        مرفوض
                                    </span>
                                )}

                            </div>

                        </div>

                    ))

                ) : (

                    <p className="text-xs text-gray-400 text-center py-2">
                        لا توجد طلبات بعد.
                    </p>

                )}

            </div>

        </>
    ) : (

        /* ================= PLAYER VIEW ================= */

        (() => {

            const myRegistration = event.registrations?.find(
                reg => reg.user_id === auth.user.id
            );

            if (!myRegistration) return null;

            return (
                <div className="bg-gray-50 rounded-xl p-3">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">
                            <Icon
                                icon="mdi:account-check-outline"
                                className="w-5 h-5 text-primary"
                            />

                            <span className="text-sm font-bold text-gray-700">
                                أنت مسجل في هذه الفعالية
                            </span>
                        </div>

                        {myRegistration.status === 'pending' && (
                            <span className="text-amber-600 text-xs font-bold bg-amber-100 px-3 py-1 rounded-full">
                                قيد المراجعة
                            </span>
                        )}

                        {myRegistration.status === 'approved' && (
                            <span className="text-green-600 text-xs font-bold bg-green-100 px-3 py-1 rounded-full">
                                مقبول
                            </span>
                        )}

                        {myRegistration.status === 'rejected' && (
                            <span className="text-red-600 text-xs font-bold bg-red-100 px-3 py-1 rounded-full">
                                مرفوض
                            </span>
                        )}

                    </div>

                </div>
            );

        })()

    )}

</div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-full bg-white p-12 rounded-2xl text-center border border-gray-100">
                            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">لا توجد فعاليات مسجلة حالياً</p>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                    {isModalOpen && (can('events.create') || can('events.edit')) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editMode ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white shadow-sm p-2 rounded-full">
                                    <Icon icon="mdi:close" className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto">
                                {Object.keys(errors).length > 0 && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
                                        <p className="font-bold mb-2">يرجى إصلاح الأخطاء التالية:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.entries(errors).map(([key, error]) => (
                                                <li key={key}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-700 border-b pb-2">التفاصيل بالعربية</h4>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفعالية</label>
                                                <input type="text" className="form-input w-full rounded-xl border-gray-200" value={data.title_ar} onChange={e => setData('title_ar', e.target.value)} required />
                                                {errors.title_ar && <p className="text-red-500 text-xs mt-1">{errors.title_ar}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                                <textarea className="form-input w-full rounded-xl border-gray-200" rows="3" value={data.desc_ar} onChange={e => setData('desc_ar', e.target.value)} required></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">الجوائز</label>
                                                <input type="text" className="form-input w-full rounded-xl border-gray-200" value={data.prize_ar} onChange={e => setData('prize_ar', e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="space-y-4" dir="ltr">
                                            <h4 className="font-bold text-gray-700 border-b pb-2 text-right" dir="rtl">التفاصيل بالإنجليزية</h4>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right" dir="rtl">Event Name</label>
                                                <input type="text" className="form-input w-full rounded-xl border-gray-200" value={data.title_en} onChange={e => setData('title_en', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right" dir="rtl">Description</label>
                                                <textarea className="form-input w-full rounded-xl border-gray-200" rows="3" value={data.desc_en} onChange={e => setData('desc_en', e.target.value)} required></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right" dir="rtl">Prizes</label>
                                                <input type="text" className="form-input w-full rounded-xl border-gray-200" value={data.prize_en} onChange={e => setData('prize_en', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                                            <select className="form-input w-full rounded-xl border-gray-200 bg-[position:left_0.5rem_center] pl-8 pr-3" value={data.category} onChange={e => setData('category', e.target.value)}>
                                                <option value="Tournament">بطولة (Tournament)</option>
                                                <option value="Cup">كأس (Cup)</option>
                                                <option value="Event">حدث (Event)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                                            <select className="form-input w-full rounded-xl border-gray-200 bg-[position:left_0.5rem_center] pl-8 pr-3" value={data.level} onChange={e => setData('level', e.target.value)}>
                                                <option value="Open">مفتوح (Open)</option>
                                                <option value="Advanced">متقدم (Advanced)</option>
                                                <option value="Juniors">ناشئين (Juniors)</option>
                                                <option value="All Levels">جميع المستويات</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                                            <input type="date" min={!editMode ? new Date().toISOString().split('T')[0] : undefined} className="form-input w-full rounded-xl border-gray-200" value={data.date} onChange={e => setData('date', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                الوقت
                                            </label>

                                            <select
                                                className="form-input w-full rounded-xl border-gray-200 bg-[position:left_0.5rem_center] pl-8 pr-3"
                                                value={data.time}
                                                onChange={(e) => setData('time', e.target.value)}
                                                required
                                            >
                                                <option value="">-- اختر الوقت --</option>

                                                {Array.from({ length: 72 }).map((_, index) => {

                                                    // Start from 06:00
                                                    const totalMinutes = (6 * 60) + (index * 15);

                                                    const hour = String(
                                                        Math.floor(totalMinutes / 60)
                                                    ).padStart(2, '0');

                                                    const minute = String(
                                                        totalMinutes % 60
                                                    ).padStart(2, '0');

                                                    const time = `${hour}:${minute}`;

                                                    return (
                                                        <option
                                                            key={time}
                                                            value={time}
                                                        >
                                                            {time}
                                                        </option>
                                                    );
                                                })}
                                            </select>

                                            {errors.time && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.time}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">رسوم التسجيل (ل.س)</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="form-input w-full rounded-xl border-gray-200" 
                                                value={data.fee} 
                                                onFocus={e => e.target.select()}
                                                onChange={e => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 1 && val.startsWith('0')) {
                                                        val = val.replace(/^0+/, '');
                                                    }
                                                    setData('fee', val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">أقصى عدد مشتركين</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="form-input w-full rounded-xl border-gray-200" 
                                                value={data.max_participants} 
                                                onFocus={e => e.target.select()}
                                                onChange={e => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 1 && val.startsWith('0')) {
                                                        val = val.replace(/^0+/, '');
                                                    }
                                                    setData('max_participants', val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                                            <select className="form-input w-full rounded-xl border-gray-200 bg-[position:left_0.5rem_center] pl-8 pr-3" value={data.status} onChange={e => setData('status', e.target.value)}>
                                                <option value="upcoming">قادمة</option>
                                                <option value="ongoing">جارية</option>
                                                <option value="completed">مكتملة</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">اللون المميز</label>
                                            <select className="form-input w-full rounded-xl border-gray-200 bg-[position:left_0.5rem_center] pl-8 pr-3" value={data.color_class} onChange={e => setData('color_class', e.target.value)}>
                                                <option value="bg-primary text-white">الأخضر الأساسي</option>
                                                <option value="bg-accent text-primary">الأصفر الفوسفوري</option>
                                                <option value="bg-blue-500 text-white">أزرق</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 space-y-3">
                                        
                                        <label className="block text-sm font-medium text-gray-700">
                                            صورة الفعالية
                                        </label>

                                        {/* Image Preview */}
                                        {(data.image || (editMode && events.find(e => e.id === data.id)?.image_path)) && (
                                            <div className="flex justify-center">
                                                <div className="w-full max-w-md h-52 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                                    <img
                                                        src={
                                                            data.image
                                                                ? URL.createObjectURL(data.image)
                                                                : `/storage/${events.find(e => e.id === data.id)?.image_path}`
                                                        }
                                                        alt="Event Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Area */}
                                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary transition-colors bg-gray-50/50">
                                            
                                            <Icon
                                                icon="mdi:image-plus"
                                                className="w-14 h-14 mx-auto text-gray-300 mb-3"
                                            />

                                            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-bold cursor-pointer hover:bg-primary/20 transition-colors">
                                                <Icon icon="mdi:upload" className="w-5 h-5" />
                                                اختيار صورة

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => setData('image', e.target.files[0])}
                                                />
                                            </label>

                                            <p className="text-xs text-gray-500 mt-3">
                                                اختياري — يفضل استخدام صورة أفقية عالية الجودة
                                            </p>

                                            {data.image && (
                                                <p className="text-sm font-bold text-emerald-600 mt-2">
                                                    {data.image.name}
                                                </p>
                                            )}
                                        </div>

                                        {errors.image && (
                                            <p className="text-red-500 text-xs">
                                                {errors.image}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">
                                            إلغاء
                                        </button>
                                        <button type="submit" disabled={processing} className="btn-primary">
                                            {processing ? 'جاري الحفظ...' : 'حفظ الفعالية'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
