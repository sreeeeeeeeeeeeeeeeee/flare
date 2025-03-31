
import { VideoFeedType } from '@/types/emergency';

// Updated YouTube video link
const droneVideo = 'http://youtu.be/WHBClgDSPd0';

// Generate initial video feeds
export const generateInitialVideoFeeds = (): VideoFeedType[] => {
  return [
    {
      id: 'video-1',
      type: 'drone',
      source: droneVideo,
      location: 'Mistissini Forest Fire Zone',
      hasAlert: true,
      relatedFeeds: []
    }
  ];
};
