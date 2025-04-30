// Polygon.js
import React from 'react';

const Polygon = ({ points, isSelected, onClick }) => {
  const pointString = points.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <polygon
      points={pointString}
      fill="rgba(255, 0, 0, 0.3)"
      stroke={isSelected ? 'blue' : 'red'}
      strokeWidth={2}
      onClick={(e) => {
        e.stopPropagation(); // Prevent svg click event
        onClick();
      }}
    />
  );
};

export default Polygon;
