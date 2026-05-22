import { usePage } from '@inertiajs/react';

export default function ApplicationLogo(props) {
    const { icon_url } = usePage().props;
    return (
        <img
            {...props}
            src={icon_url || "/icon.png"}
            alt="Ace Padel Logo"
            className={`${props.className || ''} object-contain`}
        />
    );
}
