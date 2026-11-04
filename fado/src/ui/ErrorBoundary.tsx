import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** gdy podane, błąd w dziecku nie zatrzymuje gry — renderujemy to zamiast niego */
  fallback?: ReactNode;
  label: string;
  /** czy pokazać komunikat na ekranie (dla krytycznych błędów) */
  visible?: boolean;
}

interface State {
  error: Error | null;
}

/** Łapie błędy renderowania i pokazuje je na ekranie — bez tego na telefonie widać tylko czarny ekran. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[${this.props.label}]`, error, info.componentStack);
    window.__fadoReportError?.(`${this.props.label}: ${error.message}\n${(error.stack ?? '').split('\n').slice(0, 4).join('\n')}`);
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    if (this.props.visible) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 p-6 text-white">
          <div className="max-w-xl">
            <h2 className="mb-2 text-xl font-bold">Ups — {this.props.label} nie wystartował</h2>
            <pre className="whitespace-pre-wrap break-words text-xs opacity-80">{this.state.error.message}</pre>
            <button className="pointer-events-auto mt-4 rounded-xl bg-amber-400 px-4 py-2 font-bold text-black" onClick={() => location.reload()}>
              Uruchom ponownie
            </button>
          </div>
        </div>
      );
    }
    return this.props.fallback ?? null;
  }
}

declare global {
  interface Window {
    __fadoReportError?: (message: string) => void;
  }
}
