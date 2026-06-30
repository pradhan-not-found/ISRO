import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

const ACCENT_GLOWS = {
	none: "from-transparent to-transparent opacity-0",
	ink: "from-neutral-500/[0.5] to-transparent dark:from-neutral-500/50 dark:to-transparent",
};

export function AppShell({ children }) {
	const gradientClass = ACCENT_GLOWS.ink;

	return (
		<SidebarProvider className="bg-[var(--app-canvas)] text-[var(--app-ink)] antialiased h-svh overflow-hidden">
			<AppSidebar />
			<SidebarInset className="relative flex-1 flex flex-col min-h-0 bg-[var(--app-canvas)]">
				{/* Ambient accent backdrop tone */}
				<div className={`absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t ${gradientClass} pointer-events-none z-0`} />

				{/* Fine noise texture overlay */}
				<div className="absolute inset-0 bg-noise opacity-[0.015] dark:opacity-[0.025] pointer-events-none z-0 mix-blend-overlay" />

				{/* Custom title bar */}
				<header
					className="app-headbar sticky top-0 z-30 flex h-12 items-center justify-between gap-2 bg-transparent px-3 sm:px-4"
				>
					<div className="flex items-center gap-2">
						<SidebarTrigger className="text-[var(--app-muted)] hover:text-[var(--app-ink)] h-8 w-8 rounded-lg hover:bg-neutral-800/10 dark:hover:bg-white/5" />
					</div>
				</header>
				<div className="flex-1 min-h-0 relative z-10 overflow-hidden flex flex-col">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
