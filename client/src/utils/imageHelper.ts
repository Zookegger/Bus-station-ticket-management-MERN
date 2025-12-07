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

export default buildImgUrl;
