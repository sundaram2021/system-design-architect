import { motion } from "framer-motion";
import { VscAdd } from "react-icons/vsc";

interface NewDesignButtonProps {
    onClick: () => void;
}

export const NewDesignButton = ({ onClick }: NewDesignButtonProps) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 bg-sidebar/80 border border-border rounded-lg hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group backdrop-blur-sm"
    >
        <VscAdd className="text-base text-amber-400 group-hover:rotate-90 transition-transform duration-200" />
        <span className="text-[10px] text-foreground/70 font-medium uppercase tracking-wider group-hover:text-amber-400 transition-colors">
            New Design
        </span>
    </motion.button>
);
