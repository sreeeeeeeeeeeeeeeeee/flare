
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

  // Standalone view for routes (outside map)
  if (standalone) {
    return <StandaloneEvacuationRoutes routes={routes} isLoading={isLoading} />;
  }

  // Only render map elements if we're actually inside a MapContainer
  if (!isInMapContainer) {
    console.log("EvacuationRoutes: Not rendering map elements because we're not in a MapContainer");
    return null;
  }

  // Map view for routes
  return <MapEvacuationRoutes routes={computedRoutes} isLoading={isLoading} />;
};

export default EvacuationRoutes;
