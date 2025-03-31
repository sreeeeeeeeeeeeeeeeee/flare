
import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Forest Fire Response System</h1>
      <div className="flex space-x-3">
        <span className="px-2 py-1 bg-red-500 text-white rounded-full text-sm animate-pulse">LIVE</span>
        <span className="px-2 py-1 bg-slate-200 rounded-full text-sm">
          {new Date().toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default DashboardHeader;
