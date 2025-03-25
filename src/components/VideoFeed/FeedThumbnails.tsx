type FeedThumbnailsProps = {
  feeds: Array<{ thumbnail?: string; source: string }>;
  currentFeed: { thumbnail?: string; source: string };
  feedIndex: number;
  onSelectFeed: (index: number) => void;
};

const FeedThumbnails = ({
  feeds,
  currentFeed,
  feedIndex,
  onSelectFeed
}: FeedThumbnailsProps) => {
  // If there are no related feeds, only show the main feed thumbnail
  if (feeds.length === 0) {
    return (
      <div className="flex gap-1 overflow-x-auto">
        <button 
          onClick={() => onSelectFeed(0)}
          className="flex-shrink-0 w-12 h-8 rounded overflow-hidden border-2 border-primary"
        >
          <img 
            src={currentFeed.thumbnail || currentFeed.source} 
            alt="Main Feed" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    );
  }

  // Otherwise, show all feeds
  const allFeeds = [currentFeed, ...feeds];

  return (
    <div className="flex gap-1 overflow-x-auto">
      {allFeeds.map((feed, idx) => (
        <button 
          key={idx}
          onClick={() => onSelectFeed(idx)}
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
  );
};

export default FeedThumbnails;
