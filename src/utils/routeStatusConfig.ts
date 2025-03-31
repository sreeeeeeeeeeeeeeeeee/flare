
// Shared route status configuration used across components
export const statusConfig = {
  open: { 
    display: "OPEN", 
    color: "#22c55e", 
    panelClass: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    mapOptions: { color: "#22c55e", weight: 6 }
  },
  congested: { 
    display: "CONGESTED", 
    color: "#f97316", 
    panelClass: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    mapOptions: { color: "#f97316", weight: 6, dashArray: "5, 5" }
  },
  closed: { 
    display: "CLOSED", 
    color: "#ef4444", 
    panelClass: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    mapOptions: { color: "#ef4444", weight: 6, dashArray: "10, 6" }
  }
};

// Format utility functions
export const formatUpdateTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDistance = (distance: number) => {
  return `${distance.toFixed(1)} km`;
};
