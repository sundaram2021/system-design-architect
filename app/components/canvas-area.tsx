"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HeroSection } from "./hero-section";
import { LoadingState } from "./loading-state";
import { CanvasElement } from "./canvas-element";

interface CanvasAreaProps {
    state: 1 | 2 | 3;
}

export function CanvasArea({ state }: CanvasAreaProps) {
    return (
        <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
                {state === 1 && (
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6 }}
                        className="w-full h-full"
                    >
                        <HeroSection />
                    </motion.div>
                )}

                {state === 2 && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                    >
                        <LoadingState />
                    </motion.div>
                )}

                {state === 3 && (
                    <motion.div
                        key="canvas"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full h-full"
                    >
                        <CanvasElement />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
