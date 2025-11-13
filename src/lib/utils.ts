import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format points value for display
 * @param points - The numeric value to format
 * @returns Formatted string with + for positive values, no sign for negative values
 */
export function formatPoints(points: number): string {
  return points >= 0 ? `+${points}` : `${points}`;
}
