import { useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import usePermissions from "@/hooks/usePermissions";
import { resolveAsset } from '../../../utils';
import 'dayjs/locale/en';

export default function Show({ event }) {
    const { can } = usePermissions();
    const { flash, errors } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'نجاح',
                text: flash.success,
                icon: 'success',
                confirmButtonText: 'حسناً',
                customClass: {
                    popup: 'rounded-3xl',
                    confirmButton: 'bg-slate-900 text-white px-6 py-2 rounded-xl font-bold font-arabic'
                }
            });
        }
        if (flash?.error || errors?.error) {
            Swal.fire({
                title: 'خطأ',
                text: flash?.error || errors?.error,
                icon: 'error',
                confirmButtonText: 'حسناً',
                customClass: {
                    popup: 'rounded-3xl',
                    confirmButton: 'bg-rose-600 text-white px-6 py-2 rounded-xl font-bold font-arabic'
                }
            });
        }
    }, [flash, errors]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-50 text-blue-750 border-blue-100 shadow-sm';
            case 'ongoing': return 'bg-[#84CC16]/10 text-[#84CC16] border-[#84CC16]/25 shadow-sm';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm';
            default: return 'bg-slate-50 text-slate-700 border-slate-100 shadow-sm';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'upcoming': return 'قادمة';
            case 'ongoing': return 'جارية';
            case 'completed': return 'مكتملة';
            default: return status;
        }
    };

    const handleUpdateStatus = (newStatus) => {
        if (!can('events.edit')) {
            return;
        }
        if (event.status === newStatus) return;
        
        Swal.fire({
            title: 'تأكيد تغيير الحالة',
            text: `هل أنت متأكد أنك تريد تغيير حالة الفعالية إلى ${getStatusText(newStatus)}؟`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، تغيير',
            cancelButtonText: 'إلغاء',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'bg-slate-900 text-white px-6 py-2 rounded-xl font-bold font-arabic',
                cancelButton: 'bg-slate-100 text-slate-700 px-6 py-2 rounded-xl font-bold font-arabic mx-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.events.status', event.id), { status: newStatus });
            }
        });
    };

    const handleUpdateRegistrationStatus = (registrationId, status) => {
        if (!can('events.edit')) {
            return;
        }
        Swal.fire({
            title: status === 'approved' ? 'تأكيد القبول' : 'تأكيد الرفض',
            text: `هل أنت متأكد من ${status === 'approved' ? 'قبول' : 'رفض'} هذا اللاعب؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: status === 'approved' ? '#10b981' : '#ef4444',
            confirmButtonText: 'نعم، تأكيد',
            cancelButtonText: 'تراجع',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: `text-white px-6 py-2 rounded-xl font-bold font-arabic`,
                cancelButton: 'bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold font-arabic mx-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.events.registrations.status', [event.id, registrationId]), { status });
            }
        });
    };

    const handleUpdatePlacement = (registrationId, placement) => {
        if (!can('events.edit')) {
            return;
        }

        if (event.status !== 'completed') {
            Swal.fire({
                title: 'عذراً',
                text: 'يجب أن تكتمل الفعالية أولاً قبل تحديد المراكز.',
                icon: 'info',
                confirmButtonText: 'حسناً',
                customClass: {
                    popup: 'rounded-3xl',
                    confirmButton: 'bg-slate-900 text-white px-8 py-3 rounded-xl font-bold font-arabic'
                }
            });
            return;
        }

        router.post(route('admin.events.registrations.placement', [event.id, registrationId]), { placement: placement || null }, { preserveScroll: true });
    };

    // Sort registrations: newest to oldest registration (created_at desc)
    const sortedRegistrations = [...(event.registrations || [])].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const approvedCount = sortedRegistrations.filter(r => r.status === 'approved').length;
    const totalRevenue = approvedCount * event.fee;
    const expectedRevenue = event.max_participants * event.fee;

    // Timeline Steps
    const steps = [
        { id: 'upcoming', label: 'الفعالية قادمة', icon: 'mdi:clock-outline' },
        { id: 'ongoing', label: 'جارية حالياً', icon: 'mdi:play-circle-outline' },
        { id: 'completed', label: 'مكتملة', icon: 'mdi:check-circle-outline' }
    ];

    const getProgressWidth = (status) => {
        if (status === 'upcoming') return '0%';
        if (status === 'ongoing') return '50%';
        if (status === 'completed') return '100%';
        return '0%';
    };

    return (
        <AdminLayout header="تفاصيل الفعالية">
            <Head title={`تفاصيل الفعالية - ${event.title_ar}`} />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <Link href={route('admin.events.index')} className="flex items-center text-slate-500 hover:text-slate-700 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs font-bold bg-white px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-md cursor-pointer">
                        <Icon icon="mdi:arrow-right" className="mr-1 w-4 h-4 ml-1.5" />
                        العودة لقائمة الفعاليات
                    </Link>
                </div>

                {/* Hero Banner */}
                <div className="relative w-full h-[280px] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60 bg-white group flex flex-col justify-end">
                    {event.image_path ? (
                        <div className="absolute inset-0">
                            <img 
                                src={resolveAsset(`/storage/${event.image_path}`)} 
                                alt={event.title_ar} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0">
                            {/* Cinematic sports photography themed gradient background setup */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950"></div>
                            {/* Premium subtle racket pattern outline or high quality styling */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#84CC16_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        </div>
                    )}
                    
                    {/* Content inside Banner */}
                    <div className="relative z-10 p-8 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 w-full">
                            <div className="text-white space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyle(event.status)}`}>
                                        {getStatusText(event.status)}
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                        {event.category}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">{event.title_ar}</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Right Column: Event Details & Players (Span 2) */}
                    <div className="xl:col-span-2 space-y-6">
                        
                        {/* Event Details Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60 relative overflow-hidden">
                            <h3 className="text-sm font-extrabold text-[#0F172A] mb-6 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 shadow-sm">
                                    <Icon icon="mdi:information-variant" className="w-5 h-5" />
                                </div>
                                تفاصيل الفعالية
                            </h3>
                            
                            <p className="text-slate-600 leading-relaxed text-xs bg-slate-50/60 p-5 rounded-2xl border border-slate-100/50 mb-6 font-bold">
                                {event.desc_ar}
                            </p>

                            {/* Metrics Dashboard Container (Embedded in single borderless white card with soft shadow) */}
                            <div className="bg-white rounded-3xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.02)] border-0 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x md:divide-x-reverse divide-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-blue-600 flex items-center justify-center border border-slate-100 flex-shrink-0">
                                        <Icon icon="mdi:calendar-blank" className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-extrabold uppercase mb-0.5">التاريخ</p>
                                        <p className="font-extrabold text-slate-800 text-xs font-sans tracking-tight">{dayjs(event.date).locale('en').format('DD')} {dayjs(event.date).locale('en').format('MM')} {dayjs(event.date).locale('en').format('YYYY')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:pr-6">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-[#84CC16] flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                                        <Icon icon="mdi:clock-outline" className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold mb-0.5">الوقت</p>
                                        <p className="font-extrabold text-slate-800 text-xs font-sans tracking-tight">{dayjs(event.time).locale('en').format('hh:mm A')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:pr-6">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-amber-500 flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                                        <Icon icon="mdi:cash" className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold mb-0.5">رسوم التسجيل</p>
                                        <p className="font-extrabold text-slate-800 text-xs font-sans tracking-tight">
                                            {event.fee > 0 ? (
                                                <>{Number(event.fee).toLocaleString('en-US')} <span className="text-[9px]">ل.س</span></>
                                            ) : (
                                                <span>مجاني</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:pr-6">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-purple-600 flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0">
                                        <Icon icon="mdi:account-group" className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-bold mb-0.5">المشاركون</p>
                                        <p className="font-extrabold text-slate-800 text-xs font-sans tracking-tight">
                                            <span>{Number(event.registrations?.length || 0).toLocaleString('en-US')} / {event.max_participants ? Number(event.max_participants).toLocaleString('en-US') : '∞'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Players Table Card */}
                        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50/30">
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2.5 mb-1">
                                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                                            <Icon icon="mdi:account-multiple-check" className="w-5 h-5" />
                                        </div>
                                        اللاعبون المسجلون
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 pr-1">إدارة طلبات التسجيل وتحديد المراكز للمشاركين</p>
                                </div>
                                <span className="bg-white px-4 py-2 rounded-xl text-xs font-extrabold text-slate-700 border border-slate-200/80 shadow-sm flex items-center gap-2">
                                    <Icon icon="mdi:account-group" className="w-4 h-4 text-slate-400" />
                                    المسجلين حالياً: <span className="font-sans font-black text-sm text-slate-900">{Number(event.registrations?.length || 0).toLocaleString('en-US')}</span>
                                </span>
                            </div>
                            
                            {sortedRegistrations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right whitespace-nowrap">
                                        <thead className="bg-slate-50/20 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">
                                            <tr>
                                                <th className="px-6 py-4">اللاعب</th>
                                                <th className="px-6 py-4">رقم الهاتف</th>
                                                <th className="px-6 py-4">حالة الطلب</th>
                                                <th className="px-6 py-4 text-center">تاريخ التسجيل</th>
                                                <th className="px-6 py-4 text-center">المركز النهائي</th>
                                                <th className="px-6 py-4 text-left">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {sortedRegistrations.map((reg) => (
                                                <tr key={reg.id} className="hover:bg-slate-50/40 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-extrabold text-sm border border-slate-200 group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all overflow-hidden shadow-sm">
                                                                {reg.user?.image_path ? (
                                                                    <img src={resolveAsset(`/storage/${reg.user.image_path}`)} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    reg.user?.name?.charAt(0) || <Icon icon="mdi:account" className="w-4 h-4" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-extrabold text-slate-955 text-xs mb-0.5">{reg.user?.name || 'مستفيد غير معروف'}</div>
                                                                <div className="text-[10px] text-slate-400 font-sans font-semibold tracking-tight">{reg.user?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-600 font-sans tracking-wide" dir="ltr">
                                                        {reg.user?.phone || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {reg.status === 'pending' && <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 w-fit shadow-sm"><Icon icon="mdi:clock-outline" className="w-3.5 h-3.5"/> قيد الانتظار</span>}
                                                        {reg.status === 'approved' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 w-fit shadow-sm"><Icon icon="mdi:check-circle" className="w-3.5 h-3.5"/> مقبول</span>}
                                                        {reg.status === 'rejected' && <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 w-fit shadow-sm"><Icon icon="mdi:close-circle" className="w-3.5 h-3.5"/> مرفوض</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 font-bold font-sans text-center">
                                                        {dayjs(reg.created_at).locale('en').format('YYYY-MM-DD')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {reg.status === 'approved' ? (
                                                            <div className="relative inline-block w-36">
                                                                <select
                                                                    disabled={!can('events.edit')}
                                                                    value={reg.placement || ''} 
                                                                    onChange={(e) => handleUpdatePlacement(reg.id, e.target.value)}
                                                                    className={`w-full rounded-xl border border-slate-200 focus:border-slate-400 bg-slate-50/50 text-xs font-bold text-slate-700 focus:bg-white focus:ring-0 focus:outline-none transition-all p-2 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%2522%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:left_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pl-8 ${event.status !== 'completed' ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                >
                                                                    <option value="">-- غير محدد --</option>
                                                                    <option value="1">1 - الأول</option>
                                                                    <option value="2">2 - الثاني</option>
                                                                    <option value="3">3 - الثالث</option>
                                                                    <option value="4">4 - الرابع</option>
                                                                    <option value="5">5 - الخامس</option>
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-355 font-bold">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-left">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {can('events.edit') && reg.status !== 'approved' && (            
                                                                <button 
                                                                    onClick={() => handleUpdateRegistrationStatus(reg.id, 'approved')}
                                                                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:scale-[1.02] active:scale-[0.98] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-emerald-150 shadow-sm flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    <Icon icon="mdi:check-bold" className="w-3.5 h-3.5" />
                                                                    قبول
                                                                </button>
                                                            )}
                                                            {can('events.edit') && reg.status !== 'rejected' && (
                                                                <button 
                                                                    onClick={() => handleUpdateRegistrationStatus(reg.id, 'rejected')}
                                                                    className="text-rose-700 bg-rose-50 hover:bg-rose-100 hover:scale-[1.02] active:scale-[0.98] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-rose-150 shadow-sm flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    <Icon icon="mdi:close-thick" className="w-3.5 h-3.5" />
                                                                    رفض
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-slate-50/10">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <Icon icon="mdi:account-off-outline" className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h4 className="text-sm font-extrabold text-slate-700 mb-1">لا توجد طلبات تسجيل حالياً</h4>
                                    <p className="text-slate-400 text-xs font-bold">لم يقم أي لاعب بالاشتراك في هذه البطولة أو الفعالية حتى الآن.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Left Column: Actions & Financials (Span 1) */}
                    <div className="space-y-6">
                        
                        {/* Status Controller (Timeline Stepper Redesigned) */}
                        {can('events.edit') && (
                            <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-200/60">
                                <h3 className="text-sm font-extrabold text-[#0F172A] mb-1 flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-105 shadow-sm">
                                        <Icon icon="mdi:cog-transfer" className="w-5 h-5" />
                                    </div>
                                    لوحة التحكم بالحالة
                                </h3>
                                <p className="text-[10px] text-slate-400 mb-8 font-bold pr-1">تحديث حالة الفعالية تفاعلياً.</p>
                                
                                <div className="relative flex justify-between items-center w-full px-2 py-4">
                                    {/* Timeline Background Line */}
                                    <div className="absolute left-6 right-6 top-8 h-0.5 bg-slate-100 rounded-full z-0"></div>
                                    
                                    {/* Active Progress Line */}
                                    <div 
                                        className="absolute right-6 top-8 h-0.5 bg-[#84CC16] rounded-full z-0 transition-all" 
                                        style={{ 
                                            width: getProgressWidth(event.status),
                                            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }}
                                    ></div>

                                    {/* Steps Map */}
                                    {steps.map((step) => {
                                        const isActive = event.status === step.id;
                                        return (
                                            <button
                                                key={step.id}
                                                onClick={() => handleUpdateStatus(step.id)}
                                                disabled={!can('events.edit')}
                                                title={step.label}
                                                className={`relative z-10 flex flex-col items-center gap-2 focus:outline-none transition-all duration-300 cursor-pointer ${!can('events.edit') ? 'cursor-not-allowed opacity-80' : ''}`}
                                            >
                                                <div 
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-550 ${
                                                        isActive 
                                                            ? 'border-[#84CC16] text-[#84CC16] shadow-[0_0_15px_rgba(132,204,22,0.4)] scale-110' 
                                                            : 'border-slate-200 text-slate-450 hover:border-slate-350 hover:text-slate-700'
                                                    }`}
                                                    style={{
                                                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                                    }}
                                                >
                                                    <Icon icon={step.icon} className="w-4.5 h-4.5" />
                                                </div>
                                                <span 
                                                    className={`text-[9px] font-extrabold transition-all duration-550 ${
                                                        isActive ? 'text-[#84CC16] font-black' : 'text-slate-400'
                                                    }`}
                                                    style={{
                                                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                                    }}
                                                >
                                                    {step.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Financial Analytics Redesigned (Deep Obsidian module) */}
                        <div className="bg-slate-950 p-6 rounded-[2rem] shadow-2xl border border-slate-900 relative overflow-hidden group">
                            {/* Glowing highlights */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#d6e02e]/10 rounded-full blur-[40px] pointer-events-none"></div>
                            
                            <h3 className="text-sm font-extrabold mb-6 flex items-center gap-2.5 relative z-10 text-white">
                                <div className="w-9 h-9 rounded-xl bg-white/5 text-[#d6e02e] flex items-center justify-center border border-white/10 backdrop-blur-md shadow-inner">
                                    <Icon icon="mdi:finance" className="w-5 h-5" />
                                </div>
                                الإحصاءات والمالية
                            </h3>

                            <div className="space-y-4 relative z-10">
                                
                                <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                                            <Icon icon="mdi:account-check" className="w-4 h-4 text-emerald-400" />
                                            اللاعبين المقبولين
                                        </p>
                                        <span className="text-[10px] text-slate-500 font-extrabold uppercase">السعة: {event.max_participants ? Number(event.max_participants).toLocaleString('en-US') : '∞'}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-white font-sans">{Number(approvedCount).toLocaleString('en-US')}</span>
                                        <span className="text-slate-500 text-xs font-bold">لاعب</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-1.5 mt-4 overflow-hidden border border-white/[0.05]">
                                        <div className="bg-gradient-to-r from-emerald-500 to-[#d6e02e] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (approvedCount / (event.max_participants || 1)) * 100)}%` }}></div>
                                    </div>
                                </div>

                                {can('finance.view') && (
                                    <div className="relative bg-gradient-to-br from-[#d6e02e] to-[#b8c21a] rounded-2xl p-4 shadow-lg shadow-[#d6e02e]/5 overflow-hidden">
                                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-lg"></div>
                                        <p className="text-slate-950 text-xs font-extrabold mb-1.5 flex items-center gap-1.5 relative z-10">
                                            <Icon icon="mdi:cash-multiple" className="w-4 h-4 text-slate-900" />
                                            العوائد الحالية المقبوضة
                                        </p>
                                        <p className="text-2xl font-black text-slate-955 tracking-tight font-sans relative z-10">
                                            {Number(totalRevenue).toLocaleString('en-US')} <span className="text-xs font-extrabold opacity-80">ل.س</span>
                                        </p>
                                    </div>
                                )}

                                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                                    <p className="text-slate-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                                        <Icon icon="mdi:target" className="w-4 h-4 text-slate-500" />
                                        العوائد الإجمالية المتوقعة
                                    </p>
                                    <p className="text-lg font-black text-slate-200 tracking-tight font-sans">
                                        {Number(expectedRevenue).toLocaleString('en-US')} <span className="text-[10px] font-bold text-slate-400">ل.س</span>
                                    </p>
                                </div>

                            </div>
                            
                        </div>

                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
