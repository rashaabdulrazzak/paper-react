import React, { useState, useRef, useEffect } from 'react';
import paper from 'paper'
import ShapeSidebar from './ShapeSidebar';
import NodulePropertiesPanel from './NodulePropertiesPanel';
const ImageWithShapes = () => {
  const [mode, setMode] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [imageUrl, setImageUrl] = useState('https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg');
  const [shapes, setShapes] = useState([]);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedShape, setSelectedShape] = useState(null);
  const [currentNodule, setCurrentNodule] = useState(null);
  const [noduleProperties, setNoduleProperties] = useState({
    composition: '',
    echogenicity: '',
    shape: '',
    margin: '',
    echogenicFoci: ''
  });
  // Color constants for different annotation types
  const COLORS = {
    nodule: 'red',
    region: 'blue',
    parenchyma: 'purple'
  };
 

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    paper.setup(canvasRef.current);

     // Add zoom/pan tools
  paper.view.onMouseDrag = (event) => {
    if (event.modifiers.space) { // Hold space to pan
      paper.view.center = paper.view.center.subtract(event.delta);
    }
  };

  paper.view.onMouseWheel = (event) => {
    const zoomFactor = 1.1;
    const newZoom = event.delta.y > 0 ? 
      paper.view.zoom * zoomFactor : 
      paper.view.zoom / zoomFactor;
    
    paper.view.zoom = Math.min(Math.max(newZoom, 0.1), 10); // Limit zoom range
  };
    redrawShapes(); // Draw existing shapes immediately after setup

    const handleMouseDown = (event) => {
      if (mode === 'circle') {
        const newShape = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          type: 'circle',
          center: [event.point.x, event.point.y],
          radius: 30,
          strokeColor: COLORS.nodule,
          dataType: 'nodule'
        };
        setShapes(prev => [...prev, newShape]);
      } else if (mode && mode !== 'circle') {
        setPolygonPoints(prev => [...prev, [event.point.x, event.point.y]]);
      }
    };

    paper.view.onMouseDown = handleMouseDown;

    return () => {
      paper.view.off('mousedown');
       // If we have a currentNodule but cancel without saving
        if (currentNodule) {
          setCurrentNodule(null);
        }
    };
  }, [imageUrl, mode],currentNodule);

  // Redraw everything whenever shapes or polygonPoints change
  useEffect(() => {
    if (paper.project) {
      redrawShapes();
    }
  }, [shapes, polygonPoints]);

  const redrawShapes = () => {
    if (!paper.project) return;
    
    // Clear only the active layer, keeping other layers intact
    paper.project.activeLayer.removeChildren();
    
    // Draw all completed shapes
    shapes.forEach(shape => {
      if (shape.type === 'circle') {
        new paper.Path.Circle({
          center: new paper.Point(shape.center[0], shape.center[1]),
          radius: shape.radius,
          strokeColor: shape.strokeColor,
          strokeWidth: 2
        }).data = {
          id: shape.id,
          strokeColor: shape.strokeColor
        };
      } else if (shape.type === 'polygon') {
        new paper.Path({
          segments: shape.points,
          strokeColor: shape.strokeColor,
          strokeWidth: 2,
          closed: true
        }).data = {
          id: shape.id,
          strokeColor: shape.strokeColor
        };
      }
    });

    // Draw the current in-progress polygon
    if (polygonPoints.length > 0) {
      const color = 
        mode === 'nodule-polygon' ? COLORS.nodule :
        mode === 'strap' ? COLORS.region :
        COLORS.parenchyma;
      
      new paper.Path({
        segments: polygonPoints,
        strokeColor: color,
        strokeWidth: 2,
        dashArray: [5, 5],
        closed: polygonPoints.length > 2
      });
    }

    paper.view.update();
  };

  const finishPolygon = () => {
    if (polygonPoints.length >= 3) {
      const newShape = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        type: 'polygon',
        points: polygonPoints,
        strokeColor: 
          mode === 'nodule-polygon' ? COLORS.nodule :
          mode === 'strap' ? COLORS.region :
          COLORS.parenchyma,
        dataType: 
          mode === 'nodule-polygon' ? 'nodule' :
          mode === 'strap' ? 'region' :
          'parenchyma',
          properties: null
      };
      setCurrentNodule(newShape);
      setPolygonPoints([]);
      //setShapes(prev => [...prev, newShape]);
    }
    setPolygonPoints([]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          setCanvasSize({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          setImageUrl(event.target.result);
          setShapes([]);
          setPolygonPoints([]);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAll = () => {
    setShapes([]);
    setPolygonPoints([]);
  };
  const handleResize = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasSize({
        width: rect.width,
        height: rect.height
      });
    }
  };

  // Set initial canvas size based on the image size
  // and update it on window resize
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasSize.width;
      canvasRef.current.height = canvasSize.height;
    }
  }, [canvasSize]);

  // Hadles for saving and loading annotations
  /*const saveAnnotations = () => {
    const annotations = shapes.map(shape => ({
      type: shape.type,
      points: shape.type === 'polygon' ? shape.points : [shape.center],
      dataType: shape.dataType
    }));
    const blob = new Blob([JSON.stringify(annotations)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();
    URL.revokeObjectURL(url);
  };*/
  const saveAnnotations = () => {
    const annotationData = {
      imageUrl: imageUrl,
      imageDimensions: canvasSize,
      shapes: shapes.map(shape => ({
        ...shape,
        // Ensure properties are included in the saved data
        properties: shape.properties || {}
      })),
      timestamp: new Date().toISOString()
    };
    
    // Convert to JSON string
    const dataStr = JSON.stringify(annotationData);
    
    // Save to localStorage (or you could send to a server)
    localStorage.setItem('savedAnnotations', dataStr);
    
    // Optionally: Download as a file
   /* const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations_${new Date().toISOString()}.json`;
    a.click();
    
    alert('Annotations saved successfully!');*/
  };
  
  const loadAnnotations = () => {
    // Load from localStorage
    const savedData = localStorage.getItem('savedAnnotations');
    if (!savedData) return;
  
    try {
      const annotationData = JSON.parse(savedData);
      setImageUrl(annotationData.imageUrl);
      setCanvasSize(annotationData.imageDimensions);
      
      // Ensure all nodules have either properties object or null
      setShapes(annotationData.shapes.map(shape => ({
        ...shape,
        properties: shape.properties || null
      })));
      
    } catch (error) {
      console.error('Load error:', error);
    }
  };
  
  const loadAnnotationsFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const annotationData = JSON.parse(e.target.result);
        
        setImageUrl(annotationData.imageUrl);
        setCanvasSize(annotationData.imageDimensions);
        
        setTimeout(() => {
          setShapes(annotationData.shapes);
        }, 100);
        
        alert('Annotations loaded from file!');
      } catch (error) {
        console.error('Error loading from file:', error);
        alert('Invalid annotation file!');
      }
    };
    reader.readAsText(file);
  };
  // sidebar for annotation types
   // Calculate shape counts by type
   const shapeCounts = shapes.reduce((acc, shape) => {
    const type = shape.dataType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Group shapes by type for the sidebar
  const groupedShapes = shapes.reduce((acc, shape) => {
    const type = shape.dataType || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(shape);
    return acc;
  }, {});
// Function to highlight a shape when clicked in the sidebar
// Modify highlightShape to handle selection
const highlightShape = (shape) => {
  // First remove any existing highlights
  paper.project.activeLayer.children.forEach(item => {
    item.strokeColor = item.data.strokeColor;
    item.strokeWidth = 2;
  });

  // Find and highlight the selected shape
  paper.project.activeLayer.children.forEach(item => {
    if (item.data.id === shape.id) {
      item.strokeColor = 'yellow';
      item.strokeWidth = 3;
      item.bringToFront();
      setSelectedShape(shape);
    }
  });
  paper.view.update();
};
// Add delete functionality
const deleteSelectedShape = () => {
  if (!selectedShape) return;
  
  setShapes(prev => prev.filter(shape => shape.id !== selectedShape.id));
  setSelectedShape(null);
};
const saveNoduleProperties = (properties) => {
  if (!currentNodule) return;
  
  const finalizedNodule = {
    ...currentNodule,
    properties: properties // Add the selected properties
  };
  
  // Add to shapes only once here
  setShapes(prev => [...prev, finalizedNodule]);
  setCurrentNodule(null);
};

  return (
    <div className="app-container">
    {/* Sidebar */}
    <ShapeSidebar 

shapes={shapes} 

onHighlightShape={highlightShape} 

/>

    {/* Main content */}
    <div className="main-content">
      <h1>Image Annotation Tool</h1>
      <div style={{ marginBottom: '20px' }}>
      {currentNodule && (
  <NodulePropertiesPanel
    shape={currentNodule}
    onSave={saveNoduleProperties}
    onCancel={() => setCurrentNodule(null)}
  />
)}
        <div style={{ marginBottom: '10px' }}>
          <strong>Nodule Annotations:</strong>
          <button 
            onClick={() => setMode('circle')} 
            style={{ 
              margin: '0 10px',
              fontWeight: mode === 'circle' ? 'bold' : 'normal',
              color: COLORS.nodule
            }}
          >
            Circle
          </button>
          <button 
            onClick={() => setMode('nodule-polygon')} 
            style={{ 
              fontWeight: mode === 'nodule-polygon' ? 'bold' : 'normal',
              color: COLORS.nodule
            }}
          >
            Nodule Polygon
          </button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <strong>Region Annotations:</strong>
          <button 
            onClick={() => setMode('strap')} 
            style={{ 
              margin: '0 10px',
              fontWeight: mode === 'strap' ? 'bold' : 'normal',
              color: COLORS.region
            }}
          >
            Strap Kasi
          </button>
          <button 
            onClick={() => setMode('parenchyma')} 
            style={{ 
              fontWeight: mode === 'parenchyma' ? 'bold' : 'normal',
              color: COLORS.parenchyma
            }}
          >
            Zemin Parenkim
          </button>
        </div>

        {(mode === 'nodule-polygon' || mode === 'strap' || mode === 'parenchyma') && (
          <div style={{ marginTop: '10px' }}>
            <button onClick={finishPolygon} style={{ marginRight: '10px' }}>
              Finish Drawing
            </button>
            <button onClick={() => setPolygonPoints([])}>
              Cancel
            </button>
          </div>
        )}

        <div style={{ marginTop: '10px' }}>
          <button onClick={clearAll} style={{ marginRight: '10px' }}>
            Clear All
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current.click()}>
            Upload Image
          </button>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button onClick={saveAnnotations} style={{ marginRight: '10px' }}>
            Save Annotations
          </button>
          <button onClick={loadAnnotations} style={{ marginRight: '10px' }}>
            Load Annotations
          </button>
          <input
            type="file"
            id="annotationFile"
            accept=".json"
            onChange={loadAnnotationsFromFile}
            style={{ display: 'none' }}
          />
          <button onClick={() => document.getElementById('annotationFile').click()}>
            Load From File
          </button>
        </div>
      </div>


      <div style={{ position: 'relative', border: '1px solid #ccc' }}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Annotation base"
            style={{ display: 'block', maxWidth: '100%' }}
          />
        )}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair'
          }}
        />
      </div>
    </div>
    </div>
  );
};

export default ImageWithShapes; 