/**
 * Ensure an image URL is safe to render.
 * Allows: http(s), blob:, and data:image/* (base64) only.
 */
export const isSafeImageSrc = (url?: string | null): boolean => {
    if (!url) return false;
    // blob: created by URL.createObjectURL(file)
    if (url.startsWith("blob:")) return true;
    // data:image/...;base64:...
    if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(url)) return true;

    try {
        const parsed = new URL(url, window.location.href);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}