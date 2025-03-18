
import { UserRound, Video, Navigation } from 'lucide-react';
import { ResponderType } from '@/types/emergency';
import { cn } from '@/lib/utils';

type ResponderListProps = {
  responders: ResponderType[];
  className?: string;
};

const ResponderList = ({ responders, className }: ResponderListProps) => {
  return (
    <div className={cn("border border-border rounded-lg bg-card flex flex-col overflow-hidden", className)}>
      <div className="p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-responder" />
          <h3 className="font-medium text-sm">First Responders</h3>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {responders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No responders available
          </div>
        ) : (
          responders.map(responder => (
            <div 
              key={responder.id}
              className="p-2 rounded border border-border flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                responder.type === 'drone' 
                  ? 'bg-info/20 text-info' 
                  : responder.type === 'police' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-responder/20 text-responder'
              }`}>
                {responder.type === 'drone' ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-grow">
                <div className="font-medium text-sm">{responder.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  <span>{responder.position.locationName}</span>
                </div>
              </div>
              
              <div className={`text-xs px-2 py-0.5 rounded-full ${
                responder.status === 'active' 
                  ? 'bg-safe/20 text-safe' 
                  : responder.status === 'en-route' 
                    ? 'bg-warning/20 text-warning' 
                    : 'bg-danger/20 text-danger'
              }`}>
                {responder.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResponderList;
