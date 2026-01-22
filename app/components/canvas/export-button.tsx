import { VscLoading } from "react-icons/vsc";

interface ExportButtonProps {
    isExporting: boolean;
    onClick: () => void;
}

export const ExportButton = ({ isExporting, onClick }: ExportButtonProps) => (
    <button
        onClick={onClick}
        disabled={isExporting}
        className="flex items-center gap-2 text-[10px] text-accent font-bold tracking-widest bg-accent/10 px-4 py-2 border border-accent/20 rounded hover:bg-accent hover:text-background transition-all backdrop-blur-sm disabled:opacity-50"
    >
        {isExporting ? (
            <>
                <VscLoading className="animate-spin text-sm" />
                EXPORTING...
            </>
        ) : (
            "EXPORT BLUEPRINT"
        )}
    </button>
);
