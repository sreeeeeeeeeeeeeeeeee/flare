import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import EmergencyMap from '@/components/EmergencyMap';
import VideoFeed from '@/components/VideoFeed';
import AlertsPanel from '@/components/AlertsPanel';
import StatusPanel from '@/components/StatusPanel';
import EvacuationRoutes from '@/components/EvacuationRoutes';
import ResponderList from '@/components/ResponderList';
import { AlertCircle } from 'lucide-react';
import { mockDataService } from '@/services/mockDataService';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState(mockDataService.getInitialData());
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "System Ready",
        description: "Live data streams connected successfully",
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const updatedData = mockDataService.getUpdatedData();
      setMapData(updatedData);
      
      if (updatedData.alerts.some(alert => alert.isNew)) {
        toast({
          title: "New Alert",
          description: updatedData.alerts.find(alert => alert.isNew)?.message,
          variant: "destructive",
        });
      }
    }, 5000);
    
    return () => clearInterval(updateInterval);
  }, [toast]);

  return (
    <div className="min-h-screen h-screen flex flex-col p-4 gap-4 overflow-hidden">
      <header className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-danger" />
          <h1 className="text-2xl font-bold">FLARE</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-danger text-white rounded-full text-sm font-medium animate-pulse-danger">
            LIVE
          </div>
          <div className="px-3 py-1 bg-secondary text-white rounded-full text-sm">
            {new Date().toLocaleString()}
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow overflow-hidden">
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4 overflow-hidden">
          <div className="flex-grow relative overflow-hidden rounded-lg border border-border bg-card">
            <EmergencyMap data={mapData} isLoading={isLoading} />
          </div>
          
          <div className="h-1/3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VideoFeed currentFeed={mapData.videoFeeds[0]} />
            <EvacuationRoutes routes={mapData.evacuationRoutes} />
          </div>
        </div>
        
        <div className="flex flex-col gap-4 overflow-hidden">
          <StatusPanel 
            dangerZones={mapData.dangerZones.length} 
            responders={mapData.responders.length}
            safeRoutes={mapData.evacuationRoutes.length}
          />
          <AlertsPanel alerts={mapData.alerts} className="flex-grow overflow-y-auto" />
          <ResponderList responders={mapData.responders} className="h-1/3 overflow-y-auto" />
        </div>
      </div>
    </div>
  );
};

export default Index;
