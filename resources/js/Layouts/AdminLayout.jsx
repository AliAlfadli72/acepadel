import { Link, usePage } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState, useEffect } from 'react';
import usePermissions from "@/hooks/usePermissions";
import { resolveAsset } from '../utils';


export default function AdminLayout({ header, children }) {
    const { auth, logo_url, pending_bookings } = usePage().props;
    const { flash } = usePage().props;
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [flashMessage, setFlashMessage] = useState(null);
    const [flashType, setFlashType] = useState('success');

    useEffect(() => {
        const message =
            flash?.success ||
            flash?.error ||
            flash?.warning ||
            flash?.info;

        if (message) {
            setFlashMessage(message);

            if (flash?.error) {
                setFlashType('error');
            } else if (flash?.warning) {
                setFlashType('warning');
            } else if (flash?.info) {
                setFlashType('info');
            } else {
                setFlashType('success');
            }

            const timeout = setTimeout(() => {
                setFlashMessage(null);
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [flash]);

    useEffect(() => {

        const handleOffline = () => {
            setIsOnline(false);
        };

        const handleOnline = () => {
            setIsOnline(true);

            setFlashType('success');
            setFlashMessage('تم استعادة الاتصال بالإنترنت');

            setTimeout(() => {
                setFlashMessage(null);
            }, 3000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };

    }, []);

    const user = auth.user;
    const { can } = usePermissions();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const roles = usePage().props.roles || [];
    const isPilatesCoachOnly = roles.includes('Pilates Coach') && !roles.includes('Admin') && !roles.includes('Manager') && !roles.includes('Receptionist') && !roles.includes('Pilates Admin');
    const isPilatesContext = (typeof window !== 'undefined' && window.location.pathname.includes('pilates')) || 
        ((roles.includes('Pilates Admin') || roles.includes('Pilates Coach')) && !roles.includes('Admin') && !roles.includes('Manager') && !roles.includes('Receptionist'));

    const pendingCount = (pending_bookings?.padel || 0) + (pending_bookings?.pilates || 0);

    const menuItems = [

    {
        name: 'الرئيسية',
        icon: 'mdi:view-dashboard-outline',
        routeName: 'dashboard',
    },

    !isPilatesCoachOnly && can('bookings.view') && {
        name: roles.includes('Coach') && !roles.includes('Admin') ? 'حجوزاتي كمدرب' : 'الحجوزات',
        icon: 'mdi:calendar-check-outline',
        routeName: 'admin.bookings',
    },

    !isPilatesCoachOnly && can('events.view') && {
        name: 'الفعاليات',
        icon: 'mdi:trophy-outline',
        routeName: 'admin.events.index',
    },

    !isPilatesCoachOnly && can('courts.view') && {
        name: 'الملاعب',
        icon: 'mdi:tennis',
        routeName: 'admin.courts.index',
    },

    !isPilatesCoachOnly && can('coaches.view') && {
        name: 'المدربين',
        icon: 'mdi:whistle',
        routeName: 'admin.coaches.index',
    },

    (roles.includes('Admin') || roles.includes('admin') || roles.includes('Pilates Admin') || roles.includes('Pilates Coach')) && {
        name: 'جلسات البيلاتس',
        icon: 'mdi:yoga',
        routeName: 'admin.pilates.index',
    },

    (roles.includes('Admin') || roles.includes('admin') || roles.includes('Pilates Admin') || roles.includes('Pilates Coach')) && {
        name: 'حجوزات البيلاتس',
        icon: 'mdi:calendar-multiselect',
        routeName: 'admin.pilates.bookings.index',
    },

    (roles.includes('Admin') || roles.includes('admin') || roles.includes('Pilates Admin')) && {
        name: 'باقات البيلاتس',
        icon: 'mdi:ticket-percent-outline',
        routeName: 'admin.pilates.packages.index',
    },

    !isPilatesCoachOnly && can('players.view') && {
        name: 'اللاعبين',
        icon: 'mdi:account-group-outline',
        routeName: 'admin.players.index',
    },

    !isPilatesCoachOnly && can('staff.view') && {
        name: 'الموظفين',
        icon: 'mdi:badge-account-horizontal-outline',
        routeName: 'admin.staff.index',
    },

    !isPilatesCoachOnly && can('finance.view') && {
        name: 'المالية',
        icon: 'mdi:cash-multiple',
        routeName: 'admin.finances.index',
    },
    !isPilatesCoachOnly && {

        name: 'المحفظة',
        icon: 'mdi:wallet-outline',
        routeName: 'wallet.index',
    }

].filter(Boolean);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-arabic text-[#0F172A]" dir="rtl">
            
            {/* القائمة الجانبية (Sidebar) */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200/80 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* الشعار */}
                    <div className="h-20 flex items-center px-6 border-b border-slate-100">
                        <Link href={route('home')} className="flex items-center gap-2 group">
                            {isPilatesContext ? (
                                <img src={resolveAsset('/pilates-logo.png')} alt="The Reformer Room" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
                            ) : (
                                <img src={logo_url || resolveAsset('/logo.png')} alt="Ace Padel Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
                            )}
                        </Link>
                    </div>

                    {/* الروابط */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        {menuItems.map((item, index) => {
                            let isActive = false;
                            try { isActive = route().current(item.routeName); } catch(e) {}

                            return (
                                <Link
                                    key={index}
                                    href={route(item.routeName)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive 
                                        ? 'bg-[#84CC16]/10 text-slate-900 font-extrabold border border-[#84CC16]/20' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon icon={item.icon} className={`w-5 h-5 ${isActive ? 'text-[#84CC16]' : ''}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* معلومات المستخدم وتسجيل الخروج */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-100">
                                <Icon icon="mdi:account" className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[120px] text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user.roles?.[0] || 'مسؤول'}</p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            <Icon icon="mdi:logout" className="w-5 h-5" />
                            <span>تسجيل الخروج</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* خلفية تظليل للموبايل */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* المحتوى الرئيسي (Main Content) */}
            <div className="flex-1 flex flex-col lg:mr-64 transition-all duration-300 w-full">
                {/* الشريط العلوي */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            <Icon icon="mdi:menu" className="w-6 h-6" />
                        </button>
                        {header && <div className="text-xl font-extrabold text-slate-900 hidden sm:block">{header}</div>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('admin.notifications.index')}
                            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
                            title="الإشعارات"
                        >
                            <Icon icon="mdi:bell-outline" className="w-5 h-5" />
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -left-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-sm">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </header>
{!isOnline && (
    <div
        className="
            fixed bottom-6 right-6
            z-[10000]
            min-w-[320px]
            max-w-md
            rounded-2xl
            border
            border-red-200
            bg-red-50
            text-red-700
            shadow-xl
            backdrop-blur-sm
            px-5
            py-4
        "
    >
        <div className="flex items-start gap-3">

            <div className="mt-0.5">
                <Icon
                    icon="mdi:wifi-off"
                    className="w-6 h-6"
                />
            </div>

            <div className="flex-1">
                <p className="font-bold">
                    لا يوجد اتصال بالإنترنت
                </p>

                <p className="text-sm mt-1">
                    بعض العمليات قد لا تعمل بشكل صحيح حتى يتم استعادة الاتصال.
                </p>
            </div>

        </div>
    </div>
)}

                {/* مساحة العرض */}
                <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
            {flashMessage && (
            <div
                className={`fixed bottom-6 right-6 z-[9999] min-w-[320px] max-w-md rounded-2xl border shadow-xl backdrop-blur-sm px-5 py-4 transition-all duration-500 ${
                    flashType === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : flashType === 'warning'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        : flashType === 'info'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-green-50 border-green-200 text-green-700'
                }`}
            >
                <div className="flex items-start gap-3">

                    <div className="mt-0.5">
                        <Icon
                            icon={
                                flashType === 'error'
                                    ? 'mdi:close-circle'
                                    : flashType === 'warning'
                                    ? 'mdi:alert'
                                    : flashType === 'info'
                                    ? 'mdi:information'
                                    : 'mdi:check-circle'
                            }
                            className="w-6 h-6"
                        />
                    </div>

                    <div className="flex-1">
                        <p className="font-bold">
                            {flashType === 'error'
                                ? 'خطأ'
                                : flashType === 'warning'
                                ? 'تنبيه'
                                : flashType === 'info'
                                ? 'معلومة'
                                : 'تم بنجاح'}
                        </p>

                        <p className="text-sm mt-1">
                            {flashMessage}
                        </p>
                    </div>

                    <button
                        onClick={() => setFlashMessage(null)}
                        className="opacity-60 hover:opacity-100"
                    >
                        <Icon icon="mdi:close" className="w-5 h-5" />
                    </button>

                </div>
            </div>
)}

        </div>
    );
}
