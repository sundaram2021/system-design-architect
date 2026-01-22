"use client";

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export function ArchitectButton({ className, children, isLoading, icon, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "relative flex items-center justify-center p-3 bg-accent text-background rounded-lg hover:bg-accent/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group",
                className
            )}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
                <span className="text-xl group-hover:scale-110 transition-transform">
                    {icon || children}
                </span>
            )}

            <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-background/20 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-background/20 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-background/20 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-background/20 rounded-br-sm" />
        </button>
    );
}
