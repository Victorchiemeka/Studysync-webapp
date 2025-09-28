import React from 'react';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variants = {
    default: 'bg-brand-blue-100 text-brand-blue-800 border border-brand-blue-200',
    outline: 'border border-neutral-200 text-neutral-600 bg-transparent',
    secondary: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export { Badge };