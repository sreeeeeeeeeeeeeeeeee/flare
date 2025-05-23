
/**
 * Route status legend component
 */

import React from 'react';
import { statusConfig } from '@/utils/routeStatusConfig';

const RouteStatusLegend = () => {
  return (
    <div className="bg-background/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-border">
      <div className="text-xs font-semibold mb-2">Route Status:</div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusConfig.open.color }}></div>
          <span className="text-xs">Open</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusConfig.congested.color }}></div>
          <span className="text-xs">Congested</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusConfig.closed.color }}></div>
          <span className="text-xs">Closed</span>
        </div>
      </div>
    </div>
  );
};

export default RouteStatusLegend;
