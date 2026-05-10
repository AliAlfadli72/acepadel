import { usePage } from "@inertiajs/react";

export default function usePermissions() {

    const props = usePage().props;

    const permissions = props.permissions || [];
    const roles = props.roles || [];

    const can = (permission) => {
        return permissions.includes(permission);
    };

    const hasRole = (role) => {
        return roles.includes(role);
    };

    return {
        can,
        hasRole,
        permissions,
        roles,
    };
}