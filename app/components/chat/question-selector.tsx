"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VscCheck } from "react-icons/vsc";
import { HiOutlineLightBulb } from "react-icons/hi";
import type { QuestionOption } from "@/app/lib/schemas";

interface QuestionSelectorProps {
    question: string;
    options: QuestionOption[];
    allowCustom: boolean;
    allowMultiple?: boolean;
    onSelect: (option: QuestionOption | string) => void;
    disabled?: boolean;
}

export function QuestionSelector({
    question,
    options,
    allowCustom,
    allowMultiple = false,
    onSelect,
    disabled = false
}: QuestionSelectorProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [customValue, setCustomValue] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleOptionClick = (option: QuestionOption) => {
        if (disabled) return;

        if (option.id === "custom") {
            setShowCustomInput(true);
            if (!allowMultiple) {
                setSelectedIds(["custom"]);
            } else if (!selectedIds.includes("custom")) {
                setSelectedIds([...selectedIds, "custom"]);
            }
        } else {
            let newSelectedIds = [...selectedIds];

            if (allowMultiple) {
                if (newSelectedIds.includes(option.id)) {
                    newSelectedIds = newSelectedIds.filter(id => id !== option.id);
                } else {
                    newSelectedIds.push(option.id);
                }
            } else {
                newSelectedIds = [option.id];
            }

            setSelectedIds(newSelectedIds);

            // For single select, trigger callback immediately
            if (!allowMultiple) {
                onSelect(option);
            }
        }
    };

    const handleConfirmSelection = () => {
        if (disabled) return;

        // Filter out "custom" as it's handled separately or via text input
        const validSelections = options.filter(opt => selectedIds.includes(opt.id));

        if (selectedIds.includes("custom") && customValue.trim()) {
            // If allowMultiple, we might need to handle this differently depending on backend expectations
            // For now, let's assume if custom is selected, we pass the custom text
            if (allowMultiple) {
                // If the parent expects a list of options/strings.
                // The current interface allows `QuestionOption | string`.
                // We'll need to adapt the parent's `onSelect` to handle arrays if `allowMultiple` is true
                // But `onSelect` signature is `(option: QuestionOption | string) => void`. 
                // This implies single calls. We might need to iterate or change prop type.
                // Given the limitation, we'll iterate for now or just trigger for the last one?
                // Actually, the request asks to "make it multi select".
                // We likely need to update the prop types too.
            }
        }
    };

    const handleCustomSubmit = () => {
        if (customValue.trim() && !disabled) {
            onSelect(customValue.trim());
        }
    };

    const allOptions = allowCustom
        ? [...options, { id: "custom", label: "Other (specify)", description: "Enter your own answer" }]
        : options;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
        >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                <HiOutlineLightBulb className="text-accent text-lg" />
            </div>
            <div className="flex-1 min-w-0 p-4 bg-accent/5 border border-accent/20 rounded-lg rounded-tl-none overflow-hidden">
                <p className="text-xs text-accent uppercase tracking-wider mb-2">Orchestrator Agent</p>
                <p className="text-sm text-foreground mb-4 leading-relaxed">{question}</p>

                <div className="space-y-2">
                    {allOptions.map((option) => {
                        const isSelected = selectedIds.includes(option.id);
                        return (
                            <motion.button
                                key={option.id}
                                onClick={() => handleOptionClick(option)}
                                disabled={disabled || (!allowMultiple && selectedIds.length > 0)}
                                whileHover={{ scale: disabled || (selectedIds.length > 0 && !allowMultiple) ? 1 : 1.01 }}
                                whileTap={{ scale: disabled || (selectedIds.length > 0 && !allowMultiple) ? 1 : 0.99 }}
                                className={`w-full p-3 text-left rounded-lg border transition-all ${isSelected
                                    ? "bg-accent/20 border-accent text-foreground"
                                    : "bg-white/5 border-border hover:border-accent/50 text-foreground/80"
                                    } ${disabled || (selectedIds.length > 0 && !allowMultiple && !isSelected) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                    })}
                </div>

                {showCustomInput && selectedIds.includes("custom") && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 flex gap-2"
                    >
                        <input
                            type="text"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            placeholder="Enter your answer..."
                            disabled={disabled}
                            className="flex-1 px-4 py-2 bg-black/40 border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent/50"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (allowMultiple) {
                                        // Just keep it in state for confirm
                                    } else {
                                        onSelect(customValue.trim());
                                    }
                                }
                            }}
                        />
                        {!allowMultiple && (
                            <button
                                onClick={() => onSelect(customValue.trim())}
                                disabled={!customValue.trim() || disabled}
                                className="px-4 py-2 bg-accent text-background text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit
                            </button>
                        )}
                    </motion.div>
                )}

                {allowMultiple && (selectedIds.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 flex justify-end"
                    >
                        <button
                            onClick={() => {
                                const values = selectedIds.map(id => {
                                    if (id === "custom") return customValue;
                                    const opt = options.find(o => o.id === id);
                                    return opt ? opt.label : id;
                                }).filter(v => v);
                                // Join multiple values for now as the onSelect implies single string handling upstream usually
                                // Or better, pass an array if the context supports it. 
                                // Since we have to stick to existing props, let's join them with commas.
                                onSelect(values.join(", "));
                            }}
                            disabled={disabled}
                            className="px-6 py-2 bg-accent text-background text-sm font-bold rounded-lg hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
                        >
                            Confirm Selection ({selectedIds.length})
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
