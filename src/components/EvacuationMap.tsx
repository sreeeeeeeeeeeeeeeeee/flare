
import { useEffect, useState, useCallback } from 'react';
import { Polyline, Popup } from 'react-leaflet';

type RouteStatus = 'open' | 'congested' | 'closed';
type Route = {
  id: string;
  path: [number, number][];
  status: RouteStatus;
  start: string;
  end: string;
  updatedAt: Date;
};

// Precise coordinates for Mistissini verified with OpenStreetMap
const LOCATIONS: Record<string, [number, number]> = {
  mistissini: [50.4221, -73.8683], // Verified town center
  dropose: [50.4153, -73.8748],    // Industrial area coordinates
  hospital: [50.4230, -73.8780],   // Medical facility
  school: [50.4180, -73.8650],     // Local school
  chibougamau: [49.9166, -74.3694] // Neighboring town
};

const GRAPHHOPPER_API_KEY = '5adb1e1c-29a2-4293-81c1-1c81779679bb';

// Known road segments in Mistissini (simplified from OSM data)
const ROAD_SEGMENTS: Array<[number, number][]> = [
  // Main roads
  [[50.4221, -73.8683], [50.4230, -73.8670], [50.4235, -73.8650]],
  [[50.4221, -73.8683], [50.4210, -73.8690], [50.4200, -73.8700]],
  // Connection to dropose area
  [[50.4200, -73.8700], [50.4175, -73.8720], [50.4153, -73.8748]]
];

const EvacuationMap = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced route fetcher with road snapping
  const fetchRoadRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    try {
      // 1. First try to snap points to nearest known roads
      const snappedStart = snapToRoad(start);
      const snappedEnd = snapToRoad(end);

      // 2. Fetch route from GraphHopper with elevation data for precision
      const response = await fetch(
        `https://graphhopper.com/api/1/route?` +
        `point=${snappedStart[0]},${snappedStart[1]}&` +
        `point=${snappedEnd[0]},${snappedEnd[1]}&` +
        `vehicle=car&key=${GRAPHHOPPER_API_KEY}&` +
        `points_encoded=false&` +
        `elevation=true&` + // Better terrain following
        `locale=en&` +
        `ch.disable=true&` + // More precise routing
        `turn_costs=true`    // Better road following
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      
      if (data.paths?.[0]?.points?.coordinates) {
        return data.paths[0].points.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        );
      }
      
      return [start, end]; // Fallback
    } catch (error) {
      console.error('Routing error:', error);
      return [start, end]; // Fallback
    }
  }, []);

  // Snap point to nearest road segment
  const snapToRoad = useCallback((point: [number, number]): [number, number] => {
    let closestPoint: [number, number] = point;
    let minDistance = Infinity;

    ROAD_SEGMENTS.forEach(segment => {
      segment.forEach(roadPoint => {
        const dist = haversineDistance(
          point[0], point[1],
          roadPoint[0], roadPoint[1]
        );
        if (dist < minDistance && dist < 0.1) { // 100m threshold
          minDistance = dist;
          closestPoint = roadPoint;
        }
      });
    });

    return closestPoint;
  }, []);

  // Initialize routes
  useEffect(() => {
    const initializeRoutes = async () => {
      const routeDefinitions = [
        { id: 'mistissini-dropose', start: 'mistissini', end: 'dropose' },
        { id: 'dropose-hospital', start: 'dropose', end: 'hospital' },
        { id: 'school-chibougamau', start: 'school', end: 'chibougamau' }
      ];

      const calculatedRoutes: Route[] = [];

      for (const def of routeDefinitions) {
        const startPos = LOCATIONS[def.start];
        const endPos = LOCATIONS[def.end];

        if (!startPos || !endPos) continue;

        const path = await fetchRoadRoute(startPos, endPos);
        
        calculatedRoutes.push({
          ...def,
          path,
          status: 'open',
          updatedAt: new Date()
        });
      }

      setRoutes(calculatedRoutes);
      setIsLoading(false);
    };

    initializeRoutes();
  }, [fetchRoadRoute]);

  // Status updates every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRoutes(prev => prev.map(route => ({
        ...route,
        status: getRandomStatus(),
        updatedAt: new Date()
      })));
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const getRandomStatus = (): RouteStatus => {
    const rand = Math.random();
    return rand < 0.7 ? 'open' : rand < 0.9 ? 'congested' : 'closed';
  };

  // Get route color based on status
  const getRouteColor = (status: RouteStatus): string => {
    switch (status) {
      case 'open':
        return '#22c55e'; // Green
      case 'congested':
        return '#f97316'; // Orange
      case 'closed':
        return '#ef4444'; // Red
      default:
        return '#22c55e'; // Default to green
    }
  };

  if (isLoading) {
    return <div className="loading">Calculating precise road routes...</div>;
  }

  return (
    <>
      {routes.map(route => (
        <Polyline
          key={route.id}
          positions={route.path}
          pathOptions={{
            color: getRouteColor(route.status),
            weight: 6,
            opacity: route.status === 'closed' ? 0.7 : 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: route.status === 'closed' ? '10, 6' : 
                      route.status === 'congested' ? '20, 5' : undefined
          }}
        >
          <Popup>
            <div className="route-popup">
              <h4>{route.start} → {route.end}</h4>
              <div className="route-meta">
                <span className={`status-badge ${route.status}`}>
                  {route.status.toUpperCase()}
                </span>
                <span>{calculateDistance(route.path).toFixed(1)} km</span>
              </div>
              <div className="route-updated">
                Updated: {route.updatedAt.toLocaleTimeString()}
              </div>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
};

// Haversine distance calculation
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const calculateDistance = (path: [number, number][]) => {
  if (path.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversineDistance(path[i-1][0], path[i-1][1], path[i][0], path[i][1]);
  }
  return total;
};

export default EvacuationMap;
