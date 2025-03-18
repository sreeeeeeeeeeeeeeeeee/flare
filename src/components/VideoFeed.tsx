
import { VideoIcon, AlertTriangle } from 'lucide-react';
import { VideoFeedType } from '@/types/emergency';
import { useState, useEffect } from 'react';

type VideoFeedProps = {
  currentFeed: VideoFeedType;
};

const VideoFeed = ({ currentFeed }: VideoFeedProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [feedIndex, setFeedIndex] = useState(0);
  
  useEffect(() => {
    // Simulate video feed changes
    const interval = setInterval(() => {
      if (isPlaying && currentFeed.relatedFeeds.length > 0) {
        setFeedIndex(prevIndex => (prevIndex + 1) % (currentFeed.relatedFeeds.length + 1));
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentFeed.relatedFeeds.length, isPlaying]);

  const getCurrentFeedSrc = () => {
    if (feedIndex === 0) {
      return currentFeed.source;
    }
    return currentFeed.relatedFeeds[feedIndex - 1].source;
  };
  
  const getCurrentFeedLocation = () => {
    if (feedIndex === 0) {
      return currentFeed.location;
    }
    return currentFeed.relatedFeeds[feedIndex - 1].location;
  };

  return (
    <div className="flex flex-col border border-border rounded-lg bg-card h-full overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <VideoIcon className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Live Video Feed</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>
      
      <div className="relative flex-grow">
        <div className="video-feed h-full">
          {/* This would be a real video feed in a production environment */}
          <img 
            src={getCurrentFeedSrc()} 
            alt="Video feed" 
            className="object-cover w-full h-full"
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                  <span className="text-xs font-medium">LIVE</span>
                </div>
                <div className="text-sm font-medium">{getCurrentFeedLocation()}</div>
              </div>
              
              {currentFeed.hasAlert && (
                <div className="flex items-center gap-1 bg-danger/20 border border-danger rounded px-2 py-1">
                  <AlertTriangle className="h-3 w-3 text-danger" />
                  <span className="text-xs font-medium text-danger">Alert</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t border-border">
        <div className="flex gap-1 overflow-x-auto">
          {[currentFeed, ...currentFeed.relatedFeeds].map((feed, idx) => (
            <button 
              key={idx}
              onClick={() => setFeedIndex(idx)}
              className={`flex-shrink-0 w-12 h-8 rounded overflow-hidden border-2 ${feedIndex === idx ? 'border-primary' : 'border-transparent'}`}
            >
              <img 
                src={feed.thumbnail || feed.source} 
                alt={`Feed ${idx}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
