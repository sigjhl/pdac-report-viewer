import React from 'react';

export const Card = ({ children, className, ...props }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-md ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }) => (
  <div className={`p-5 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={`text-xl font-semibold leading-6 text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

// Additional components to match your existing styles
export const StatusLabel = ({ status, children, noBackground = false }) => {
  if (noBackground) {
    return <span>{children}</span>;
  }
  const bgColor = status === "Resectable" || status === "Negative" ? "bg-green-200" :
                  status === "Borderline" || status === "Indeterminate" || 
                  status === "Potentially Borderline" || status === "Potentially Resectable" ? "bg-yellow-200" :
                  "bg-red-200";
  return <span className={`${bgColor} px-2 py-1 rounded`}>{children}</span>;
};