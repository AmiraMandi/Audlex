import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-surface-secondary", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("px-6 py-5 border-b border-border", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-text", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-secondary mt-1", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("px-6 py-4 border-t border-border bg-surface-tertiary rounded-b-xl", className)}
      {...props}
    />
  );
}
