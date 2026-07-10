
interface LoaderProps {
  message?: string;
}

const DEFAULT_MESSAGE = 'Loading data...';

export function Loader({ message = DEFAULT_MESSAGE }: LoaderProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-app-card/90 text-app-muted"
      role="status"
      aria-live="polite"
    >
      <div className="size-12 animate-spin rounded-full border-4 border-app-border border-t-app-accent" />
      <p className="mt-4 text-sm">{message}</p>
    </div>
  );
}
