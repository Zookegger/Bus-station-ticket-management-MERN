import type { CHIP_COLORS } from "@constants/index";

export type ChipColor = typeof CHIP_COLORS[keyof typeof CHIP_COLORS];