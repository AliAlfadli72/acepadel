import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

export default function Show({ event }) {
    
    const getStatusStyle = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-600 text-white border-blue-500';
            case 'ongoing': return 'bg-emerald-600 text-white border-emerald-500';
            case 'completed': return 'bg-[#cbfb45] text-gray-900 border-[#b5e03e]';
            default: return 'bg-gray-600 text-white border-gray-500';
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
                confirmButton: 'bg-primary text-gray-900 px-6 py-2 rounded-xl font-bold font-arabic',
                cancelButton: 'bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold font-arabic mx-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.events.status', event.id), { status: newStatus });
            }
        });
    };

    const handleUpdateRegistrationStatus = (registrationId, status) => {
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
        if (event.status !== 'completed') {
            Swal.fire({
                title: 'عذراً',
                text: 'يجب أن تكتمل الفعالية أولاً قبل تحديد المراكز.',
                icon: 'info',
                confirmButtonText: 'حسناً',
                customClass: {
                    popup: 'rounded-3xl',
                    confirmButton: 'bg-primary text-gray-900 px-8 py-3 rounded-xl font-bold font-arabic'
                }
            });
            return;
        }

        router.post(route('admin.events.registrations.placement', [event.id, registrationId]), { placement: placement || null }, { preserveScroll: true });
    };

    // Sort registrations: approved first, then pending, then rejected
    const sortedRegistrations = [...(event.registrations || [])].sort((a, b) => {
        const order = { approved: 1, pending: 2, rejected: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        if (a.status === 'approved' && b.status === 'approved') {
            if (a.placement && !b.placement) return -1;
            if (!a.placement && b.placement) return 1;
            if (a.placement && b.placement) return a.placement - b.placement;
        }
        return 0;
    });

    const approvedCount = sortedRegistrations.filter(r => r.status === 'approved').length;
    const totalRevenue = approvedCount * event.fee;
    const expectedRevenue = event.max_participants * event.fee;

    return (
        <AdminLayout header="تفاصيل الفعالية">
            <Head title={`تفاصيل الفعالية - ${event.title_ar}`} />

            <div className="max-w-7xl mx-auto space-y-8 font-arabic pb-12">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <Link href={route('admin.events.index')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-bold bg-white px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md">
                        <Icon icon="mdi:arrow-right" className="mr-1 w-5 h-5 ml-1" />
                        العودة للفعاليات
                    </Link>
                </div>

                {/* Hero Banner */}
                <div className="relative w-full h-[350px] rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-200 bg-white group flex flex-col justify-end">
                    {event.image_path ? (
                        <div className="absolute inset-0">
                            <img 
                                src={`/storage/${event.image_path}`} 
                                alt={event.title_ar} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                            {/* Improved Gradient Overlay for better readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent mix-blend-multiply"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center text-gray-400">
                            <Icon icon="mdi:image-outline" className="w-24 h-24 opacity-50" />
                        </div>
                    )}
                    
                    {/* Content inside Banner */}
                    <div className="relative z-10 p-8 md:p-10 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 w-full">
                            <div className="text-white space-y-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-5 py-2 rounded-full text-xs font-black shadow-lg ${getStatusStyle(event.status)}`}>
                                        {getStatusText(event.status)}
                                    </span>
                                    <span className="bg-white text-gray-900 px-5 py-2 rounded-full text-xs font-black shadow-lg uppercase tracking-wider">
                                        {event.category}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg">{event.title_ar}</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Right Column: Event Details & Players (Span 2) */}
                    <div className="xl:col-span-2 space-y-8">
                        
                        {/* Event Details Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#cbfb45]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Icon icon="mdi:information-variant" className="w-7 h-7" />
                                </div>
                                تفاصيل الفعالية
                            </h3>
                            
                            <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 font-bold">
                                {event.desc_ar}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-2 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm border border-gray-100">
                                        <Icon icon="mdi:calendar-blank" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold mb-1">التاريخ</p>
                                        <p className="font-black text-gray-900 tracking-tight font-arabic">{dayjs(event.date).locale('en').format('DD')} {dayjs(event.date).locale('en').format('MM')} {dayjs(event.date).locale('en').format('YYYY')}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-gray-100">
                                        <Icon icon="mdi:clock-outline" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold mb-1">الوقت</p>
                                        <p className="font-black text-gray-900 font-arabic tracking-tight">{dayjs(event.time).locale('en').format('hh:mm A')}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-amber-200 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white text-amber-500 flex items-center justify-center shadow-sm border border-gray-100">
                                        <Icon icon="mdi:cash" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold mb-1">رسوم التسجيل</p>
                                        <p className="font-black text-gray-900 tracking-tight text-lg font-arabic">
                                            {event.fee > 0 ? (
                                                <>{Number(event.fee).toLocaleString('en-US')} <span className="text-xs">ل.س</span></>
                                            ) : (
                                                <span>مجاني</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-sm border border-gray-100">
                                        <Icon icon="mdi:account-group" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold mb-1">المسجلون</p>
                                        <p className="font-black text-gray-900 tracking-tight text-lg font-arabic">
                                            <span>{Number(event.registrations?.length || 0).toLocaleString('en-US')} / {event.max_participants ? Number(event.max_participants).toLocaleString('en-US') : '∞'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Players Table Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-900/20">
                                            <Icon icon="mdi:account-multiple-check" className="w-6 h-6" />
                                        </div>
                                        اللاعبون المسجلون
                                    </h3>
                                    <p className="text-sm font-bold text-gray-500">إدارة طلبات التسجيل وتحديد المراكز</p>
                                </div>
                                <span className="bg-white px-6 py-3 rounded-xl text-sm font-black text-gray-900 border border-gray-200 shadow-sm flex items-center gap-2">
                                    <Icon icon="mdi:account-group" className="w-5 h-5 text-gray-400" />
                                    الإجمالي: <span className="font-arabic font-black text-lg">{Number(event.registrations?.length || 0).toLocaleString('en-US')}</span>
                                </span>
                            </div>
                            
                            {sortedRegistrations.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right whitespace-nowrap">
                                        <thead className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-black">
                                            <tr>
                                                <th className="px-8 py-5">اللاعب</th>
                                                <th className="px-6 py-5">رقم الهاتف</th>
                                                <th className="px-6 py-5">حالة الطلب</th>
                                                <th className="px-6 py-5 text-center">تاريخ التسجيل</th>
                                                <th className="px-6 py-5 text-center">المركز</th>
                                                <th className="px-8 py-5 text-left">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {sortedRegistrations.map((reg) => (
                                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center font-black text-lg border border-gray-200 group-hover:bg-[#cbfb45] group-hover:border-[#cbfb45] group-hover:text-gray-900 transition-all shadow-sm overflow-hidden">
                                                                {reg.user?.image_path ? (
                                                                    <img src={`/storage/${reg.user.image_path}`} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    reg.user?.name?.charAt(0) || <Icon icon="mdi:account" className="w-6 h-6" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-gray-900 text-sm mb-0.5">{reg.user?.name || 'مستخدم غير معروف'}</div>
                                                                <div className="text-xs text-gray-500 font-sans font-bold tracking-tight">{reg.user?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-black text-gray-700 font-sans tracking-wider" dir="ltr">
                                                        {reg.user?.phone || '-'}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {reg.status === 'pending' && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 w-max shadow-sm"><Icon icon="mdi:clock-outline" className="w-4 h-4"/> قيد الانتظار</span>}
                                                        {reg.status === 'approved' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 w-max shadow-sm"><Icon icon="mdi:check-circle" className="w-4 h-4"/> مقبول</span>}
                                                        {reg.status === 'rejected' && <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 w-max shadow-sm"><Icon icon="mdi:close-circle" className="w-4 h-4"/> مرفوض</span>}
                                                    </td>
                                                    <td className="px-6 py-5 text-sm text-gray-600 font-bold font-arabic text-center">
                                                        {dayjs(reg.created_at).locale('en').format('DD')} {dayjs(reg.created_at).locale('en').format('MM')} {dayjs(reg.created_at).locale('en').format('YYYY')}
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        {reg.status === 'approved' ? (
                                                            <div className="relative inline-block w-40">
                                                                <select 
                                                                    value={reg.placement || ''} 
                                                                    onChange={(e) => handleUpdatePlacement(reg.id, e.target.value)}
                                                                    className={`bg-white border-2 text-gray-900 text-sm font-black rounded-xl focus:ring-[#cbfb45] focus:border-[#cbfb45] block w-full p-2.5 shadow-sm pr-8 appearance-none transition-all hover:border-gray-300 ${event.status !== 'completed' ? 'border-gray-100 cursor-pointer' : 'border-gray-200'}`}
                                                                >
                                                                    <option value="">-- غير محدد --</option>
                                                                    <option value="1">1 - الأول</option>
                                                                    <option value="2">2 - الثاني</option>
                                                                    <option value="3">3 - الثالث</option>
                                                                    <option value="4">4 - الرابع</option>
                                                                    <option value="5">5 - الخامس</option>
                                                                </select>
                                                                <Icon icon="mdi:chevron-down" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 font-bold">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5 text-left">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {reg.status !== 'approved' && (
                                                                <button 
                                                                    onClick={() => handleUpdateRegistrationStatus(reg.id, 'approved')}
                                                                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-black transition-colors border border-emerald-200 shadow-sm flex items-center gap-1"
                                                                >
                                                                    <Icon icon="mdi:check-bold" className="w-4 h-4" />
                                                                    قبول
                                                                </button>
                                                            )}
                                                            {reg.status !== 'rejected' && (
                                                                <button 
                                                                    onClick={() => handleUpdateRegistrationStatus(reg.id, 'rejected')}
                                                                    className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-black transition-colors border border-rose-200 shadow-sm flex items-center gap-1"
                                                                >
                                                                    <Icon icon="mdi:close-thick" className="w-4 h-4" />
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
                                <div className="p-16 text-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
                                        <Icon icon="mdi:account-off-outline" className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h4 className="text-xl font-black text-gray-800 mb-2">لا يوجد تسجيلات بعد</h4>
                                    <p className="text-gray-500 text-sm font-bold">لم يقم أي لاعب بالتسجيل في هذه الفعالية حتى الآن.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Left Column: Actions & Financials (Span 1) */}
                    <div className="space-y-8">
                        
                        {/* Status Controller */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center border border-gray-200 shadow-sm">
                                    <Icon icon="mdi:cog-transfer" className="w-7 h-7" />
                                </div>
                                لوحة التحكم بالحالة
                            </h3>
                            <p className="text-sm text-gray-500 mb-8 font-bold">قم بتحديث حالة الفعالية. لا يمكن تحديد المراكز إلا بعد تحويل الفعالية إلى "مكتملة".</p>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => handleUpdateStatus('upcoming')}
                                    className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border-2 ${event.status === 'upcoming' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/30' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'}`}
                                >
                                    <Icon icon="mdi:clock-outline" className="w-6 h-6" /> الفعالية قادمة
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus('ongoing')}
                                    className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border-2 ${event.status === 'ongoing' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-500/30' : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                >
                                    <Icon icon="mdi:play-circle-outline" className="w-6 h-6" /> جارية حالياً
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus('completed')}
                                    className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border-2 ${event.status === 'completed' ? 'bg-gray-900 text-[#cbfb45] border-gray-900 shadow-xl shadow-gray-900/30' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <Icon icon="mdi:check-circle-outline" className="w-6 h-6" /> مكتملة
                                </button>
                            </div>
                        </div>

                        {/* Financial Analytics Redesigned */}
                        <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl border border-gray-800 relative overflow-hidden group">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 left-0 w-48 h-48 bg-[#cbfb45]/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2 group-hover:bg-[#cbfb45]/20 transition-colors duration-700 pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 group-hover:bg-emerald-500/20 transition-colors duration-700 pointer-events-none"></div>
                            
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10 text-white">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#cbfb45] flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner">
                                    <Icon icon="mdi:finance" className="w-7 h-7" />
                                </div>
                                قسم المالية والإحصاءات
                            </h3>

                            <div className="space-y-6 relative z-10">
                                
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-gray-300 text-sm font-bold flex items-center gap-2">
                                            <Icon icon="mdi:account-check" className="w-5 h-5 text-emerald-400" />
                                            اللاعبون المقبولون
                                        </p>
                                        <div className="bg-white/10 px-3 py-1 rounded-lg">
                                            <span className="text-gray-400 text-xs font-bold">السعة {event.max_participants ? Number(event.max_participants).toLocaleString('en-US') : '∞'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-white font-arabic drop-shadow-md">{Number(approvedCount).toLocaleString('en-US')}</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 mt-5 overflow-hidden border border-gray-700/50">
                                        <div className="bg-gradient-to-r from-emerald-500 to-[#cbfb45] h-2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(203,251,69,0.5)]" style={{ width: `${Math.min(100, (approvedCount / (event.max_participants || 1)) * 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className="relative bg-gradient-to-br from-[#cbfb45] to-[#a3d132] rounded-3xl p-6 shadow-xl shadow-[#cbfb45]/20 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                                    <p className="text-gray-800 text-sm font-black mb-2 flex items-center gap-2 relative z-10">
                                        <Icon icon="mdi:cash-multiple" className="w-5 h-5 text-gray-900" />
                                        العوائد الحالية (للمقبولين)
                                    </p>
                                    <p className="text-4xl font-black text-gray-900 tracking-tight font-arabic relative z-10 drop-shadow-sm">
                                        {Number(totalRevenue).toLocaleString('en-US')} <span className="text-sm font-bold opacity-80">ل.س</span>
                                    </p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                                    <p className="text-gray-400 text-sm font-bold mb-2 flex items-center gap-2">
                                        <Icon icon="mdi:target" className="w-5 h-5 text-gray-500" />
                                        العوائد المتوقعة (اكتمال العدد)
                                    </p>
                                    <p className="text-2xl font-black text-gray-300 tracking-tight font-arabic">
                                        {Number(expectedRevenue).toLocaleString('en-US')} <span className="text-xs font-bold">ل.س</span>
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
