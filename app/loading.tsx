export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-[#ededed]">
            <div className="relative flex flex-col items-center gap-4">
                {/* Architectural Grid Loader */}
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded border-2 border-[#2a2a2a]" />
                    <div className="absolute inset-0 animate-spin rounded border-t-2 border-[#ff6b00]" />
                    <div className="absolute inset-4 animate-pulse rounded bg-[#ff6b00]/20" />
                </div>
                <p className="text-sm font-medium tracking-widest text-[#ededed]/60 uppercase">
                    Initializing Workspace...
                </p>
            </div>
        </div>
    );
}
