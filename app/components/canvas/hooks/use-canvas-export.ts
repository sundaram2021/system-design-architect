import { useState, useCallback, RefObject } from "react";
import { toPng } from "html-to-image";

export const useCanvasExport = (canvasRef: RefObject<HTMLDivElement | null>, canvasTitle: string) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        if (!canvasRef.current) return;

        try {
            setIsExporting(true);
            const dataUrl = await toPng(canvasRef.current, {
                cacheBust: true,
                filter: (node) => {
                    // Exclude buttons from the export
                    if (node.tagName === 'BUTTON') return false;
                    return true;
                },
                backgroundColor: '#000000' // Ensure dark background is captured
            });

            const link = document.createElement('a');
            link.download = `${canvasTitle?.toLowerCase().replace(/\s+/g, '-') || 'blueprint'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    }, [canvasRef, canvasTitle]);

    return { isExporting, handleExport };
};
