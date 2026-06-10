import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined): string {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}
