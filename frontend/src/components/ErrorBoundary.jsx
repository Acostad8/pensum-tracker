import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
          <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-slate-900">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl dark:bg-red-900/30"
              aria-hidden="true"
            >
              ⚠️
            </div>
            <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              Algo salió mal
            </h1>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Ocurrió un error inesperado. Recarga la página o vuelve a intentar.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-ufpso-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-ufpso-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
