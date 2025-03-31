import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Clock } from "lucide-react";
import { useEvacuationRoutes } from '@/hooks/useEvacuationRoutes';
import { Route } from '@/types/mapTypes';
import { mockDataService } from '@/services/mockDataService';

// Shared status configuration
const statusConfig = {
  open: { 
    display: "OPEN", 
    color: "#22c55e", 
    panelClass: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    mapOptions: { color: "#22c55e", weight: 6 }
  },
  congested: { 
    display: "CONGESTED", 
    color: "#f97316", 
    panelClass: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    mapOptions: { color: "#f97316", weight: 6, dashArray: "5, 5" }
  },
  closed: { 
    display: "CLOSED", 
    color: "#ef4444", 
    panelClass: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    mapOptions: { color: "#ef4444", weight: 6, dashArray: "10, 6" }
  }
};

const EmergencyDashboard = () => {
  // Use the evacuation routes from the mock data service
  const [mapData, setMapData] = useState(mockDataService.getInitialData());
  const { computedRoutes, isLoading } = useEvacuationRoutes(mapData.evacuationRoutes);
  
  // Update data every 2 minutes
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const updatedData = mockDataService.getUpdatedData();
      setMapData(updatedData);
    }, 120000); // 120000 ms = 2 minutes
    
    return () => clearInterval(updateInterval);
  }, []);

  // Format time for display
  const formatUpdateTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate and format distance
  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Forest Fire Response System</h1>
        <div className="flex space-x-3">
          <span className="px-2 py-1 bg-red-500 text-white rounded-full text-sm animate-pulse">LIVE</span>
          <span className="px-2 py-1 bg-slate-200 rounded-full text-sm">
            {new Date().toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Forest Fire Zones - unchanged */}
      <h2 className="text-xl font-bold mb-4">Forest Fire Zones</h2>
      <div className="mb-6">
        <h3 className="font-bold mb-2">Emergency Alerts</h3>
        <div className="flex items-center mb-1">
          <input type="checkbox" className="mr-2" />
          <span>Critical Warning</span>
        </div>
        <div className="flex items-center mb-2">
          <input type="checkbox" defaultChecked className="mr-2" />
          <span>Forest Fire Alert</span>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-2 mb-3">
          Active forest fire detected near Main Street. Immediate evacuation required via Saint John Street.
          <div className="text-sm text-gray-500 mt-1">Northern Mistissini • 13:45</div>
        </div>
      </div>

      {/* Drone Deployment - unchanged */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Drone Deployment</h3>
        <p className="mb-1">Surveillance drones deployed to monitor forest fire perimeters around Mistissini.</p>
        <div className="text-sm text-gray-500">Mistissini Ranton • 12:20</div>
      </div>

      {/* First Responders - unchanged */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">First Responders</h3>
        {[
          "Forest Fire Drone 1 - Quebec Central Boreal Forest",
          "Forest Fire Drone 2 - Mistissini Boreal Forest",
          "Forest Fire Drone 3 - Cree Traditional Territory Forest"
        ].map((drone, index) => (
          <div key={index} className="flex items-center mb-1">
            <input type="checkbox" className="mr-2" />
            <span>{drone}</span>
          </div>
        ))}
        <div className="flex items-center mt-2">
          <input type="checkbox" className="mr-2" />
          <span>active</span>
        </div>
      </div>

      {/* Redesigned Evacuation Routes Section */}
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
        
        {/* Status legend - redesigned */}
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

      {/* Map attribution - unchanged */}
      <div className="text-xs text-gray-400 mb-4">
        Leaflet | OpenStreetMap contributors
      </div>

      {/* Live Video Feed - unchanged */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Live Video Feed</h3>
        <div className="flex space-x-3">
          <button className="px-3 py-1 bg-gray-200 rounded">Pause</button>
          <button className="px-3 py-1 bg-red-500 text-white rounded">LIVE</button>
          <span className="py-1">Mistissini Forest Fire Zone</span>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDashboard;
