
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Skeleton } from '@/components/ui/skeleton';
import { MapDataType } from '@/types/emergency';

// IMPORTANT: Replace this with your actual Mapbox token in a production environment
// Ideally, this would come from environment variables or a secure backend
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xydTk2cjhpMWllYTJrcWRza2FxdDVvNyJ9.mbHMrJqJJdL7_4nRfrCjVA';

type EmergencyMapProps = {
  data: MapDataType;
  isLoading: boolean;
};

const EmergencyMap = ({ data, isLoading }: EmergencyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxTokenInput, setMapboxTokenInput] = useState(MAPBOX_TOKEN);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  useEffect(() => {
    if (!mapboxTokenInput || isLoading || !mapContainer.current || map.current) return;
    
    try {
      mapboxgl.accessToken = mapboxTokenInput;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-119.417931, 36.778259], // California center
        zoom: 6,
        pitch: 40,
      });
      
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );
      
      map.current.on('load', () => {
        setIsMapLoaded(true);
        setIsTokenValid(true);
        
        if (map.current) {
          // Add danger zone layer
          map.current.addSource('danger-zones', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });
          
          map.current.addLayer({
            id: 'danger-zone-fill',
            type: 'fill',
            source: 'danger-zones',
            paint: {
              'fill-color': '#ea384c',
              'fill-opacity': 0.3
            }
          });
          
          map.current.addLayer({
            id: 'danger-zone-border',
            type: 'line',
            source: 'danger-zones',
            paint: {
              'line-color': '#ea384c',
              'line-width': 2,
              'line-dasharray': [2, 1]
            }
          });
          
          // Add evacuation routes layer
          map.current.addSource('evacuation-routes', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });
          
          map.current.addLayer({
            id: 'evacuation-routes',
            type: 'line',
            source: 'evacuation-routes',
            paint: {
              'line-color': '#22c55e',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });
        }
      });
      
      map.current.on('error', () => {
        setIsTokenValid(false);
      });
      
      return () => {
        map.current?.remove();
        map.current = null;
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setIsTokenValid(false);
    }
  }, [mapboxTokenInput, isLoading]);
  
  // Update map data when it changes
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    // Update danger zones
    const dangerZonesSource = map.current.getSource('danger-zones') as mapboxgl.GeoJSONSource;
    if (dangerZonesSource) {
      dangerZonesSource.setData({
        type: 'FeatureCollection',
        features: data.dangerZones.map(zone => ({
          type: 'Feature',
          geometry: zone.geometry,
          properties: {
            id: zone.id,
            riskLevel: zone.riskLevel,
            type: zone.type
          }
        }))
      });
    }
    
    // Update evacuation routes
    const routesSource = map.current.getSource('evacuation-routes') as mapboxgl.GeoJSONSource;
    if (routesSource) {
      routesSource.setData({
        type: 'FeatureCollection',
        features: data.evacuationRoutes.map(route => ({
          type: 'Feature',
          geometry: route.geometry,
          properties: {
            id: route.id,
            status: route.status,
            transportMethods: route.transportMethods
          }
        }))
      });
    }
    
    // Update responder markers
    const existingMarkerIds = Object.keys(markersRef.current);
    
    // Add or update markers
    data.responders.forEach(responder => {
      let marker = markersRef.current[responder.id];
      
      if (!marker) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'flex flex-col items-center';
        
        const dot = document.createElement('div');
        dot.className = `pulse-marker bg-${responder.type === 'drone' ? 'info' : responder.type === 'police' ? 'primary' : 'responder'}`;
        el.appendChild(dot);
        
        const label = document.createElement('div');
        label.className = 'text-xs font-semibold bg-background/80 px-1 rounded-sm -mt-1';
        label.textContent = responder.name;
        el.appendChild(label);
        
        marker = new mapboxgl.Marker(el)
          .setLngLat([responder.position.longitude, responder.position.latitude])
          .addTo(map.current!);
          
        markersRef.current[responder.id] = marker;
      } else {
        // Update existing marker position
        marker.setLngLat([responder.position.longitude, responder.position.latitude]);
      }
    });
    
    // Remove markers that no longer exist in the data
    const currentMarkerIds = data.responders.map(r => r.id);
    existingMarkerIds.forEach(id => {
      if (!currentMarkerIds.includes(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
    
  }, [data, isMapLoaded]);
  
  if (isLoading) {
    return <Skeleton className="w-full h-full rounded-lg" />;
  }
  
  if (!isTokenValid) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-danger mb-4">Invalid Mapbox Token</div>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Please enter a valid Mapbox token to display the emergency map.
          You can get one by signing up at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
        </p>
        <div className="w-full max-w-md">
          <input
            type="text"
            value={mapboxTokenInput}
            onChange={(e) => setMapboxTokenInput(e.target.value)}
            placeholder="Enter your Mapbox token..."
            className="w-full p-2 bg-background border border-input rounded-md mb-2"
          />
          <button 
            onClick={() => {
              if (map.current) {
                map.current.remove();
                map.current = null;
              }
              setIsMapLoaded(false);
            }}
            className="w-full p-2 bg-primary text-primary-foreground rounded-md"
          >
            Apply Token
          </button>
        </div>
      </div>
    );
  }
  
  return <div ref={mapContainer} className="w-full h-full" />;
};

export default EmergencyMap;
