import { API_ENDPOINTS, APP_CONFIG } from "@constants/index";

const joinUrl = (base: string, path: string) =>
    base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");

/**
 * Safely build avatar URL.
 * - if value is full url -> return as-is
 * - if value starts with /uploads -> prefix serverBaseUrl
 * - otherwise treat value as filename and use API endpoint builder
 */
const buildAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return "";
    // full absolute URL
    if (/^https?:\/\//i.test(avatar)) return avatar;
    // already an absolute uploads path e.g. "/uploads/avatars/..."
    if (avatar.startsWith("/uploads")) {
        return joinUrl(APP_CONFIG.serverBaseUrl, avatar);
    }
    // otherwise assume it's a filename or relative path and use API helper
    // API_ENDPOINTS.UPLOADS.AVATARS(...) may return a path with leading slash
    return joinUrl(
        APP_CONFIG.serverBaseUrl,
        API_ENDPOINTS.UPLOADS.AVATARS(avatar)
    );
};

export default buildAvatarUrl;