import { motion } from "framer-motion";
import { VscCheck } from "react-icons/vsc";
import type { QuestionOption } from "@/app/lib/schemas/message";

interface OptionItemProps {
    option: QuestionOption;
    isSelected: boolean;
    disabled: boolean;
    onClick: () => void;
}

export function OptionItem({ option, isSelected, disabled, onClick }: OptionItemProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            whileTap={{ scale: disabled ? 1 : 0.99 }}
            className={`w-full p-3 text-left rounded-lg border transition-all ${isSelected
                    ? "bg-accent/20 border-accent text-foreground"
                    : "bg-white/5 border-border hover:border-accent/50 text-foreground/80"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected
                        ? "border-accent bg-accent"
                        : "border-foreground/30"
                    }`}>
                    {isSelected && (
                        <VscCheck className="text-xs text-background" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    {option.description && (
                        <p className="text-xs text-foreground/50 mt-1">{option.description}</p>
                    )}
                </div>
            </div>
        </motion.button>
    );
}
