
import React, { useState, useEffect } from 'react';
import { useEvacuationRoutes } from '@/hooks/useEvacuationRoutes';
import { mockDataService } from '@/services/mockDataService';
import DashboardHeader from './dashboard/DashboardHeader';
import ForestFireZones from './dashboard/ForestFireZones';
import DroneDeployment from './dashboard/DroneDeployment';
import FirstResponders from './dashboard/FirstResponders';
import EvacuationRoutesPanel from './dashboard/EvacuationRoutesPanel';
import MapAttribution from './dashboard/MapAttribution';
import LiveVideoFeed from './dashboard/LiveVideoFeed';

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

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Header */}
      <DashboardHeader />
      
      {/* Forest Fire Zones */}
      <h2 className="text-xl font-bold mb-4">Forest Fire Zones</h2>
      <ForestFireZones />

      {/* Drone Deployment */}
      <DroneDeployment />

      {/* First Responders */}
      <FirstResponders />

      {/* Evacuation Routes */}
      <EvacuationRoutesPanel computedRoutes={computedRoutes} isLoading={isLoading} />

      {/* Map attribution */}
      <MapAttribution />

      {/* Live Video Feed */}
      <LiveVideoFeed />
    </div>
  );
};

export default EmergencyDashboard;
