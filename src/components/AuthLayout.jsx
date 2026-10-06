import React from "react";
import { Link } from "react-router-dom";
import StarField from "@/components/StarField";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <StarField />
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            <circle cx="20" cy="20" r="3" fill="#7C5CFF" />
            <ellipse cx="20" cy="20" rx="16" ry="6" fill="none" stroke="#7C5CFF" strokeWidth="1.5" opacity="0.6" transform="rotate(-25 20 20)" />
            <ellipse cx="20" cy="20" rx="16" ry="6" fill="none" stroke="#4CC9F0" strokeWidth="1" opacity="0.4" transform="rotate(25 20 20)" />
            <circle cx="34" cy="14" r="1.5" fill="#4CC9F0" />
            <circle cx="8" cy="26" r="1" fill="#B45CFF" />
          </svg>
          <span className="text-2xl font-bold font-heading tracking-wider">NEBULA</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl nebula-gradient mb-4 relative">
            <div className="absolute inset-0 rounded-2xl nebula-gradient opacity-30 blur-lg" />
            {Icon && <Icon className="w-7 h-7 text-white relative z-10" aria-hidden="true" />}
          </div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="glass-strong rounded-2xl border border-border p-8">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">Shopping Beyond the Ordinary</p>
      </div>
    </div>
  );
}