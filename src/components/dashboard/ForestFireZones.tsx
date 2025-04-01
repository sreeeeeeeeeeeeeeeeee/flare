
import React from 'react';

const ForestFireZones = () => {
  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2">Emergency Alerts</h3>
      <div className="flex items-center mb-1">
        <input type="checkbox" className="mr-2" />
        <span>Critical Warning</span>
      </div>
      <div className="flex items-center mb-2">
        <input type="checkbox" defaultChecked className="mr-2" />
        <span>Forest Fire Alert</span>
      </div>
      <div className="bg-red-50 border-l-4 border-red-500 p-2 mb-3">
        Active forest fire detected near Main Street. Immediate evacuation required via Saint John Street.
        <div className="text-sm text-gray-500 mt-1">Northern Mistissini • 13:45</div>
      </div>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-2 mb-3">
        Poor visibility on Saint John Street due to smoke. Use Lakeshore Drive as alternative.
        <div className="text-sm text-gray-500 mt-1">Mistissini • 18:30</div>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-2 mb-3">
        Community Center on Lake Shore is now open as an evacuation shelter. Food and medical aid available.
        <div className="text-sm text-gray-500 mt-1">Eastern Mistissini • 15:20</div>
      </div>
    </div>
  );
};

export default ForestFireZones;
