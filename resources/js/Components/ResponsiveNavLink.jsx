import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-s-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-accent bg-accent/10 text-primary font-bold focus:border-accent focus:bg-accent/20'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-primary focus:border-gray-300 focus:bg-gray-50 focus:text-primary'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
