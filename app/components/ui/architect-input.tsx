"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function ArchitectInput({ className, ...props }: InputProps) {
    return (
        <div className="relative group">
            <input
                className={cn(
                    "w-full bg-black/40 border border-border text-foreground px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-all duration-300 rounded-lg placeholder:text-foreground/20",
                    className
                )}
                {...props}
            />
            <div className="absolute inset-0 border border-accent/0 pointer-events-none group-focus-within:border-accent/20 rounded-lg transition-all duration-500" />
        </div>
    );
}
