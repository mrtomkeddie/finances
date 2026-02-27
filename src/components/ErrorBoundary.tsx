'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-8">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="pt-8 pb-8 space-y-4">
                            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Something went wrong</h2>
                                <p className="text-sm text-muted-foreground">
                                    An unexpected error occurred. Please try again.
                                </p>
                                {this.state.error && (
                                    <p className="text-xs text-muted-foreground font-mono bg-muted rounded p-2 mt-2 break-all">
                                        {this.state.error.message}
                                    </p>
                                )}
                            </div>
                            <Button onClick={this.handleReset} variant="outline" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
