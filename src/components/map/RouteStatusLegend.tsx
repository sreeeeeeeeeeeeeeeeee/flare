
/**
 * Route status legend component
 */

import React from 'react';

const RouteStatusLegend = () => {
  return (
    <div className="absolute top-2 right-2 z-[1000] bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-md border border-border">
      <div className="text-xs font-semibold mb-1">Route Status:</div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
          <span className="text-xs">Open</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
          <span className="text-xs">Congested</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
          <span className="text-xs">Closed</span>
        </div>
      </div>
    </div>
  );
};

export default RouteStatusLegend;
