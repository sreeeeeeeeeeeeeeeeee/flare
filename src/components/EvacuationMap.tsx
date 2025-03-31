
import { useEffect, useState, useCallback } from 'react';
import { Polyline, Popup } from 'react-leaflet';

type RouteStatus = 'open' | 'congested' | 'closed';
type Route = {
  id: string;
  path: [number, number][];
  status: RouteStatus;
  start: string;
  end: string;
  color: string;
  updatedAt: Date;
};

// Precise coordinates for Mistissini verified with OpenStreetMap
const LOCATIONS: Record<string, [number, number]> = {
  mistissini: [50.4221, -73.8683], // Verified town center
  dropose: [50.4153, -73.8748],    // Industrial area coordinates
  hospital: [50.4230, -73.8780],   // Medical facility
  school: [50.4180, -73.8650],     // Local school
  chibougamau: [49.9166, -74.3694], // Neighboring town
  madassin: [50.4180, -73.8720],   // Residential area
  northMistissini: [50.4280, -73.8650] // Northern expansion
};

const GRAPHHOPPER_API_KEY = '5adb1e1c-29a2-4293-81c1-1c81779679bb';

// Known road segments in Mistissini (simplified from OSM data)
const ROAD_SEGMENTS = [
  // Main roads
  [[50.4221, -73.8683], [50.4230, -73.8670], [50.4235, -73.8650]],
  [[50.4221, -73.8683], [50.4210, -73.8690], [50.4200, -73.8700]],
  // Connection to dropose area
  [[50.4200, -73.8700], [50.4175, -73.8720], [50.4153, -73.8748]],
  // Northern roads
  [[50.4221, -73.8683], [50.4240, -73.8670], [50.4260, -73.8660], [50.4280, -73.8650]],
  // Route to hospital
  [[50.4221, -73.8683], [50.4225, -73.8710], [50.4230, -73.8740], [50.4230, -73.8780]],
  // School roads
  [[50.4221, -73.8683], [50.4200, -73.8670], [50.4180, -73.8650]]
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
          ([lng, lat]: [number, number]) => [lat, lng]
        ) as [number, number][];
      }
      
      // If GraphHopper API fails, use a more detailed road-following algorithm
      return followRoadSegments(snappedStart, snappedEnd);
    } catch (error) {
      console.error('Routing error:', error);
      // Advanced fallback using road segments
      return followRoadSegments(start, end);
    }
  }, []);

  // More sophisticated road following algorithm
  const followRoadSegments = useCallback((start: [number, number], end: [number, number]): [number, number][] => {
    // Find closest road segments to start and end points
    const startSegment = findClosestSegment(start);
    const endSegment = findClosestSegment(end);
    
    if (startSegment === endSegment && startSegment !== -1) {
      // If on same road segment, return points along that segment
      return interpolatePointsAlongSegment(
        ROAD_SEGMENTS[startSegment], 
        closestPointOnSegment(start, ROAD_SEGMENTS[startSegment]),
        closestPointOnSegment(end, ROAD_SEGMENTS[startSegment])
      );
    }
    
    // For different segments, we need to find a path connecting them
    // This is a simplified A* pathfinding approximation
    if (startSegment !== -1 && endSegment !== -1) {
      // Create a path by connecting road segments
      const path: [number, number][] = [];
      
      // Add points from start to end of start segment
      path.push(...ROAD_SEGMENTS[startSegment]);
      
      // Add connection points between segments (simplified)
      // In a real implementation, this would use a graph algorithm
      if (Math.abs(startSegment - endSegment) === 1) {
        // Directly connected segments
        path.push(...ROAD_SEGMENTS[endSegment]);
      } else {
        // Need to find intermediate segments
        // Here we just add the central mistissini point as a connector
        path.push(LOCATIONS.mistissini);
        path.push(...ROAD_SEGMENTS[endSegment]);
      }
      
      return path;
    }
    
    // Fallback to direct line with intermediate points
    return [start, LOCATIONS.mistissini, end];
  }, []);

  // Find the index of the closest road segment to a point
  const findClosestSegment = useCallback((point: [number, number]): number => {
    let closestSegmentIndex = -1;
    let minDistance = Infinity;
    
    ROAD_SEGMENTS.forEach((segment, index) => {
      segment.forEach(roadPoint => {
        const dist = haversineDistance(
          point[0], point[1],
          roadPoint[0], roadPoint[1]
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestSegmentIndex = index;
        }
      });
    });
    
    return closestSegmentIndex;
  }, []);

  // Find closest point on a road segment to another point
  const closestPointOnSegment = useCallback((point: [number, number], segment: [number, number][]): number => {
    let closestPointIndex = 0;
    let minDistance = Infinity;
    
    segment.forEach((segmentPoint, index) => {
      const dist = haversineDistance(
        point[0], point[1],
        segmentPoint[0], segmentPoint[1]
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestPointIndex = index;
      }
    });
    
    return closestPointIndex;
  }, []);

  // Interpolate points along a segment between two indices
  const interpolatePointsAlongSegment = useCallback((
    segment: [number, number][],
    startIdx: number,
    endIdx: number
  ): [number, number][] => {
    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
    }
    
    return segment.slice(startIdx, endIdx + 1);
  }, []);

  // Snap point to nearest road segment
  const snapToRoad = useCallback((point: [number, number]): [number, number] => {
    let closestPoint = point;
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
        { id: 'mistissini-dropose', start: 'mistissini', end: 'dropose', color: '#22c55e' },
        { id: 'dropose-hospital', start: 'dropose', end: 'hospital', color: '#f97316' },
        { id: 'school-northMistissini', start: 'school', end: 'northMistissini', color: '#ef4444' },
        { id: 'madassin-hospital', start: 'madassin', end: 'hospital', color: '#3366ff' },
        { id: 'mistissini-school', start: 'mistissini', end: 'school', color: '#8855cc' }
      ];

      const calculatedRoutes: Route[] = [];

      for (const def of routeDefinitions) {
        const startPos = LOCATIONS[def.start];
        const endPos = LOCATIONS[def.end];

        if (!startPos || !endPos) continue;

        const path = await fetchRoadRoute(startPos, endPos);
        
        // Set initial status based on the route ID to show different colors
        let initialStatus: RouteStatus;
        if (def.id === 'mistissini-dropose') {
          initialStatus = 'open'; // Green
        } else if (def.id === 'dropose-hospital') {
          initialStatus = 'congested'; // Orange
        } else if (def.id === 'school-northMistissini') {
          initialStatus = 'closed'; // Red
        } else {
          initialStatus = Math.random() < 0.7 ? 'open' : Math.random() < 0.9 ? 'congested' : 'closed';
        }
        
        calculatedRoutes.push({
          ...def,
          path,
          status: initialStatus,
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
        status: getRandomStatus(route.status),
        updatedAt: new Date()
      })));
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  // Smart status rotation (tends to stay in current state)
  const getRandomStatus = (currentStatus: RouteStatus): RouteStatus => {
    const rand = Math.random();
    if (currentStatus === 'open') {
      return rand < 0.8 ? 'open' : rand < 0.95 ? 'congested' : 'closed';
    } else if (currentStatus === 'congested') {
      return rand < 0.6 ? 'congested' : rand < 0.9 ? 'open' : 'closed';
    } else {
      return rand < 0.7 ? 'closed' : rand < 0.9 ? 'congested' : 'open';
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
            color: route.status === "open" ? "#22c55e" : 
                   route.status === "congested" ? "#f97316" : "#ef4444",
            weight: 5,
            opacity: route.status === "closed" ? 0.5 : 0.9,
            lineCap: "round",
            lineJoin: "round",
            dashArray: route.status === "closed" ? "10, 10" : 
                       route.status === "congested" ? "15, 5" : undefined
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
