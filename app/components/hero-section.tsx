"use client";

import { motion } from "framer-motion";
import { HiOutlineLibrary } from "react-icons/hi";

export function HeroSection() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] border border-white/5 pointer-events-none" />
            <div className="absolute top-1/3 left-1/3 w-[33%] h-[33%] border border-white/5 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center z-10 px-6"
            >
                <div className="flex justify-center mb-8">
                    <div className="p-4 bg-white/5 border border-border rounded-2xl">
                        <HiOutlineLibrary className="text-5xl text-accent animate-pulse" />
                    </div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground mb-4 uppercase">
                    Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">Void</span>
                </h1>
                <p className="text-foreground/40 text-sm md:text-base max-w-xl mx-auto font-light tracking-[0.3em] uppercase mb-12">
                    Conceptualizing the Future of Architecture with AI
                </p>

                <div className="flex flex-col items-center gap-6">
                    <div className="w-px h-24 bg-gradient-to-b from-accent to-transparent" />
                    <span className="text-[10px] text-accent/60 tracking-[0.5em] uppercase">Begin by describing your plan in the sidebar</span>
                </div>
            </motion.div>

            <div className="absolute top-10 left-10 text-[10px] text-foreground/20 font-mono space-y-1">
                <p>PROJECT: ARCH-ALPHA</p>
                <p>COORDINATES: 40.7128 N, 74.0060 W</p>
                <p>SCALE: 1:500</p>
            </div>

            <div className="absolute bottom-10 right-10 text-[10px] text-foreground/20 font-mono text-right space-y-1">
                <p>ENGINE: NEXUS-CORE</p>
                <p>STATUS: IDLE</p>
                <p>MEMORY: OPTIMIZED</p>
            </div>
        </div>
    );
}
