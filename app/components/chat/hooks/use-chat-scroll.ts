import { useRef, useEffect } from "react";

export function useChatScroll<T>(dep: T) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [dep]);

    return messagesEndRef;
}
