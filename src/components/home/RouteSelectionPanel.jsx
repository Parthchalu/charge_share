import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, ChevronRight, Zap } from 'lucide-react';

export default function RouteSelectionPanel({ routes, onBack, onSelectRoute, selectedRouteIndex, departure, destination }) {
  
  const panelAnimation = {
    key: "route-selection-panel",
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "tween", ease: "easeInOut", duration: 0.3 }
  };

  if (!routes || routes.length === 0) {
    return (
      <motion.div
        {...panelAnimation}
        className="fixed bottom-16 left-0 right-0 z-10 bg-white/80 backdrop-blur-xl shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)] rounded-t-3xl"
      >
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2">
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h2 className="text-lg font-bold text-gray-800">Calculating route...</h2>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Finding the best paths for you.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...panelAnimation}
      className="fixed bottom-16 left-0 right-0 z-10 flex flex-col bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)]"
      style={{ height: 'calc(100vh - 12rem)' }}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800">Select your route</h2>
            <p className="text-xs text-gray-500 truncate">
              From: {departure?.name} → To: {destination?.name}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg p-2 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Duration and distance are calculated in real time.</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-4 space-y-3 pb-8">
          {routes.map((route, index) => {
            const leg = route.legs[0];
            const isSelected = index === selectedRouteIndex;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectRoute(index)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className={`font-bold text-lg mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                      {leg.distance.text} ({leg.duration.text})
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4" />
                      <span>{route.summary || `Route ${index + 1}`}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-6 h-6 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}