import { APP_CONFIG } from "@constants/index";

const joinUrl = (base: string, path: string) =>
    base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");

/**
 * Safely build image URL from uploads.
 * - if value is full url -> return as-is
 * - if value starts with /uploads -> prefix serverBaseUrl
 * - otherwise treat value as filename and append to uploads path with specified folder (default: 'avatars')
 */
const buildImgUrl = (path?: string | null, folder: string = "avatars") => {
    if (!path) return "";
    // full absolute URL
    if (/^https?:\/\//i.test(path)) return path;

    // already an absolute uploads path e.g. "/uploads/avatars/..."
    if (path.startsWith("/uploads")) {
        return joinUrl(APP_CONFIG.serverBaseUrl, path);
    }

    // otherwise assume it's a filename or relative path
    return joinUrl(
        APP_CONFIG.serverBaseUrl,
        `/uploads/${folder}/${path}`
    );
};

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
};

export default buildImgUrl;
