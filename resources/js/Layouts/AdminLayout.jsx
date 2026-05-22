import { Link, usePage } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState } from 'react';
import usePermissions from "@/hooks/usePermissions";

export default function AdminLayout({ header, children }) {
    const { auth, logo_url } = usePage().props;
    const user = auth.user;
    const { can } = usePermissions();
    console.log('User Permissions:', usePage().props.permissions);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const roles = usePage().props.roles || [];

    const menuItems = [

    {
        name: 'الرئيسية',
        icon: 'mdi:view-dashboard-outline',
        routeName: 'dashboard',
    },

    can('bookings.view') && {
        name: roles.includes('Coach') && !roles.includes('Admin') ? 'حجوزاتي كمدرب' : 'الحجوزات',
        icon: 'mdi:calendar-check-outline',
        routeName: 'admin.bookings',
    },

    can('events.view') && {
        name: 'الفعاليات',
        icon: 'mdi:trophy-outline',
        routeName: 'admin.events.index',
    },

    can('courts.view') && {
        name: 'الملاعب',
        icon: 'mdi:tennis',
        routeName: 'admin.courts.index',
    },

    can('coaches.view') && {
        name: 'المدربين',
        icon: 'mdi:whistle',
        routeName: 'admin.coaches.index',
    },

    can('players.view') && {
        name: 'اللاعبين',
        icon: 'mdi:account-group-outline',
        routeName: 'admin.players.index',
    },

    can('staff.view') && {
        name: 'الموظفين',
        icon: 'mdi:badge-account-horizontal-outline',
        routeName: 'admin.staff.index',
    },

    can('finance.view') && {
        name: 'المالية',
        icon: 'mdi:cash-multiple',
        routeName: 'admin.finances.index',
    },
    {

        name: 'المحفظة',
        icon: 'mdi:wallet-outline',
        routeName: 'wallet.index',
    }

].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 flex font-arabic text-gray-900" dir="rtl">
            
            {/* القائمة الجانبية (Sidebar) */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-[0_0_40px_rgba(0,0,0,0.03)] transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* الشعار */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-100">
                        <Link href={route('home')} className="flex items-center group">
                            <img src={logo_url || "/logo.png"} alt="Ace Padel Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
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
                                        ? 'bg-accent/10 text-primary font-bold border border-accent/50' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                    }`}
                                >
                                    <Icon icon={item.icon} className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* معلومات المستخدم وتسجيل الخروج */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                                <Icon icon="mdi:account" className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[120px]">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.roles?.[0] || 'مسؤول'}</p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
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
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* المحتوى الرئيسي (Main Content) */}
            <div className="flex-1 flex flex-col lg:mr-64 transition-all duration-300 w-full">
                {/* الشريط العلوي */}
                <header className="h-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:text-primary transition-colors"
                        >
                            <Icon icon="mdi:menu" className="w-6 h-6" />
                        </button>
                        {header && <div className="text-xl font-bold text-primary hidden sm:block">{header}</div>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors">
                            <Icon icon="mdi:bell-outline" className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* مساحة العرض */}
                <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>

        </div>
    );
}
