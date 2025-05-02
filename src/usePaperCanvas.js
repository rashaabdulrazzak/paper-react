import { useEffect, useRef } from 'react';
import paper from 'paper';

/**
 * Custom hook for managing Paper.js canvas setup and event handling
 * @param {React.RefObject} canvasRef - Reference to the canvas element
 * @param {Object} handlers - Event handlers for Paper.js events
 * @param {Function} handlers.onMouseDown
 * @param {Function} [handlers.onMouseMove]
 * @param {Function} [handlers.onDoubleClick]
 * @param {Array} dependencies - React dependencies for hook recalculation
 */
export default function usePaperCanvas(canvasRef, handlers = {}, dependencies = []) {
  // Store Paper.js project state
  const projectState = useRef({
    previewItems: [],
    vertexHandles: []
  });

  // Initialize Paper.js and set up event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up Paper.js
    paper.setup(canvas);
    
    // Event handler setup
    const eventHandlers = {
      mousedown: (event) => {
        handlers.onMouseDown?.(event);
        paper.view.update();
      },
      mousemove: (event) => {
        handlers.onMouseMove?.(event);
        paper.view.update();
      },
      doubleclick: (event) => {
        handlers.onDoubleClick?.(event);
        paper.view.update();
      }
    };

    // Attach event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      if (handler) paper.view.on(event, handler);
    });

    // Cleanup function
    return () => {
      // Remove all event handlers
      Object.keys(eventHandlers).forEach(event => {
        paper.view.off(event);
      });
      
      // Clear project state
      projectState.current = {
        previewItems: [],
        vertexHandles: []
      };
      
      paper.project.clear();
    };
  }, [canvasRef, ...dependencies]);

  /**
   * Draw a preview of the current polygon
   * @param {Array} points - Array of [x,y] points
   * @param {string} color - Stroke color
   */
  const drawPreview = (points, color = 'black') => {
    // Clear previous preview items
    clearPreviewItems();

    if (points.length < 1) return;

    // Draw vertex handles
    projectState.current.vertexHandles = points.map(point => {
      return new paper.Path.Circle({
        center: point,
        radius: 4,
        fillColor: 'white',
        strokeColor: color,
        strokeWidth: 1.5,
        data: { isVertex: true }
      });
    });

    // Draw connecting lines
    if (points.length > 1) {
      projectState.current.previewItems.push(
        new paper.Path({
          segments: points,
          strokeColor: color,
          strokeWidth: 2,
          dashArray: [4, 4],
          data: { isPreview: true }
        })
      );
    }
  };

  /**
   * Draw active segment (from last point to mouse position)
   * @param {Array} fixedPoints - Completed points
   * @param {paper.Point} mousePoint - Current mouse position
   * @param {string} color - Stroke color
   */
  const drawActiveSegment = (fixedPoints, mousePoint, color = 'black') => {
    if (fixedPoints.length === 0) return;

    const lastPoint = fixedPoints[fixedPoints.length - 1];
    projectState.current.previewItems.push(
      new paper.Path.Line({
        from: lastPoint,
        to: mousePoint,
        strokeColor: color,
        strokeWidth: 2,
        dashArray: [4, 4],
        data: { isActiveSegment: true }
      })
    );
  };

  /**
   * Clear all preview items from canvas
   */
  const clearPreviewItems = () => {
    projectState.current.previewItems.forEach(item => item.remove());
    projectState.current.vertexHandles.forEach(item => item.remove());
    projectState.current.previewItems = [];
    projectState.current.vertexHandles = [];
  };

  /**
   * Finalize the drawn shape and add to main layer
   * @param {Array} points - Array of [x,y] points
   * @param {string} color - Fill color
   * @param {Object} data - Additional shape data
   * @returns {paper.Path} The finalized Paper.js path
   */
  const finalizeShape = (points, color, data = {}) => {
    clearPreviewItems();

    const path = new paper.Path({
      segments: points,
      strokeColor: color,
      strokeWidth: 2,
      fillColor: new paper.Color(color).setAlpha(0.3),
      closed: true,
      data: {
        ...data,
        isFinalized: true
      }
    });

    paper.view.update();
    return path;
  };

  return {
    drawPreview,
    drawActiveSegment,
    clearPreviewItems,
    finalizeShape,
    paperInstance: paper
  };
}