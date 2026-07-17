import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import usePermissions from "@/hooks/usePermissions";
import { resolveAsset } from '../../../utils';

export default function Index({ events, filters = {}, stats = {} }) {
    const { can } = usePermissions();
    const { auth } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const eventsData = events.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [level, setLevel] = useState(filters?.level || '');

    const applyFilters = (overrides = {}) => {
        const p = {
            search: overrides.hasOwnProperty('search') ? overrides.search : search,
            status: overrides.hasOwnProperty('status') ? overrides.status : status,
            category: overrides.hasOwnProperty('category') ? overrides.category : category,
            level: overrides.hasOwnProperty('level') ? overrides.level : level,
        };
        Object.keys(p).forEach(k => { if (p[k] === null || p[k] === undefined || p[k] === '') delete p[k]; });
        router.get(route('admin.events.index'), p, { 
            preserveState: true, 
            preserveScroll: true, 
            replace: true 
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setCategory('');
        setLevel('');
        router.get(route('admin.events.index'), {}, { 
            preserveState: true, 
            preserveScroll: true, 
            replace: true 
        });
    };

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

                time: dayjs(event.time).format('HH:mm'),

                fee: event.fee
                    ? String(parseInt(event.fee, 10))
                    : '',
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
            case 'upcoming': return 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm';
            case 'ongoing': return 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm';
            default: return 'bg-slate-50 text-slate-700 border-slate-100 shadow-sm';
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

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                            <Icon icon="mdi:trophy" className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900">
                                الفعاليات والبطولات
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">إدارة فعاليات النادي ومتابعة طلبات التسجيل</p>
                        </div>
                    </div>
                    {can('events.create') && (
                        <button 
                            onClick={handleCreate}
                            className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <Icon icon="mdi:plus" className="w-4 h-4" />
                            إضافة فعالية جديدة
                        </button>
                    )}
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                        {/* Search Input */}
                        <div className="lg:col-span-4 relative">
                            <Icon icon="mdi:magnify" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="بحث باسم الفعالية أو تفاصيلها..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all placeholder-slate-400"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="lg:col-span-2">
                            <select 
                                value={category}
                                onChange={e => {
                                    setCategory(e.target.value);
                                    applyFilters({ category: e.target.value });
                                }}
                                className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-2.5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8"
                            >
                                <option value="">كل التصنيفات</option>
                                <option value="Tournament">بطولة (Tournament)</option>
                                <option value="Cup">كأس (Cup)</option>
                                <option value="Event">حدث (Event)</option>
                            </select>
                        </div>

                        {/* Level Filter */}
                        <div className="lg:col-span-2">
                            <select 
                                value={level}
                                onChange={e => {
                                    setLevel(e.target.value);
                                    applyFilters({ level: e.target.value });
                                }}
                                className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-2.5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8"
                            >
                                <option value="">كل المستويات</option>
                                <option value="Open">مفتوح (Open)</option>
                                <option value="Advanced">متقدم (Advanced)</option>
                                <option value="Juniors">ناشئين (Juniors)</option>
                                <option value="All Levels">جميع المستويات</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="lg:col-span-2">
                            <select 
                                value={status}
                                onChange={e => {
                                    setStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-2.5 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8"
                            >
                                <option value="">كل الحالات</option>
                                <option value="upcoming">قادمة</option>
                                <option value="ongoing">جارية</option>
                                <option value="completed">مكتملة</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="lg:col-span-2 flex gap-2 w-full justify-end">
                            <button 
                                onClick={() => applyFilters()} 
                                className="flex-1 lg:flex-initial px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                            >
                                <Icon icon="mdi:magnify" className="w-4 h-4" />
                                بحث
                            </button>
                            {(search || category || level || status) && (
                                <button 
                                    onClick={resetFilters} 
                                    className="px-3 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/50 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                                    title="إعادة تعيين الفلاتر"
                                >
                                    <Icon icon="mdi:close" className="w-4 h-4" />
                                    مسح
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Events list */}
                <div className="space-y-6 flex flex-col">
                    {eventsData.map((event) => (
                        <div key={event.id} className="bg-white rounded-[2rem] border border-slate-200/50 hover:border-slate-350 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden flex flex-col md:flex-row transition-all duration-300 group">
                            {/* Color coding sidebar indicator strip */}
                            <div className={`w-1.5 flex-shrink-0 ${event.color_class.split(' ')[0]}`}></div>
                            
                            {/* Event Image or Placeholder */}
                            {event.image_path ? (
                                <div className="relative md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0 border-l border-slate-100/80">
                                    <img src={resolveAsset(`/storage/${event.image_path}`)} alt={event.title_ar} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                                </div>
                            ) : (
                                <div className="relative md:w-64 h-48 md:h-auto bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-300 border-l border-slate-100/80">
                                    <Icon icon="solar:gallery-bold-duotone" className="w-10 h-10 opacity-30" />
                                </div>
                            )}

                            {/* Event Details Content */}
                            <div className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1 space-y-2.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${getStatusStyle(event.status)}`}>
                                            {getStatusText(event.status)}
                                        </span>
                                        <span className="bg-slate-100 text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                                            {event.category}
                                        </span>
                                        {event.level && (
                                            <span className="bg-slate-50 text-slate-500 border border-slate-150 px-2 py-0.5 rounded-lg text-[9px] font-extrabold">
                                                {event.level === 'All Levels' ? 'جميع المستويات' : event.level}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-black text-base text-[#0F172A] tracking-tight">{event.title_ar}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed max-w-2xl">{event.desc_ar}</p>

                                    <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] font-extrabold text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Icon icon="mdi:calendar" className="text-slate-400 w-4 h-4" />
                                            <span className="font-sans">{dayjs(event.date).format('YYYY-MM-DD')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Icon icon="mdi:account-group" className="text-slate-400 w-4 h-4" />
                                            <span className="font-sans">{Number(event.registrations_count).toLocaleString('en-US')} / {event.max_participants ? Number(event.max_participants).toLocaleString('en-US') : '∞'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-lg text-slate-700">
                                            <Icon icon="mdi:cash" className="text-slate-400 w-4 h-4" />
                                            <span className="font-sans">{event.fee > 0 ? `${Number(event.fee).toLocaleString('en-US')} ل.س` : 'مجاني'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right actions & requests area */}
                                <div className="md:w-72 flex-shrink-0 flex flex-col justify-between items-end border-t md:border-t-0 md:border-r border-slate-100 pt-4 md:pt-0 md:pr-6">
                                    {/* Action button panel with muted action grey bg */}
                                    <div className="flex items-center bg-[#E2E8F0]/40 p-1 rounded-xl border border-slate-200/50 gap-0.5">
                                        <Link href={route('admin.events.show', event.id)} title="عرض" className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all cursor-pointer">
                                            <Icon icon="mdi:eye-outline" className="w-4.5 h-4.5" />
                                        </Link>
                                        {can('events.edit') && (
                                            <button onClick={() => handleEdit(event)} title="تعديل" className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all cursor-pointer">
                                                <Icon icon="mdi:pencil-outline" className="w-4.5 h-4.5" />
                                            </button>
                                        )}
                                        {can('events.delete') && (
                                            <button onClick={() => handleDelete(event.id)} title="حذف" className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white flex items-center justify-center transition-all cursor-pointer">
                                                <Icon icon="mdi:trash-can-outline" className="w-4.5 h-4.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Requests logic */}
                                    <div className="w-full mt-3 pt-3 border-t border-slate-100/50">
                                        {can('events.edit') ? (
                                            <>
                                                {event.pending_registrations_count > 0 && (
                                                    <div className="mb-2 bg-amber-50/60 border border-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-[10px] flex items-center justify-between font-bold shadow-sm">
                                                        <div className="flex items-center gap-1.5">
                                                            <Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5" />
                                                            <span>{event.pending_registrations_count} طلب جديد</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">الطلبات الأخيرة</span>
                                                    {event.registrations && event.registrations.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {event.registrations.slice(0, 2).map(reg => (
                                                                <div key={reg.id} className="flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 p-1.5 rounded-lg text-[10px] transition-colors duration-150">
                                                                    <span className="font-bold text-slate-600 truncate max-w-[120px]">{reg.user.name}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        {reg.status === 'pending' && (
                                                                            <>
                                                                                <button onClick={() => router.post(route('admin.events.registrations.status', [event.id, reg.id]), { status: 'approved' })} className="w-5 h-5 rounded-md bg-emerald-50 text-[#10B981] border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer">
                                                                                    <Icon icon="mdi:check" className="w-3 h-3" />
                                                                                </button>
                                                                                <button onClick={() => router.post(route('admin.events.registrations.status', [event.id, reg.id]), { status: 'rejected' })} className="w-5 h-5 rounded-md bg-rose-50 text-[#EF4444] border border-rose-100/50 flex items-center justify-center hover:bg-rose-100 transition-colors shadow-sm cursor-pointer">
                                                                                    <Icon icon="mdi:close" className="w-3 h-3" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        {reg.status === 'approved' && <span className="text-[#10B981] text-[8px] font-bold px-1.5 py-0.5 bg-emerald-50 border border-emerald-100/30 rounded">مقبول</span>}
                                                                        {reg.status === 'rejected' && <span className="text-[#EF4444] text-[8px] font-bold px-1.5 py-0.5 bg-rose-50 border border-rose-100/30 rounded">مرفوض</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[9px] text-slate-400 py-1">لا توجد طلبات تسجيل.</p>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            /* Player View status */
                                            (() => {
                                                const myRegistration = event.registrations?.find(reg => reg.user_id === auth.user.id);
                                                if (!myRegistration) return null;
                                                return (
                                                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 flex items-center justify-between text-[10px]">
                                                        <span className="font-extrabold text-slate-500">حالة تسجيلك:</span>
                                                        {myRegistration.status === 'pending' && <span className="text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">قيد المراجعة</span>}
                                                        {myRegistration.status === 'approved' && <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">مقبول</span>}
                                                        {myRegistration.status === 'rejected' && <span className="text-rose-700 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">مرفوض</span>}
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {eventsData.length === 0 && (
                        <div className="col-span-full bg-white p-12 rounded-[2rem] border border-slate-200/60 text-center shadow-[0_8px_30px_rgb(0,0,0,0.01)] py-16">
                            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-14 h-14 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-extrabold text-xs">
                                {(search || category || level || status) 
                                    ? 'لا توجد فعاليات مطابقة للبحث أو الفلاتر المحددة' 
                                    : 'لا توجد فعاليات رياضية مسجلة حالياً'}
                            </p>
                            {(search || category || level || status) && (
                                <button 
                                    onClick={resetFilters} 
                                    className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-extrabold text-xs rounded-full cursor-pointer transition-all inline-flex items-center gap-1.5"
                                >
                                    <Icon icon="mdi:refresh" className="w-4 h-4" />
                                    إعادة تعيين الفلاتر
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="bg-white px-6 py-4 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                        <p className="text-xs text-slate-500 font-extrabold">
                            عرض الفعاليات <b>{events.from}</b> إلى <b>{events.to}</b> من إجمالي <b>{events.total}</b> فعالية
                        </p>
                        <div className="flex gap-1.5 flex-wrap justify-center" dir="ltr">
                            {events.links.map((link, i) => (
                                <button 
                                    key={i}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true, replace: true })}
                                    disabled={!link.url || link.active}
                                    className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                        link.active 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                            : link.url  
                                                ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                : 'bg-white text-slate-300 border-slate-100 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Create/Edit Modal */}
                {isModalOpen && (can('events.create') || can('events.edit')) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300">
                        <div className="bg-white rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col max-h-[90vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-900/5 text-slate-800 flex items-center justify-center">
                                            <Icon icon={editMode ? "mdi:pencil-outline" : "mdi:plus-circle-outline"} className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-extrabold text-slate-900">
                                            {editMode ? 'تعديل بيانات الفعالية' : 'إضافة فعالية رياضية جديدة'}
                                        </h3>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-150 shadow-sm p-1.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer">
                                        <Icon icon="mdi:close" className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                                
                                <div className="p-6 overflow-y-auto">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="bg-rose-50/60 text-rose-700 p-4 rounded-2xl text-xs mb-6 border border-rose-100 font-bold">
                                            <p className="font-extrabold mb-1.5 flex items-center gap-1">
                                                <Icon icon="mdi:alert-circle-outline" className="w-4 h-4" />
                                                يرجى تصحيح الحقول التالية:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 pr-1">
                                                {Object.entries(errors).map(([key, error]) => (
                                                    <li key={key}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <form onSubmit={submit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 block">
                                                    التفاصيل باللغة العربية
                                                </span>
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-500 mb-1.5">اسم الفعالية</label>
                                                    <input type="text" className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all placeholder-slate-400 p-3" value={data.title_ar} onChange={e => setData('title_ar', e.target.value)} required />
                                                    {errors.title_ar && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.title_ar}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-500 mb-1.5">الوصف والتفاصيل</label>
                                                    <textarea className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all placeholder-slate-400 p-3" rows="3" value={data.desc_ar} onChange={e => setData('desc_ar', e.target.value)} required></textarea>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-500 mb-1.5">الجوائز المقررة</label>
                                                    <input type="text" className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all placeholder-slate-400 p-3" value={data.prize_ar} onChange={e => setData('prize_ar', e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="space-y-4" dir="ltr">
                                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-2 block text-right" dir="rtl">
                                                    ENGLISH DETAILS
                                                </span>
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-500 mb-1.5 text-right" dir="rtl">Event Title (EN)</label>
                                                    <input type="text" className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all placeholder-slate-400 p-3" value={data.title_en} onChange={e => setData('title_en', e.target.value)} required />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-500 mb-1.5 text-right" dir="rtl">Description (EN)</label>
                                                    <textarea className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all placeholder-slate-400 p-3" rows="3" value={data.desc_en} onChange={e => setData('desc_en', e.target.value)} required></textarea>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-500 mb-1.5 text-right" dir="rtl">Prizes (EN)</label>
                                                    <input type="text" className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all placeholder-slate-400 p-3" value={data.prize_en} onChange={e => setData('prize_en', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">التصنيف</label>
                                                <select className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8" value={data.category} onChange={e => setData('category', e.target.value)}>
                                                    <option value="Tournament">بطولة (Tournament)</option>
                                                    <option value="Cup">كأس (Cup)</option>
                                                    <option value="Event">حدث (Event)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">المستوى</label>
                                                <select className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8" value={data.level} onChange={e => setData('level', e.target.value)}>
                                                    <option value="Open">مفتوح (Open)</option>
                                                    <option value="Advanced">متقدم (Advanced)</option>
                                                    <option value="Juniors">ناشئين (Juniors)</option>
                                                    <option value="All Levels">جميع المستويات</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">التاريخ</label>
                                                <input type="date" min={!editMode ? new Date().toISOString().split('T')[0] : undefined} className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3" value={data.date} onChange={e => setData('date', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">
                                                    الوقت
                                                </label>

                                                <select
                                                    className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8"
                                                    value={data.time}
                                                    onChange={(e) => setData('time', e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- اختر الوقت --</option>

                                                    {Array.from({ length: 72 }).map((_, index) => {
                                                        const totalMinutes = (6 * 60) + (index * 15);
                                                        const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
                                                        const minute = String(totalMinutes % 60).padStart(2, '0');
                                                        const time = `${hour}:${minute}`;

                                                        return (
                                                            <option key={time} value={time}>
                                                                {time}
                                                            </option>
                                                        );
                                                    })}
                                                </select>

                                                {errors.time && (
                                                    <p className="text-rose-500 text-[10px] mt-1 font-bold">
                                                        {errors.time}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">رسوم التسجيل (ل.س)</label>
                                                <input 
                                                    type="text" 
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3" 
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
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">أقصى عدد لاعبين</label>
                                                <input 
                                                    type="text" 
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3" 
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
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">الحالة الحالية</label>
                                                <select className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8" value={data.status} onChange={e => setData('status', e.target.value)}>
                                                    <option value="upcoming">قادمة</option>
                                                    <option value="ongoing">جارية</option>
                                                    <option value="completed">مكتملة</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 mb-1.5">اللون التعريفي</label>
                                                <select className="w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-3 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.75rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8" value={data.color_class} onChange={e => setData('color_class', e.target.value)}>
                                                    <option value="bg-primary text-white">الأخضر الأساسي</option>
                                                    <option value="bg-accent text-primary">الأصفر الفوسفوري</option>
                                                    <option value="bg-blue-500 text-white">أزرق</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 space-y-4">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                                صورة الفعالية الرئيسية
                                            </span>

                                            {/* Image Preview */}
                                            {(data.image || (editMode && eventsData.find(e => e.id === data.id)?.image_path)) && (
                                                <div className="flex justify-center">
                                                    <div className="w-full max-w-md h-52 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                                                        <img
                                                            src={
                                                                data.image
                                                                    ? URL.createObjectURL(data.image)
                                                                    : resolveAsset(`/storage/${eventsData.find(e => e.id === data.id)?.image_path}`)
                                                            }
                                                            alt="Event Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Upload Area */}
                                            <div className="border-2 border-dashed border-slate-200/80 hover:border-slate-350 rounded-2xl p-6 text-center hover:bg-slate-50/30 transition-all duration-200 relative">
                                                <Icon
                                                    icon="solar:camera-add-bold-duotone"
                                                    className="w-10 h-10 mx-auto text-slate-300 mb-2.5"
                                                />

                                                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 text-slate-700 font-extrabold text-xs cursor-pointer transition-colors">
                                                    <Icon icon="mdi:upload" className="w-4 h-4" />
                                                    اختيار ملف الصورة

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={e => setData('image', e.target.files[0])}
                                                    />
                                                </label>

                                                <p className="text-[10px] text-slate-400 font-bold mt-2">
                                                    ينصح برفع صورة أفقية عالية الدقة وبصيغة PNG أو JPG
                                                </p>

                                                {data.image && (
                                                    <p className="text-xs font-extrabold text-emerald-600 mt-2 flex items-center justify-center gap-1">
                                                        <Icon icon="mdi:check-circle" className="w-4 h-4" />
                                                        {data.image.name}
                                                    </p>
                                                )}
                                            </div>

                                            {errors.image && (
                                                <p className="text-rose-500 text-[10px] font-bold">
                                                    {errors.image}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs hover:bg-slate-50 cursor-pointer transition-colors">
                                                إلغاء
                                            </button>
                                            <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                                                {processing ? 'جاري حفظ البيانات...' : 'حفظ الفعالية الرياضية'}
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
