
/**
 * Type definitions for map components and data
 */

export type RouteStatus = 'open' | 'congested' | 'closed';

export type Route = {
  id: string;
  path: [number, number][];
  status: RouteStatus;
  start: string;
  end: string;
  updatedAt: Date;
};

export type RouteStatusBadgeVariant = "default" | "secondary" | "destructive" | "outline";
