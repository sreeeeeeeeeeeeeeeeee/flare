
import React from 'react';
import { Polygon, Popup } from 'react-leaflet';
import { DangerZoneType } from '@/types/emergency';
import { Flame, TreePine } from 'lucide-react';
import { useIsInMapContainer } from '@/hooks/useLeafletContext';

interface DangerZonesProps {
  zones: DangerZoneType[];
}

const DangerZones: React.FC<DangerZonesProps> = ({ zones }) => {
  const isInMapContainer = useIsInMapContainer();
  
  if (!isInMapContainer) {
    return null;
  }

  return (
    <>
      {zones.map((zone) => {
        // Convert polygon coordinates to [lat, lng] format for react-leaflet
        const positions = zone.geometry.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);
        
        return (
          <Polygon
            key={`zone-${zone.id}`}
            positions={positions}
            pathOptions={{
              fillColor: '#ea384c',
              fillOpacity: 0.4,
              weight: 2,
              opacity: 0.8,
              color: '#ea384c',
              dashArray: '3, 3'
            }}
          >
            <Popup>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Flame className="h-4 w-4 text-danger" />
                {zone.type === 'wildfire' ? 'Forest Fire' : zone.type.toUpperCase()}
              </div>
              <div className="text-xs">Risk Level: {zone.riskLevel}</div>
              <div className="text-xs">Forest Region: {zone.forestRegion || 'Mistissini Area'}</div>
              <div className="text-xs flex items-center gap-1 mt-1">
                <TreePine className="h-3 w-3 text-emerald-600" />
                <span>Affected Forest Area</span>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
};

export default DangerZones;
