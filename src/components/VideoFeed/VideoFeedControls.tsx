
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type VideoFeedControlsProps = {
  isPlaying: boolean;
  showVideo: boolean;
  onTogglePlay: () => void;
  onToggleVideo: () => void;
};

const VideoFeedControls = ({
  isPlaying,
  showVideo,
  onTogglePlay,
  onToggleVideo,
}: VideoFeedControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost"
        size="icon"
        onClick={onToggleVideo}
        title={showVideo ? "Disable feed" : "Enable feed"}
      >
        {showVideo ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
      </Button>
      <Button 
        variant="secondary"
        size="sm"
        onClick={onTogglePlay}
        className="text-xs px-2 py-1 rounded"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
    </div>
  );
};

export default VideoFeedControls;
