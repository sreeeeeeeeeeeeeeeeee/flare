
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import EmergencyMap from '@/components/EmergencyMap';
import VideoFeed from '@/components/VideoFeed';
import EvacuationRoutes from '@/components/EvacuationRoutes';
import PublicAlerts from '@/components/PublicAlerts';
import StatusPanel from '@/components/StatusPanel';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { mockDataService } from '@/services/mockDataService';

const UserDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState(mockDataService.getInitialData());
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "System Ready",
        description: "Live monitoring connected successfully",
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const updatedData = mockDataService.getUpdatedData();
      setMapData(updatedData);
      
      // Only show public alert notifications to users (not technical/operational ones)
      const publicAlerts = updatedData.alerts.filter(
        alert => alert.isNew && alert.visibility === 'public'
      );
      
      if (publicAlerts.length > 0) {
        publicAlerts.forEach(alert => {
          toast({
            title: "Public Alert",
            description: alert.message,
            variant: "destructive",
          });
        });
      }
    }, 5000);
    
    return () => clearInterval(updateInterval);
  }, [toast]);

  return (
    <div className="min-h-screen h-full flex flex-col p-4 gap-4 overflow-auto">
      <header className="flex items-center justify-between mb-2 sticky top-0 z-10 bg-background py-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-danger" />
          <h1 className="text-2xl font-bold">FLARE</h1>
          <div className="px-3 py-1 bg-primary text-white rounded-full text-sm ml-2">
            Public View
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-1 text-sm px-3 py-1 rounded-md bg-secondary hover:bg-secondary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin View
          </Link>
          <div className="px-3 py-1 bg-danger text-white rounded-full text-sm font-medium animate-pulse-danger">
            LIVE
          </div>
          <div className="px-3 py-1 bg-secondary text-white rounded-full text-sm">
            {new Date().toLocaleString()}
          </div>
        </div>
      </header>
      
      <ScrollArea className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
            <div className="h-[400px] relative overflow-hidden rounded-lg border border-border bg-card">
              <EmergencyMap data={mapData} isLoading={isLoading} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VideoFeed currentFeed={mapData.videoFeeds[0]} />
              {/* Use standalone mode for evacuation routes when not inside a MapContainer */}
              <EvacuationRoutes routes={mapData.evacuationRoutes} standalone={true} />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <StatusPanel 
              dangerZones={mapData.dangerZones.length} 
              responders={mapData.responders.length}
              safeRoutes={mapData.evacuationRoutes.length}
            />
            <ScrollArea className="h-[400px] rounded-lg border border-border">
              <PublicAlerts alerts={mapData.alerts} className="p-2" />
            </ScrollArea>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserDashboard;
