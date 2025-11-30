import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen bg-slate-900 text-slate-100 items-center justify-center">
          <div className="text-center max-w-4xl px-6">
            <div className="text-3xl font-bold mb-4 text-red-400">⚠️ Something went wrong</div>
            <div className="text-slate-300 mb-6">
              The application encountered an error and couldn't render properly.
            </div>

            {this.state.error && (
              <div className="bg-slate-800 p-4 rounded mb-4 text-left overflow-auto max-h-96">
                <div className="font-bold text-red-400 mb-2">Error:</div>
                <div className="text-sm text-slate-300 mb-4">{this.state.error.toString()}</div>

                {this.state.errorInfo && (
                  <>
                    <div className="font-bold text-red-400 mb-2">Stack Trace:</div>
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
