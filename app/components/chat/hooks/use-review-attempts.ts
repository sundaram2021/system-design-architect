import { useMemo } from "react";
import type { Message } from "@/app/lib/schemas/message";

export function useReviewAttempts(messages: Message[]) {
    return useMemo(() => {
        const map = new Map<string, number>();
        let count = 0;
        for (const m of messages) {
            if (m.type === "review") {
                count++;
                map.set(m.id, count);
            }
        }
        return map;
    }, [messages]);
}
