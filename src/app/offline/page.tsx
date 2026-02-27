
'use client';

export default function OfflinePage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#111827',
            color: '#f9fafb',
        }}>
            <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '1.5rem', opacity: 0.5 }}
            >
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                You&apos;re Offline
            </h1>
            <p style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2rem', maxWidth: '300px' }}>
                Please check your internet connection and try again.
            </p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '0.75rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'transparent',
                    color: '#f9fafb',
                    cursor: 'pointer',
                }}
            >
                Try Again
            </button>
        </div>
    );
}
