import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" dir="rtl">
            <nav className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                        <span className="text-accent font-black text-sm">A</span>
                                    </div>
                                    <span className="font-bold text-lg text-primary font-arabic">آيس بادل | لوحة التحكم</span>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 space-x-reverse sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="font-arabic"
                                >
                                    لوحة التحكم
                                </NavLink>
                                <NavLink
                                    href={route('booking.index')}
                                    active={route().current('booking.index')}
                                    className="font-arabic"
                                >
                                    حجوزاتي
                                </NavLink>
                                <NavLink
                                    href={route('wallet.index')}
                                    active={route().current('wallet.index')}
                                    className="font-arabic"
                                >
                                    المحفظة الإلكترونية
                                </NavLink>
                                {/* رابط الإدارة - يظهر فقط للمدراء */}
                                {user.role === 'admin' && (
                                    <NavLink
                                        href={route('admin.bookings')}
                                        active={route().current('admin.bookings')}
                                        className="text-primary font-bold border-accent font-arabic"
                                    >
                                        إدارة الحجوزات
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none font-arabic"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="bg-white ring-1 ring-black ring-opacity-5">
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            className="text-gray-700 hover:bg-gray-100 hover:text-primary font-arabic"
                                        >
                                            الملف الشخصي
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-gray-700 hover:bg-red-50 hover:text-red-600 font-arabic"
                                        >
                                            تسجيل الخروج
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden border-t border-gray-200'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            className="font-arabic"
                        >
                            لوحة التحكم
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('booking.index')}
                            active={route().current('booking.index')}
                            className="font-arabic"
                        >
                            حجوزاتي
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('wallet.index')}
                            active={route().current('wallet.index')}
                            className="font-arabic"
                        >
                            المحفظة الإلكترونية
                        </ResponsiveNavLink>
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.bookings')}
                                active={route().current('admin.bookings')}
                                className="font-arabic"
                            >
                                إدارة الحجوزات
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 font-arabic">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500 font-arabic">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')} className="font-arabic">
                                الملف الشخصي
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="hover:text-red-600 font-arabic"
                            >
                                تسجيل الخروج
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-sm border-b border-gray-100">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-gray-900 font-arabic">
                        {header}
                    </div>
                </header>
            )}

            <main className="text-gray-900 font-arabic">{children}</main>
        </div>
    );
}
