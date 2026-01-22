import { motion } from "framer-motion";

interface CustomInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled: boolean;
    showSubmitButton: boolean;
}

export function CustomInput({ value, onChange, onSubmit, disabled, showSubmitButton }: CustomInputProps) {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 flex gap-2"
        >
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter your answer..."
                disabled={disabled}
                className="flex-1 px-4 py-2 bg-black/40 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent/50"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (showSubmitButton) {
                            onSubmit();
                        }
                    }
                }}
            />
            {showSubmitButton && (
                <button
                    onClick={onSubmit}
                    disabled={!value.trim() || disabled}
                    className="px-4 py-2 bg-accent text-background text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit
                </button>
            )}
        </motion.div>
    );
}
