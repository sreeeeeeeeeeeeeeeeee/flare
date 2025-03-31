import React from 'react';

const EmergencyDashboard = () => {
  // Sample data - replace with your actual route data
  const activeRoutes = [
    {
      name: "Main Street → Saint John Street",
      status: "active",
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
      status: "open",
      distance: "5.7 km",
      updated: "13:15",
      color: "text-blue-500"
    }
  ];

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

      {/* Enhanced Evacuation Routes Section */}
      <div className="mb-6">
        <h3 className="font-bold mb-3">Evacuation Routes</h3>
        {activeRoutes.length > 0 ? (
          <div className="space-y-3">
            {activeRoutes.map((route, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{route.name}</span>
                  <span className={`text-sm font-semibold ${route.color}`}>
                    {route.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{route.distance}</span>
                  <span>Updated: {route.updated}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">Calculating evacuation routes...</div>
        )}
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
