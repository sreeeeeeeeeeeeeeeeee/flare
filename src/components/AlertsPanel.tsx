
import { AlertType } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';

type AlertsPanelProps = {
  alerts: AlertType[];
  className?: string;
};

const AlertsPanel = ({ alerts, className }: AlertsPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });
  
  return (
    <div className={cn("border border-border rounded-lg bg-card flex flex-col overflow-hidden", className)}>
      <div className="p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-danger" />
          <h3 className="font-medium text-sm">Emergency Alerts</h3>
        </div>
        
        <div className="flex gap-1 text-xs">
          <button 
            onClick={() => setFilter('all')}
            className={cn(
              "px-2 py-0.5 rounded",
              filter === 'all' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('critical')}
            className={cn(
              "px-2 py-0.5 rounded",
              filter === 'critical' ? "bg-danger text-destructive-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Critical
          </button>
          <button 
            onClick={() => setFilter('warning')}
            className={cn(
              "px-2 py-0.5 rounded",
              filter === 'warning' ? "bg-warning text-destructive-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            Warning
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No alerts matching the current filter
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={cn(
                "p-3 rounded border text-sm",
                alert.isNew && "animate-pulse",
                alert.severity === 'critical' && "bg-danger/10 border-danger",
                alert.severity === 'warning' && "bg-warning/10 border-warning",
                alert.severity === 'info' && "bg-info/10 border-info"
              )}
            >
              <div className="flex items-start gap-2">
                {alert.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />}
                {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />}
                {alert.severity === 'info' && <Info className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />}
                
                <div className="flex-grow">
                  <div className="font-medium">{alert.title}</div>
                  <p className="text-muted-foreground text-xs mt-1">{alert.message}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {alert.location}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {alert.time}
                    </span>
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

export default AlertsPanel;
