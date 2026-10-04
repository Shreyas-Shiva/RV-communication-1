import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'emergency' | 'ghost' | 'success';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'normal' | 'large' | 'child';
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'normal',
  icon,
  children,
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) => {
  // Rectangles with 10 to 12px radius only. Absolutely no rounded-full or pill shapes.
  const baseClasses = 'inline-flex items-center justify-center font-bold select-none cursor-pointer rounded-[12px] border-2 transition-transform duration-100 active:scale-[0.98] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0F8B8D] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Flat color variants: flat accessible palette
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#0A6C6E] text-white border-[#0A6C6E] hover:bg-[#085557]',
    secondary: 'bg-white text-[#1F1B16] border-[#E5DACF] hover:bg-[#FFF4D6] hover:border-[#FFB703]',
    accent: 'bg-[#FFB703] text-[#1F1B16] border-[#FFB703] hover:bg-[#E5A400]',
    emergency: 'bg-[#D62828] text-white border-[#D62828] hover:bg-[#B31D1D]',
    success: 'bg-[#1B7A42] text-white border-[#1B7A42] hover:bg-[#145E33]',
    ghost: 'bg-transparent text-[#1F1B16] border-transparent hover:bg-[#E2F3F3]'
  };

  // Touch target sizes: Child >= 80px, Adult/Student >= 56px
  const sizeClasses: Record<'normal' | 'large' | 'child', string> = {
    normal: 'min-h-[56px] px-5 py-3 text-base sm:text-lg gap-2.5',
    large: 'min-h-[64px] px-7 py-4 text-xl sm:text-2xl gap-3',
    child: 'min-h-[80px] px-6 py-4 text-2xl font-extrabold gap-3.5'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
