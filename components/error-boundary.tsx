'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  resetError: () => void;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // This is where you'd integrate with Sentry, LogRocket, etc.
      // reportError(error, errorInfo);
    }
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
          />
        );
      }

      // Custom fallback JSX
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          this.props.isolate ? '' : 'bg-background'
        }`}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-destructive">
                      Error Details (Development Only)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                      {this.state.error.message}
                      {this.state.error.stack && '\n\n' + this.state.error.stack}
                    </pre>
                  </details>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={this.resetError}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('useErrorHandler:', error, errorInfo);
    }
    
    // In a real app, report to error tracking service
    // reportError(error, errorInfo);
  };
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: React.ComponentType<ErrorFallbackProps>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallbackComponent={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Specialized error boundaries for different app sections
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // App-level error handling
        console.error('App Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function TutorialErrorBoundary({ children }: { children: ReactNode }) {
  const handleTutorialError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Tutorial Error:', error, errorInfo);
    // Reset tutorial state or provide fallback
  };

  return (
    <ErrorBoundary
      onError={handleTutorialError}
      fallback={
        <div className="p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg">
          <p className="text-amber-400">Tutorial temporarily unavailable. You can continue using the app normally.</p>
        </div>
      }
      isolate
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode;
  componentName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            {componentName} is temporarily unavailable
          </p>
        </div>
      }
      isolate
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;