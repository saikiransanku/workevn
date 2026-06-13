import { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-500"
};

export default function Button({ variant = "primary", className = "", children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
