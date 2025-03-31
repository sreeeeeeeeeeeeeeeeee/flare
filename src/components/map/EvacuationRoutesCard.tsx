
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Route } from '@/types/mapTypes';
import { formatDistance } from '@/utils/mapUtils';

// Status configuration
const statusConfig = {
  open: { text: "ACTIVE", bg: "bg-green-100", border: "border-green-300", textColor: "text-green-800" },
  congested: { text: "CONGESTED", bg: "bg-amber-100", border: "border-amber-300", textColor: "text-amber-800" },
  closed: { text: "CLOSED", bg: "bg-red-100", border: "border-red-300", textColor: "text-red-800" }
};

interface EvacuationRoutesCardProps {
  routes: Route[];
  isLoading?: boolean;
  className?: string;
}

const EvacuationRoutesCard: React.FC<EvacuationRoutesCardProps> = ({ 
  routes, 
  isLoading = false,
  className = ""
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <h3 className="font-bold">Evacuation Routes</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format route display information
  const displayRoutes = routes.map(route => {
    const distance = route.path ? formatDistance(route.path) : "Unknown";
    const updated = route.updatedAt ? route.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown";
    
    // Generate route name if not available
    const name = `${route.start} → ${route.end}`;
    
    // Generate appropriate instructions based on status
    let instructions = "";
    switch (route.status) {
      case "open":
        instructions = "Follow emergency vehicles - clear path ahead";
        break;
      case "congested":
        instructions = "Heavy traffic - expect delays";
        break;
      case "closed":
        instructions = "Route blocked - use alternate path";
        break;
    }
    
    return {
      id: route.id,
      name,
      status: route.status,
      distance,
      updated,
      instructions
    };
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-2 bg-gray-100">
        <h3 className="font-bold">Evacuation Routes</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {displayRoutes.map(route => (
            <div key={route.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{route.name}</h4>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusConfig[route.status].bg} ${statusConfig[route.status].border} ${statusConfig[route.status].textColor}`}>
                  {statusConfig[route.status].text}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span className="text-gray-600">Distance:</span>
                  <span className="ml-1 font-medium">{route.distance}</span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <span className="ml-1 font-medium">{route.updated}</span>
                </div>
              </div>
              {route.instructions && (
                <div className="text-sm bg-blue-50 p-2 rounded text-blue-800">
                  <span className="font-medium">⚠️ Note:</span> {route.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvacuationRoutesCard;
