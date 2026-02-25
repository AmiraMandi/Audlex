"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[40vh] p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-text mb-2">
              Algo salió mal / Something went wrong
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {this.state.error?.message || "Error inesperado / Unexpected error"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar / Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
