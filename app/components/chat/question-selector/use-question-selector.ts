import { useState, useCallback } from "react";
import type { QuestionOption } from "@/app/lib/schemas/message";

interface UseQuestionSelectorProps {
    options: QuestionOption[];
    allowMultiple: boolean;
    onSelect: (option: QuestionOption | string) => void;
    disabled: boolean;
}

export function useQuestionSelector({
    options,
    allowMultiple,
    onSelect,
    disabled
}: UseQuestionSelectorProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [customValue, setCustomValue] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleOptionClick = useCallback((option: QuestionOption) => {
        if (disabled) return;

        if (option.id === "custom") {
            setShowCustomInput(true);
            if (!allowMultiple) {
                setSelectedIds(["custom"]);
            } else if (!selectedIds.includes("custom")) {
                setSelectedIds((prev) => [...prev, "custom"]);
            }
        } else {
            if (allowMultiple) {
                setSelectedIds((prev) => {
                    if (prev.includes(option.id)) {
                        return prev.filter((id) => id !== option.id);
                    } else {
                        return [...prev, option.id];
                    }
                });
            } else {
                setSelectedIds([option.id]);
                onSelect(option);
            }
        }
    }, [disabled, allowMultiple, selectedIds, onSelect]);

    const handleCustomSubmit = useCallback(() => {
        if (customValue.trim() && !disabled) {
            onSelect(customValue.trim());
        }
    }, [customValue, disabled, onSelect]);

    const handleConfirmSelection = useCallback(() => {
        if (disabled) return;

        const values = selectedIds.map(id => {
            if (id === "custom") return customValue;
            const opt = options.find(o => o.id === id);
            return opt ? opt.label : id;
        }).filter(Boolean);

        onSelect(values.join(", "));
    }, [disabled, selectedIds, customValue, options, onSelect]);

    return {
        selectedIds,
        customValue,
        setCustomValue,
        showCustomInput,
        handleOptionClick,
        handleCustomSubmit,
        handleConfirmSelection
    };
}
