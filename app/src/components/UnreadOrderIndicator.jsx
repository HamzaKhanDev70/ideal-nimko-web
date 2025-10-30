import React from 'react';

const UnreadOrderIndicator = ({ isUnread, children }) => {
  if (!isUnread) {
    return children;
  }

  return (
    <div className="relative">
      {/* Blinking indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse z-10"></div>
      
      {/* Highlighted content */}
      <div className="bg-blue-50 border-l-4 border-l-blue-500 p-2 rounded-r-lg animate-pulse">
        {children}
      </div>
    </div>
  );
};

export default UnreadOrderIndicator;
