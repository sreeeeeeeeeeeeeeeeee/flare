
import { VideoIcon, AlertTriangle } from 'lucide-react';
import { VideoFeedType } from '@/types/emergency';
import { useState, useEffect } from 'react';
import VideoFeedControls from './VideoFeedControls';
import VideoContent from './VideoContent';
import FeedThumbnails from './FeedThumbnails';

type VideoFeedProps = {
  currentFeed: VideoFeedType;
};

const VideoFeed = ({ currentFeed }: VideoFeedProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [feedIndex, setFeedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(true);
  const [videoError, setVideoError] = useState(false);
  
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
    // Reset error state when feed changes
    setVideoError(false);
  }, [feedIndex]);

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

  const getThumbnailSrc = () => {
    if (feedIndex === 0) {
      return currentFeed.thumbnail || currentFeed.source;
    }
    return currentFeed.relatedFeeds[feedIndex - 1].thumbnail || currentFeed.relatedFeeds[feedIndex - 1].source;
  };

  const toggleVideoFeed = () => {
    setShowVideo(prev => !prev);
  };

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="flex flex-col border border-border rounded-lg bg-card h-full overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <VideoIcon className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Live Video Feed</h3>
        </div>
        <VideoFeedControls 
          isPlaying={isPlaying}
          showVideo={showVideo}
          onTogglePlay={togglePlayback}
          onToggleVideo={toggleVideoFeed}
        />
      </div>
      
      <div className="relative flex-grow">
        <div className="video-feed h-full">
          <VideoContent 
            currentSrc={getCurrentFeedSrc()}
            showVideo={showVideo}
            videoError={videoError}
            isPlaying={isPlaying}
            getThumbnailSrc={getThumbnailSrc}
            setVideoError={setVideoError}
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
        <FeedThumbnails 
          feeds={currentFeed.relatedFeeds}
          currentFeed={currentFeed}
          feedIndex={feedIndex}
          onSelectFeed={setFeedIndex}
        />
      </div>
    </div>
  );
};

export default VideoFeed;
