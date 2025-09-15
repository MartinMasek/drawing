import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging and conditionally constructing (Tailwind) classes
 * for more details see https://youtu.be/re2JFITR7TI
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
