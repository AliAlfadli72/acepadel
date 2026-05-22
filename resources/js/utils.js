export const resolveAsset = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = route('home').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return base + cleanPath;
};
