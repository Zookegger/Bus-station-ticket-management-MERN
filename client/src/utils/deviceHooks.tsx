import { useMediaQuery, useTheme } from "@mui/material";

/**
 * A custom React hook to detect the current device type based on Material-UI breakpoints.
 *
 * @returns An object containing boolean flags for device types:
 * - `isMobile`: True if the screen width is below the 'sm' breakpoint (typically <600px, e.g., mobile devices).
 * - `isTablet`: True if the screen width is between 'sm' and 'md' breakpoints (typically 600px–900px, e.g., tablets).
 * - `isDesktop`: True if the screen width is at or above the 'md' breakpoint (typically ≥900px, e.g., desktops).
 *
 * @example
 * ```tsx
 * import { useDeviceType } from './hooks/useDeviceType';
 *
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop } = useDeviceType();
 *
 *   return (
 *     <div>
 *       {isMobile && <p>This is mobile!</p>}
 *       {isDesktop && <p>This is desktop!</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Relies on the Material-UI theme's default breakpoints. Customize your theme if needed.
 * - Updates dynamically on window resize.
 * - Ensure your app is wrapped in `<ThemeProvider>` for `useTheme` to work.
 */
export const useDeviceType = (): {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
} => {
	const theme = useTheme();

	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
	const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

	return { isMobile, isTablet, isDesktop };
};
