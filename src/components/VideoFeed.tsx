
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
  const [videoError, setVideoError] = useState(false);
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
    // Reset error state when feed changes
    setVideoError(false);
    
    // Play/pause video based on isPlaying state
    if (videoRef.current && isVideoSource(getCurrentFeedSrc()) && !isYouTubeURL(getCurrentFeedSrc())) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
          setVideoError(true);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, feedIndex]);

  const isVideoSource = (src: string): boolean => {
    return src.endsWith('.mp4') || src.includes('video') || src.includes('mixkit');
  };

  const isYouTubeURL = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedURL = (url: string): string => {
    // Extract video ID from YouTube URL
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      // Regular YouTube URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be')) {
      // Shortened YouTube URL
      videoId = url.split('/').pop() || '';
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? '1' : '0'}&mute=1&controls=1&loop=1`;
  };

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

  const renderVideoContent = () => {
    const currentSrc = getCurrentFeedSrc();
    
    if (!showVideo) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-black/90">
          <div className="text-center text-white">
            <CameraOff className="mx-auto mb-2 h-10 w-10 opacity-50" />
            <p className="text-sm">Feed disabled</p>
          </div>
        </div>
      );
    }
    
    if (videoError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-black/80">
          <div className="text-center text-white">
            <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-danger" />
            <p className="text-sm">Video feed unavailable</p>
            <img 
              src={getThumbnailSrc()} 
              alt="Video thumbnail" 
              className="object-cover w-full h-full absolute top-0 left-0 opacity-30 z-0"
              style={{ filter: 'blur(4px)' }}
            />
          </div>
        </div>
      );
    }
    
    if (isYouTubeURL(currentSrc)) {
      return (
        <iframe
          src={getYouTubeEmbedURL(currentSrc)}
          className="object-cover w-full h-full"
          frameBorder="0"
          allowFullScreen
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      );
    } else if (isVideoSource(currentSrc)) {
      return (
        <video 
          ref={videoRef}
          src={currentSrc} 
          className="object-cover w-full h-full"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      );
    }
    
    return (
      <img 
        src={currentSrc} 
        alt="Video feed" 
        className="object-cover w-full h-full"
      />
    );
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
          {renderVideoContent()}
          
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
