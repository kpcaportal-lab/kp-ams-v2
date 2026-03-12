import React from 'react';

export function LoadingOverlay({ message = 'Loading...', className = '' }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 ${className}`}
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-lg font-semibold text-blue-700">{message}</span>
      </div>
    </div>
  );
}
