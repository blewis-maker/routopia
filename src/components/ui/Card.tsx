interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={`bg-stone-900 border border-stone-800 rounded-lg shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 