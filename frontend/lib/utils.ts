import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function parseCSVDate(dateStr: string): Date {
  // Basic parsing, assuming YYYY-MM-DD or similar standard formats
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}
