
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}: ButtonProps) => {

    const baseStyles = "rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95";

    const variants = {
        primary: "bg-[var(--marketing-orange)] text-white hover:bg-[#C74500] hover:shadow-lg shadow-md",
        outline: "border-2 border-[var(--marketing-orange)] text-[var(--marketing-orange)] hover:bg-[var(--marketing-orange)] hover:text-white",
        ghost: "text-[var(--charcoal-600)] hover:bg-[var(--sand-100)] hover:text-[var(--marketing-orange)]"
    };

    const sizes = {
        sm: "px-4 py-1.5 text-sm",
        md: "px-6 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
            {...props}
        >
            {children}
        </button>
    );
};
