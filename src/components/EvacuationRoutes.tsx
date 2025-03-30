
import { ArrowRight, Route, Car, Truck, PersonStanding, MapPin } from 'lucide-react';
import { EvacuationRouteType } from '@/types/emergency';

type EvacuationRoutesProps = {
  routes: EvacuationRouteType[];
};

const EvacuationRoutes = ({ routes }: EvacuationRoutesProps) => {
  const sortedRoutes = [...routes].sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    return 0;
  });

  return (
    <div className="border border-border rounded-lg bg-card flex flex-col overflow-hidden h-full">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-safe" />
          <h3 className="font-medium text-sm">Evacuation Routes</h3>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {sortedRoutes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No evacuation routes available
          </div>
        ) : (
          sortedRoutes.map(route => (
            <div 
              key={route.id}
              className={`p-3 rounded border text-sm ${
                route.status === 'open' 
                  ? 'bg-safe/10 border-safe' 
                  : route.status === 'congested' 
                    ? 'bg-warning/10 border-warning' 
                    : 'bg-danger/10 border-danger'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-grow">
                  <div className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{route.startPoint}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{route.endPoint}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      route.status === 'open' 
                        ? 'bg-safe text-white' 
                        : route.status === 'congested' 
                          ? 'bg-warning text-white' 
                          : 'bg-danger text-white'
                    }`}>
                      {route.status.toUpperCase()}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {route.estimatedTime} min
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-1">Transport:</span>
                    {route.transportMethods.includes('car') && (
                      <Car className="h-3 w-3 text-muted-foreground" />
                    )}
                    {route.transportMethods.includes('emergency') && (
                      <Truck className="h-3 w-3 text-muted-foreground" />
                    )}
                    {route.transportMethods.includes('foot') && (
                      <PersonStanding className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EvacuationRoutes;
