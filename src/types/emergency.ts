
export type Position = {
  latitude: number;
  longitude: number;
  locationName: string;
};

export type ResponderType = {
  id: string;
  name: string;
  type: 'drone' | 'police' | 'fire' | 'medical';
  status: 'active' | 'en-route' | 'standby';
  position: Position;
};

export type DangerZoneType = {
  id: string;
  type: 'wildfire' | 'flood' | 'chemical' | 'other';
  riskLevel: 'high' | 'medium' | 'low';
  forestRegion?: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
};

export type EvacuationRouteType = {
  id: string;
  startPoint: string;
  endPoint: string;
  status: 'open' | 'congested' | 'closed';
  estimatedTime: number;
  transportMethods: Array<'car' | 'foot' | 'emergency'>;
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
};

export type AlertType = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  location: string;
  isNew: boolean;
  visibility?: 'public' | 'admin' | 'all';
};

export type VideoFeedType = {
  id: string;
  type: 'drone' | 'traffic' | 'fixed';
  source: string;
  thumbnail?: string;
  location: string;
  hasAlert: boolean;
  relatedFeeds: Array<{
    id: string;
    source: string;
    thumbnail?: string;
    location: string;
  }>;
};

export type MapDataType = {
  responders: ResponderType[];
  dangerZones: DangerZoneType[];
  evacuationRoutes: EvacuationRouteType[];
  alerts: AlertType[];
  videoFeeds: VideoFeedType[];
};

export type MistissiniRegion = {
  center: {
    lat: number;
    lng: number;
  };
  name: string;
  description?: string;
};
