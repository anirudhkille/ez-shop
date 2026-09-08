import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, send this to your logging service (Sentry, etc.)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md space-y-6">
            <h1 className="font-display text-foreground text-4xl font-black uppercase">
              Something went wrong
            </h1>
            <p className="text-muted-foreground font-body">
              We apologize for the inconvenience. Please try again or refresh
              the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="bg-muted max-h-40 overflow-auto rounded-lg p-4 text-left text-xs">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="bg-gradient-orange text-primary-foreground font-body rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="border-brand-border text-foreground font-body hover:border-brand-orange/50 hover:text-brand-orange rounded-full border px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-all"
              >
                Reload
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
