import { motion } from "framer-motion";
import { NewDesignButton } from "./new-design-button";

interface CanvasToolbarProps {
    title: string;
    nodeCount: number;
    edgeCount: number;
    onNewDesign: () => void;
}

export const CanvasToolbar = ({ title, nodeCount, edgeCount, onNewDesign }: CanvasToolbarProps) => {
    return (
        <>
            <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                <div className="flex justify-center pt-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-lg backdrop-blur-md"
                    >
                        <h1 className="text-xl font-bold text-amber-400 tracking-wide text-center">
                            {title || "System Architecture"}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <div className="absolute top-4 left-4 z-10">
                <NewDesignButton onClick={onNewDesign} />
            </div>

            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <div className="text-[10px] text-foreground/40 font-mono bg-black/60 px-2 py-1 border border-border rounded backdrop-blur-sm">
                    NODES: {nodeCount} | EDGES: {edgeCount}
                </div>
            </div>
        </>
    );
};
