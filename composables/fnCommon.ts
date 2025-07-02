export function normalize(str: string): string {
    return str.toString().trim().replace(/\s+/g, ' ')
}

export function openWindow(url: string): void {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

export function parseNumber(value: string | number): number {
    return parseInt((value || '').toString().replace(/[^\d]/g, '')) || 0;
}
