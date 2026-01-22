"use client";

import { motion } from "framer-motion";
import { VscGear } from "react-icons/vsc";
import { FaDatabase, FaServer, FaCloud, FaReact } from "react-icons/fa";

const architectureLabels = [
    "ANALYZING_COMPONENTS",
    "CALCULATING_POSITIONS",
    "MAPPING_CONNECTIONS",
    "GENERATING_LAYOUT",
    "OPTIMIZING_FLOW"
];

const floatingIcons = [
    { Icon: FaReact, delay: 0, x: -120, y: -80 },
    { Icon: FaServer, delay: 0.5, x: 120, y: -60 },
    { Icon: FaDatabase, delay: 1, x: -100, y: 80 },
    { Icon: FaCloud, delay: 1.5, x: 100, y: 100 }
];

export function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-[600px] h-[600px] border border-dashed border-amber-500/10 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[450px] h-[450px] border border-dashed border-amber-500/15 rounded-full"
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[300px] h-[300px] border border-dashed border-amber-500/20 rounded-full"
                />
            </div>

            {floatingIcons.map(({ Icon, delay, x, y }, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: [0, 0.6, 0.6, 0],
                        scale: [0.5, 1, 1, 0.8],
                        x: [0, x * 0.5, x, x * 1.2],
                        y: [0, y * 0.5, y, y * 1.2]
                    }}
                    transition={{
                        duration: 4,
                        delay: delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute"
                >
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <Icon className="text-2xl text-amber-400" />
                    </div>
                </motion.div>
            ))}

            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    className="relative w-32 h-32 flex items-center justify-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-amber-500/30 rounded-xl"
                        style={{ borderRadius: "30%" }}
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-3 border border-amber-500/20 rounded-lg"
                    />
                    <VscGear className="text-5xl text-amber-400 animate-spin-slow" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center"
                >
                    <h2 className="text-xl font-bold text-amber-400 tracking-widest uppercase mb-2">
                        Architecting
                    </h2>
                    <p className="text-xs text-foreground/50 tracking-wider">
                        Generating system diagram
                    </p>
                </motion.div>

                <div className="mt-8 flex flex-col items-center gap-2">
                    {architectureLabels.map((label, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: [0, 1, 1, 0], x: [-20, 0, 0, 20] }}
                            transition={{
                                duration: 2.5,
                                delay: i * 0.5,
                                repeat: Infinity,
                                repeatDelay: architectureLabels.length * 0.5 - 2.5
                            }}
                            className="text-[10px] text-amber-500/60 font-mono tracking-widest"
                        >
                            {label}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                    />
                </div>

                <motion.p
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-4 text-[10px] text-foreground/30 tracking-[0.3em] uppercase"
                >
                    Canvas Agent Processing
                </motion.p>
            </div>

            <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
        </div>
    );
}
