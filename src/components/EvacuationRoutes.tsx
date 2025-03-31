
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

  // For both standalone and map views, we'll use the same computed routes data
  // to ensure consistency between displays
  const routesToDisplay = computedRoutes.map(route => ({
    id: route.id,
    path: route.path,
    status: route.status,
    start: route.start,
    end: route.end,
    updatedAt: route.updatedAt
  }));
  
  // For standalone view outside map
  if (standalone) {
    return <StandaloneEvacuationRoutes 
      routes={routesToDisplay} 
      isLoading={isLoading} 
    />;
  }

  // Map view for routes
  if (!isInMapContainer) {
    console.log("EvacuationRoutes: Not rendering map elements because we're not in a MapContainer");
    return null;
  }

  return <MapEvacuationRoutes routes={routesToDisplay} isLoading={isLoading} />;
};

export default EvacuationRoutes;
