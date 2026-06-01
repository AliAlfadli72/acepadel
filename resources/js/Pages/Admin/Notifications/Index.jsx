import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";

export default function NotificationsIndex({ notifications }) {
    const getNotificationTitle = (n) => {
        return n.data?.title_ar || n.data?.title || n.data?.title_en || 'إشعار جديد';
    };

    const getNotificationMessage = (n) => {
        return n.data?.message_ar || n.data?.message || n.data?.message_en || '';
    };

    const getIconDetails = (type) => {
        switch (type) {
            case 'booking':
            case 'pilates_booking':
            case 'booking_confirmed':
            case 'booking_pending':
            case 'booking_cancelled':
                return { icon: 'mdi:calendar-check-outline', color: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'wallet':
            case 'transaction':
            case 'deposit':
            case 'payment':
                return { icon: 'mdi:wallet-outline', color: 'text-green-600 bg-green-50 border-green-100' };
            case 'event':
                return { icon: 'mdi:trophy-outline', color: 'text-purple-600 bg-purple-50 border-purple-100' };
            default:
                return { icon: 'mdi:bell-ring-outline', color: 'text-slate-600 bg-slate-50 border-slate-100' };
        }
    };

    const getNotificationAction = (n) => {
        const data = n.data || {};
        if (data.booking_id) {
            return {
                label: 'مراجعة حجز البادل',
                url: route('admin.bookings'),
                icon: 'mdi:calendar-search'
            };
        }
        if (data.pilates_booking_id) {
            return {
                label: 'مراجعة حجز البيلاتس',
                url: route('admin.pilates.bookings.index'),
                icon: 'mdi:yoga'
            };
        }
        if (data.event_id) {
            return {
                label: 'عرض الفعالية',
                url: route('admin.events.index'),
                icon: 'mdi:trophy-outline'
            };
        }
        if (n.type?.includes('Wallet') || data.type === 'wallet' || data.type === 'transaction') {
            return {
                label: 'عرض حساب اللاعب',
                url: route('admin.players.index'),
                icon: 'mdi:wallet-outline'
            };
        }
        return null;
    };

    const getNotificationRowStyle = (n) => {
        const title = getNotificationTitle(n);
        const message = getNotificationMessage(n);
        const isPending = title.includes('قيد الانتظار') || title.includes('Pending') || message.includes('بانتظار');
        const isCancelled = title.includes('إلغاء') || title.includes('Cancelled') || title.includes('ملغى');
        
        if (isPending) {
            return {
                borderClass: 'border-r-4 border-r-amber-500 bg-amber-100 hover:bg-amber-200/70',
                badge: (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                        <Icon icon="mdi:clock-alert-outline" className="w-3 h-3 text-amber-700" />
                        <span>بانتظار الإجراء</span>
                    </span>
                )
            };
        }
        
        if (isCancelled) {
            return {
                borderClass: 'border-r-4 border-r-rose-500 bg-rose-100 hover:bg-rose-200/70',
                badge: (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-200 text-rose-900 border border-rose-300">
                        <Icon icon="mdi:cancel" className="w-3 h-3 text-rose-700" />
                        <span>ملغى</span>
                    </span>
                )
            };
        }

        const isConfirmed = title.includes('تأكيد') || title.includes('Confirmed') || title.includes('ناجح');
        if (isConfirmed) {
            return {
                borderClass: 'border-r-4 border-r-emerald-500 bg-emerald-100 hover:bg-emerald-200/70',
                badge: (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-300">
                        <Icon icon="mdi:check-circle-outline" className="w-3 h-3 text-emerald-700" />
                        <span>تم التأكيد</span>
                    </span>
                )
            };
        }

        return {
            borderClass: 'border-r-4 border-r-slate-200 bg-white hover:bg-slate-50',
            badge: null
        };
    };
    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('ar-EG-u-nu-latn', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <AdminLayout header="الإشعارات">
            <Head title="الإشعارات" />
            
            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">سجل الإشعارات</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                إدارة ومتابعة إشعارات الحجوزات، الدفعات، والنشاطات في النظام.
                            </p>
                        </div>

                    </div>

                    {/* Information Badge/Banner */}
                    <div className="bg-[#84CC16]/5 border border-[#84CC16]/20 rounded-2xl p-4 flex items-start gap-3">
                        <Icon icon="mdi:information-outline" className="w-5 h-5 text-[#84CC16] mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-700 leading-relaxed font-medium">
                            <span className="font-extrabold text-slate-900">تنويه:</span> يمثل الرقم الأحمر بجانب أيقونة الجرس بالأعلى عدد <span className="font-extrabold text-[#84CC16]">الحجوزات المعلقة</span> حالياً والتي بانتظار موافقتك. القائمة أدناه تعرض سجل الإشعارات المستلمة، ويمكنك النقر على زر المراجعة للانتقال الفوري إلى صفحة الطلب والموافقة عليه.
                        </div>
                    </div>

                    {/* Grid Layout for Notifications and Sidebar Guide */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        {/* Notifications List (Main Column) */}
                        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
                            {notifications.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
                                        <Icon icon="mdi:bell-off-outline" className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">لا توجد إشعارات حالياً</h3>
                                    <p className="text-slate-400 text-sm mt-1 max-w-sm">
                                        عند حدوث أي نشاط جديد في النظام (حجز، دفعة، إلخ)، سيظهر هنا مباشرة.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.data.map((notification) => {
                                        const style = getNotificationRowStyle(notification);
                                        const iconStyle = getIconDetails(notification.data?.type || notification.type);
                                        return (
                                            <div 
                                                key={notification.id} 
                                                className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${style.borderClass}`}
                                            >
                                                <div className="flex items-start gap-4 flex-1">
                                                    {/* Notification Icon */}
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconStyle.color}`}>
                                                        <Icon icon={iconStyle.icon} className="w-6 h-6" />
                                                    </div>

                                                    {/* Text Content */}
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-bold text-slate-900 text-base leading-tight">
                                                                {getNotificationTitle(notification)}
                                                            </h4>
                                                            {style.badge}
                                                        </div>
                                                        <p className="text-slate-600 text-sm leading-relaxed">
                                                            {getNotificationMessage(notification)}
                                                        </p>
                                                        
                                                        {/* User info & Time */}
                                                        <div className="flex items-center gap-4 pt-1.5 flex-wrap">
                                                            {notification.user && (
                                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                                    <Icon icon="mdi:account-outline" className="w-4 h-4 text-slate-400" />
                                                                    <span>المستخدم:</span>
                                                                    <span className="font-bold text-slate-700">{notification.user.name}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                                <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                                                                <span>{formatDate(notification.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                {getNotificationAction(notification) && (
                                                    <button
                                                        onClick={() => router.get(getNotificationAction(notification).url)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#84CC16]/10 text-slate-800 hover:bg-[#84CC16]/20 border border-[#84CC16]/20 rounded-xl font-bold text-xs transition-all duration-200"
                                                    >
                                                        <Icon icon={getNotificationAction(notification).icon} className="w-4 h-4 text-[#84CC16]" />
                                                        <span>{getNotificationAction(notification).label}</span>
                                                    </button>
                                                )}

                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {notifications.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                                    <p className="text-xs text-slate-400">
                                        عرض <b>{notifications.from}</b>–<b>{notifications.to}</b> من <b>{notifications.total}</b> إشعار
                                    </p>
                                    <div className="flex gap-1 flex-wrap justify-center">
                                        {notifications.links.map((link, i) => (
                                            <button key={i}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState:true, replace:true })}
                                                disabled={!link.url || link.active}
                                                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-bold border transition-colors ${
                                                    link.active ? 'bg-[#84CC16] text-white border-[#84CC16]'
                                                    : link.url  ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                                : 'bg-white text-slate-300 border-slate-100 cursor-not-allowed'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Legend Guide (Right Column) */}
                        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
                                <Icon icon="mdi:palette-outline" className="w-5 h-5 text-[#84CC16]" />
                                <span>دليل ألوان الحالات</span>
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="w-4 h-4 rounded-md bg-amber-500 border border-amber-600 flex-shrink-0 mt-0.5 shadow-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">طلب قيد الانتظار</p>
                                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">حجز بانتظار الموافقة أو الرفض من الإدارة</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-4 h-4 rounded-md bg-emerald-500 border border-emerald-600 flex-shrink-0 mt-0.5 shadow-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">طلب تم تأكيده</p>
                                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">حجز تم قبوله بنجاح في النظام</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-4 h-4 rounded-md bg-rose-500 border border-rose-600 flex-shrink-0 mt-0.5 shadow-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">طلب ملغى</p>
                                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">تم إلغاء الحجز من قبل العميل أو الإدارة</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-4 h-4 rounded-md bg-white border border-slate-300 flex-shrink-0 mt-0.5 shadow-sm" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">إشعارات عامة</p>
                                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">إشعارات النظام الأخرى كالدفعات والعمليات</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
