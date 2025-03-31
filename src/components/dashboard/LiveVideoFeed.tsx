
import React from 'react';

const LiveVideoFeed = () => {
  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2">Live Video Feed</h3>
      <div className="flex space-x-3">
        <button className="px-3 py-1 bg-gray-200 rounded">Pause</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded">LIVE</button>
        <span className="py-1">Mistissini Forest Fire Zone</span>
      </div>
    </div>
  );
};

export default LiveVideoFeed;
