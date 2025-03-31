
import React from 'react';

const FirstResponders = () => {
  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2">First Responders</h3>
      {[
        "Forest Fire Drone 1 - Quebec Central Boreal Forest",
        "Forest Fire Drone 2 - Mistissini Boreal Forest",
        "Forest Fire Drone 3 - Cree Traditional Territory Forest"
      ].map((drone, index) => (
        <div key={index} className="flex items-center mb-1">
          <input type="checkbox" className="mr-2" />
          <span>{drone}</span>
        </div>
      ))}
      <div className="flex items-center mt-2">
        <input type="checkbox" className="mr-2" />
        <span>active</span>
      </div>
    </div>
  );
};

export default FirstResponders;
