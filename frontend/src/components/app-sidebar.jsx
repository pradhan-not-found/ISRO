import React, { useState } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Layers, Settings, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
	{ title: "Dashboard", icon: <LayoutDashboard size={18} />, isActive: true },
	{ title: "Analysis", icon: <Activity size={18} />, isActive: false },
	{ title: "Layers", icon: <Layers size={18} />, isActive: false },
	{ title: "Settings", icon: <Settings size={18} />, isActive: false },
];

export function AppSidebar() {
	return (
		<Sidebar
			collapsible="icon"
			className="border-r border-[var(--app-hairline)] bg-[var(--app-soft)]"
			style={{ "--sidebar-background": "var(--app-soft)" }}
		>
			<SidebarHeader className="py-6 px-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
				<div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
					<div className="size-9 group-data-[collapsible=icon]:size-8 bg-black text-white font-bold flex items-center justify-center rounded-xl shrink-0">
						S
					</div>
					<div className="flex flex-col leading-[1.1] group-data-[collapsible=icon]:hidden">
						<span className="text-lg font-semibold tracking-tight text-[var(--app-ink)]">SatInterp</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-4 group-data-[collapsible=icon]:px-2">
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{navItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										isActive={item.isActive}
										tooltip={item.title}
										className={`rounded-xl text-[var(--app-muted)] hover:bg-[var(--app-soft)]/50 dark:hover:bg-white/5 hover:text-[var(--app-ink)] ${item.isActive ? 'apple-active-item !text-[var(--app-ink)] font-semibold' : ''} apple-sidebar-item transition-all duration-200 py-2.5 px-3`}
									>
										{item.icon}
										<span className="font-medium tracking-tight group-data-[collapsible=icon]:hidden">{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="pb-6 px-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-4">
				<div className="relative">
					<button
						className="liquid-shell group flex items-center gap-3 rounded-xl p-2 transition-all w-full group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:!bg-none group-data-[collapsible=icon]:!shadow-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
					>
						<div className="size-9 group-data-[collapsible=icon]:size-8 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden font-bold">
							U
						</div>
						<div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
							<p className="text-sm font-medium text-[var(--app-ink)] truncate">ISRO Evaluator</p>
							<p className="text-[11px] text-[var(--app-muted)] truncate">isro@gov.in</p>
						</div>
					</button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
