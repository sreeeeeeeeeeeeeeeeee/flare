
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { Route } from '@/types/mapTypes';
import { statusConfig, formatUpdateTime, formatDistance } from '@/utils/routeStatusConfig';

interface EvacuationRoutesPanelProps {
  computedRoutes: Route[];
  isLoading: boolean;
}

const EvacuationRoutesPanel = ({ computedRoutes, isLoading }: EvacuationRoutesPanelProps) => {
  return (
    <div className="mb-6 bg-slate-950/5 p-4 rounded-lg">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-slate-700" />
        Evacuation Routes
      </h3>
      
      {isLoading ? (
        <div className="text-center py-8 text-slate-500 bg-slate-100/50 rounded-md">
          <div className="flex justify-center mb-2">
            <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>Calculating evacuation routes...</div>
        </div>
      ) : computedRoutes.length > 0 ? (
        <div className="space-y-3">
          {computedRoutes.map((route) => (
            <div key={route.id} className="bg-white border border-slate-200 rounded-md shadow-sm p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{route.start} → {route.end}</div>
                  <div className="flex justify-between text-sm text-slate-500 mt-1">
                    <span>{formatDistance(parseFloat(route.path.length.toString()))}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatUpdateTime(route.updatedAt)}
                    </span>
                  </div>
                </div>
                <Badge 
                  className={`ml-2 ${statusConfig[route.status].panelClass}`}
                >
                  {statusConfig[route.status].display}
                </Badge>
              </div>
              {route.status === 'closed' && (
                <div className="text-xs bg-red-50 p-2 mt-2 rounded text-red-800">
                  <span className="font-medium">⚠️ Warning:</span> This route is currently closed. Please use alternative routes.
                </div>
              )}
              {route.status === 'congested' && (
                <div className="text-xs bg-amber-50 p-2 mt-2 rounded text-amber-800">
                  <span className="font-medium">⚠️ Note:</span> Heavy traffic - expect delays. Consider alternative routes if available.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-slate-500">
          No active evacuation routes
        </div>
      )}
      
      {/* Status legend */}
      <div className="mt-4 flex flex-wrap gap-3 bg-white p-2 rounded border border-slate-200">
        <div className="text-xs font-medium text-slate-500 mr-1">Route Status:</div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5"></div>
          <span className="text-xs">Open</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></div>
          <span className="text-xs">Congested</span>
        </div>
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></div>
          <span className="text-xs">Closed</span>
        </div>
      </div>
    </div>
  );
};

export default EvacuationRoutesPanel;
