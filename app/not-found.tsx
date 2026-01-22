import Link from "next/link";

export default function NotFound() {
    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] text-[#ededed]">
            {/* Background Grid */}
            <div className="absolute inset-0 architect-grid opacity-50" />

            <div className="relative z-10 flex max-w-md flex-col items-center text-center p-6">
                <div className="mb-6 rounded-lg border border-[#2a2a2a] bg-[#121212] p-8 shadow-2xl">
                    <h1 className="mb-2 text-6xl font-bold text-[#ff6b00]">404</h1>
                    <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent" />
                    <h2 className="mb-4 text-2xl font-semibold">Blueprint Not Found</h2>
                    <p className="mb-8 text-[#ededed]/60">
                        The architectural plan you are looking for does not exist or has been moved to another sector.
                    </p>

                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 rounded bg-[#ff6b00] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#ff6b00]/90 hover:shadow-[0_0_20px_rgba(255,107,0,0.3)]"
                    >
                        <span>Return to Workspace</span>
                        <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
