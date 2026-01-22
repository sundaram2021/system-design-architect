import { motion } from "framer-motion";
import { HiOutlineLightBulb } from "react-icons/hi";
import type { QuestionOption } from "@/app/lib/schemas/message";
import { useQuestionSelector } from "./use-question-selector";
import { OptionItem } from "./option-item";
import { CustomInput } from "./custom-input";

export interface QuestionSelectorProps {
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
    const {
        selectedIds,
        customValue,
        setCustomValue,
        showCustomInput,
        handleOptionClick,
        handleCustomSubmit,
        handleConfirmSelection
    } = useQuestionSelector({ options, allowMultiple, onSelect, disabled });

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
                            <OptionItem
                                key={option.id}
                                option={option}
                                isSelected={isSelected}
                                disabled={disabled || (!allowMultiple && selectedIds.length > 0 && !isSelected)}
                                onClick={() => handleOptionClick(option)}
                            />
                        );
                    })}
                </div>

                {showCustomInput && selectedIds.includes("custom") && (
                    <CustomInput
                        value={customValue}
                        onChange={setCustomValue}
                        onSubmit={handleCustomSubmit}
                        disabled={disabled}
                        showSubmitButton={!allowMultiple}
                    />
                )}

                {allowMultiple && (selectedIds.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 flex justify-end"
                    >
                        <button
                            onClick={handleConfirmSelection}
                            disabled={disabled}
                            className="px-6 py-2 bg-accent text-background text-sm font-bold rounded-lg hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            Confirm Selection ({selectedIds.length})
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
