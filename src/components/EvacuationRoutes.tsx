
import { useEffect } from 'react';
import { useIsInMapContainer } from '@/hooks/useLeafletContext';
import { useEvacuationRoutes } from '@/hooks/useEvacuationRoutes';
import { EvacuationRouteType } from '@/types/emergency';
import StandaloneEvacuationRoutes from './evacuation/StandaloneEvacuationRoutes';
import MapEvacuationRoutes from './evacuation/MapEvacuationRoutes';

interface EvacuationRoutesProps {
  routes: EvacuationRouteType[];
  standalone?: boolean;
}

const EvacuationRoutes = ({ routes, standalone = false }: EvacuationRoutesProps) => {
  const { computedRoutes, isLoading, calculateRoutes } = useEvacuationRoutes(routes);
  const isInMapContainer = standalone ? false : useIsInMapContainer();
  
  useEffect(() => {
    if (!standalone && !isLoading && isInMapContainer) {
      calculateRoutes();
    }
  }, [standalone, isInMapContainer, calculateRoutes, isLoading]);

  // For standalone view outside map, convert evacuation routes to standard route format
  if (standalone) {
    const standaloneRoutes = routes.map(route => ({
      id: route.id,
      path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      status: route.status,
      start: route.startPoint,
      end: route.endPoint,
      updatedAt: new Date()
    }));
    
    return <StandaloneEvacuationRoutes routes={standaloneRoutes} isLoading={false} />;
  }

  // Map view for routes
  if (!isInMapContainer) {
    console.log("EvacuationRoutes: Not rendering map elements because we're not in a MapContainer");
    return null;
  }

  return <MapEvacuationRoutes routes={computedRoutes} isLoading={isLoading} />;
};

export default EvacuationRoutes;
