
import { VideoIcon, AlertTriangle, Camera, CameraOff } from 'lucide-react';
import { VideoFeedType } from '@/types/emergency';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

type VideoFeedProps = {
  currentFeed: VideoFeedType;
};

const VideoFeed = ({ currentFeed }: VideoFeedProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [feedIndex, setFeedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Simulate video feed changes
    const interval = setInterval(() => {
      if (isPlaying && currentFeed.relatedFeeds.length > 0) {
        setFeedIndex(prevIndex => (prevIndex + 1) % (currentFeed.relatedFeeds.length + 1));
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentFeed.relatedFeeds.length, isPlaying]);

  useEffect(() => {
    // Play/pause video based on isPlaying state
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, feedIndex]);

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

  const toggleVideoFeed = () => {
    setShowVideo(prev => !prev);
  };

  return (
    <div className="flex flex-col border border-border rounded-lg bg-card h-full overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <VideoIcon className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Live Video Feed</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost"
            size="icon"
            onClick={toggleVideoFeed}
            title={showVideo ? "Disable feed" : "Enable feed"}
          >
            {showVideo ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs px-2 py-1 rounded"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      </div>
      
      <div className="relative flex-grow">
        <div className="video-feed h-full">
          {showVideo ? (
            getCurrentFeedSrc().endsWith('.mp4') ? (
              <video 
                ref={videoRef}
                src={getCurrentFeedSrc()} 
                className="object-cover w-full h-full"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img 
                src={getCurrentFeedSrc()} 
                alt="Video feed" 
                className="object-cover w-full h-full"
              />
            )
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-black/90">
              <div className="text-center text-white">
                <CameraOff className="mx-auto mb-2 h-10 w-10 opacity-50" />
                <p className="text-sm">Feed disabled</p>
              </div>
            </div>
          )}
          
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
