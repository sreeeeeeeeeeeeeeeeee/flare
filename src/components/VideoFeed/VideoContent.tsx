
import { AlertTriangle, CameraOff } from 'lucide-react';
import { useRef, useEffect } from 'react';

type VideoContentProps = {
  currentSrc: string;
  showVideo: boolean;
  videoError: boolean;
  isPlaying: boolean;
  getThumbnailSrc: () => string;
  setVideoError: (error: boolean) => void;
};

const VideoContent = ({
  currentSrc,
  showVideo,
  videoError,
  isPlaying,
  getThumbnailSrc,
  setVideoError
}: VideoContentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
    
    // Add parameters for looping and autoplay
    // The loop=1 and playlist={videoId} parameters ensure the video loops
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? '1' : '0'}&mute=1&controls=1&loop=1&playlist=${videoId}`;
  };
  
  useEffect(() => {
    // Play/pause video based on isPlaying state
    if (videoRef.current && isVideoSource(currentSrc) && !isYouTubeURL(currentSrc)) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
          setVideoError(true);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentSrc, setVideoError]);

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
      <div className="w-full h-full flex items-start justify-start bg-black">
        <iframe
          src={getYouTubeEmbedURL(currentSrc)}
          className="w-[90%] h-[90%]"
          frameBorder="0"
          allowFullScreen
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      </div>
    );
  } else if (isVideoSource(currentSrc)) {
    return (
      <div className="w-full h-full flex items-start justify-start bg-black">
        <video 
          ref={videoRef}
          src={currentSrc} 
          className="w-[90%] h-[90%] object-contain"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex items-start justify-start bg-black">
      <img 
        src={currentSrc} 
        alt="Video feed" 
        className="w-[90%] h-[90%] object-contain"
      />
    </div>
  );
};

export default VideoContent;
