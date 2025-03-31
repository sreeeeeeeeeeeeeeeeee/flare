
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle } from "lucide-react";

const EmergencyDashboard = () => {
  // Sample data - updated to match the rest of the application
  const activeRoutes = [
    {
      name: "Main Street → Saint John Street",
      status: "open",
      distance: "3.2 km",
      updated: "13:50",
      color: "text-green-500"
    },
    {
      name: "Mistissini → Chibougamau",
      status: "congested",
      distance: "78.5 km",
      updated: "13:30",
      color: "text-yellow-500"
    },
    {
      name: "Dropose Industrial Zone → Hospital",
      status: "closed",
      distance: "5.7 km",
      updated: "13:15",
      color: "text-red-500"
    }
  ];

  // Function to get the appropriate color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-green-500 bg-green-50';
      case 'congested':
        return 'text-amber-500 bg-amber-50';
      case 'closed':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  // Function to get badge variant based on status
  const getBadgeVariant = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'congested':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'closed':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Existing sections remain unchanged */}
      <h2 className="text-xl font-bold mb-4">Forest Fire Zones</h2>
      <div className="mb-6">Responders</div>
      
      <h2 className="text-xl font-bold mb-4">Safe Routes</h2>
      
      {/* Emergency Alerts - unchanged */}
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
        
        {activeRoutes.length > 0 ? (
          <div className="space-y-3">
            {activeRoutes.map((route, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-md shadow-sm p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{route.name}</div>
                    <div className="flex justify-between text-sm text-slate-500 mt-1">
                      <span>{route.distance}</span>
                      <span>Updated: {route.updated}</span>
                    </div>
                  </div>
                  <Badge 
                    className={`ml-2 ${getBadgeVariant(route.status)}`}
                  >
                    {route.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 bg-slate-100/50 rounded-md">
            <div className="flex justify-center mb-2">
              <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>Calculating evacuation routes...</div>
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
