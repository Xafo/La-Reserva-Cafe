import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-3xl font-extrabold">Algo salio mal</h1>
          <p className="max-w-md text-muted-foreground">
            Ocurrio un error inesperado. Recarga la pagina; si el problema persiste,
            avisa al equipo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground hover:bg-forest"
          >
            Recargar
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
