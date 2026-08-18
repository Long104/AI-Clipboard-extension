import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "secondary" | "ghost" | "outline" | "destructive" | "icon";
	size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", disabled, ...props }, ref) => {
		const baseStyles =
			"inline-flex items-center justify-center font-medium rounded-md transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50 select-none";

		const variants = {
			default:
				"bg-blue-600 text-white hover:bg-indigo-600 active:bg-emerald-600 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600",
			secondary:
				"bg-slate-100 text-slate-900 border border-slate-200 hover:bg-white active:translate-y-[1px] dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700",
			ghost:
				"bg-transparent text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400",
			outline:
				"border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
			destructive:
				"bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
			icon: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-sm p-1.5 h-8 w-8 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400",
		};

		const sizes = {
			default: "h-11 px-4 py-2 text-sm",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-6 text-base",
			icon: "h-8 w-8 p-0",
		};

		return (
			<button
				className={cn(
					baseStyles,
					variants[variant],
					variant !== "icon" && sizes[size],
					className
				)}
				ref={ref}
				disabled={disabled}
				{...props}
			/>
		);
	}
);

Button.displayName = "Button";
