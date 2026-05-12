"use client"

import React from "react"

type ErrorBoundaryFallbackProps = {
  error: Error
  reset: () => void
}

type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback:
    | React.ReactNode
    | ((props: ErrorBoundaryFallbackProps) => React.ReactNode)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: unknown[]
}

type ErrorBoundaryState = {
  error: Error | null
}

function haveResetKeysChanged(
  previousKeys: unknown[] = [],
  nextKeys: unknown[] = []
) {
  if (previousKeys.length !== nextKeys.length) {
    return true
  }

  return previousKeys.some((key, index) => !Object.is(key, nextKeys[index]))
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (
      this.state.error &&
      haveResetKeysChanged(previousProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ error: null })
    }
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { children, fallback } = this.props

    if (!error) {
      return children
    }

    if (typeof fallback === "function") {
      return fallback({ error, reset: this.reset })
    }

    return fallback
  }
}
