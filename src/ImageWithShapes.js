import React, { useState, useRef, useEffect, useCallback } from "react";
import paper from "paper";
import ShapeSidebar from "./ShapeSidebar";
import NodulePropertiesPanel from "./NodulePropertiesPanel";

import PropertiesSidebar from "./PropertiesSidebar";
//import ShapePropertiesPanel from "./ShapePropertiesPanel";
import { message } from "antd";

const ImageWithShapes = () => {
  const [mode, setMode] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [imageUrl, setImageUrl] = useState(
    "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg"
  );
 

const [tempShape, setTempShape] = useState(null); // For shapes being drawn

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedShape, setSelectedShape] = useState(null);
  const [currentNodule, setCurrentNodule] = useState(null);
 
  const [currentShape, setCurrentShape] = useState(null);
  const [unsavedProperties, setUnsavedProperties] = useState({});

  const [activeShapeForProperties, setActiveShapeForProperties] = useState(null);
  const [history, setHistory] = useState({
    past: [],       // Past states
    present: [],    // Current shapes (initialize empty)
    future: []      // Redo stack
  });
  
  // Replace your existing `shapes` state with:
  const [shapes, setShapes] = useState([]); 

const [shapeProperties, setShapeProperties] = useState({
  'nodule-polygon': {
    composition: '',
    echogenicity: '',
    shape: '',
    margin: '',
    echogenicFoci: '',
    measured: false,         
    needleInNodule: false,   
    notSuitableForUse: false
  },
  'parenchyma': {
    heterojenitesi: ''
  }
});

  // Color constants for different annotation types
  const COLORS = {
    "nodule-polygon": "red", // Changed from 'nodule'
    nodule: "red",
    strap: "blue",
    region: "blue",
    parenchyma: "purple",
  };
  const [editingShape, setEditingShape] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);

  let selectedItemRef = null;

  const updateShapes = (newShapes) => {
    setShapes(newShapes);
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: newShapes,
      future: [] // Clear redo stack on new action
    }));
  };
  
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
     
      const newPresent = prev.past[prev.past.length - 1];
      return {
        past: prev.past.slice(0, -1),
        present: newPresent,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);
  
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      
      return {
        past: [...prev.past, prev.present],
        present: prev.future[0],
        future: prev.future.slice(1)
      };
    });
  }, []);
  
  // Sync history.present with shapes
  useEffect(() => {
    setShapes(history.present);
  }, [history.present]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && history.past.length > 0) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' && history.future.length > 0) {
          e.preventDefault();
          redo();
        }
      } else if (e.key === 'Escape') {
        // Cancel polygon drawing
        setPolygonPoints([]);
        setTempShape(null);
        message.info('Drawing cancelled.');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShape) {
        setShapes(prev => prev.filter(shape => shape.id !== selectedShape.id));
        setSelectedShape(null);
        message.success('Shape deleted.');
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, undo, redo, selectedShape]);
  useEffect(
    () => {
      if (!canvasRef.current || !imageUrl) return;

      paper.setup(canvasRef.current);

      // Add zoom/pan tools
      paper.view.onMouseDrag = (event) => {
        if (event.modifiers.space) {
          // Hold space to pan
          paper.view.center = paper.view.center.subtract(event.delta);
        }
      };

      paper.view.onMouseWheel = (event) => {
        const zoomFactor = 1.1;
        const newZoom =
          event.delta.y > 0
            ? paper.view.zoom * zoomFactor
            : paper.view.zoom / zoomFactor;

        paper.view.zoom = Math.min(Math.max(newZoom, 0.1), 10); // Limit zoom range
      };
      // Add this new handler for polygon drawing preview
      paper.view.onMouseMove = (event) => {
        if (polygonPoints.length > 0) {
          // Show preview of the current polygon
          redrawShapes(); // Redraws existing shapes + temporary polygon
          new paper.Path({
            segments: [...polygonPoints, [event.point.x, event.point.y]],
            strokeColor: tempShape?.strokeColor || 'black',
            strokeWidth: 1,
            dashArray: [4, 4],
            closed: false
          });
          paper.view.update();
        }
      };
      redrawShapes(); // Draw existing shapes immediately after setup

      const handleMouseDown = (event) => {
        
        const point = new paper.Point(event.point.x, event.point.y);
        
        if (drawingMode) {
        if (mode === "circle") {
          const newShape = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            type: "circle",
            center: [event.point.x, event.point.y],
            radius: 30,
            strokeColor: COLORS.nodule,
            dataType: "nodule",
          };
          setShapes((prev) => [...prev, newShape]);
        } else if (mode && mode !== "circle") {
          if (polygonPoints.length === 0) {
            // Initialize temp shape when starting to draw
            setTempShape({
              id: Date.now().toString(36),
              type: 'polygon',
              points: [[event.point.x, event.point.y]],
              strokeColor: 
                mode === 'nodule-polygon' ? COLORS.nodule :
                mode === 'parenchyma' ? COLORS.parenchyma :
                COLORS.region,
              dataType: mode,
              properties: null
            });
          }
          setPolygonPoints(prev => [...prev, [event.point.x, event.point.y]]);
        
        }
      }
         // Deselect previous selection
        if (selectedItemRef) {
          selectedItemRef.selected = false;
          selectedItemRef = null;
        }   
        if (
          point.x < 0 ||
          point.x > canvasSize.width ||
          point.y < 0 ||
          point.y > canvasSize.height
        ) {
          console.log("Click outside canvas bounds");
          return;
        }
        // If not in drawing mode, check if the click is on an existing shape
        if (!drawingMode) {
          const hitResult = paper.project.hitTest(point, {
            fill: true,
            stroke: true,
            segments: true,
            tolerance: 25,
          });
          if (hitResult && hitResult.item) {
            selectedItemRef = hitResult.item;
            selectedItemRef.selected = true; // this highlights it
            console.log("Selected shape:", selectedItemRef.data);
            let shape = shapes.find(shape => shape.id === selectedItemRef.data.id);
            if (shape) {
              setSelectedShape(shape);
            } else {
              setSelectedShape(null);
            }
            setSelectedShape(selectedItemRef.data);
            setCurrentShape(shape);
            setActiveShapeForProperties(shape);
            setUnsavedProperties(shape.properties || {});
           
            highlightShape(shape);
            
             
            setSelectedShapeIndex(shapes.findIndex(shape => shape.id === selectedItemRef.data.id));
          } else {
            setSelectedShape(null);
          }
        }
      
      };

      paper.view.onMouseDown = handleMouseDown;

      return () => {
        paper.view.off("mousedown");
        paper.view.off("mousemove");
        paper.view.off("mousedrag");
        paper.view.off("mousewheel");
        paper.view.off("mouseup");
        
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageUrl, mode]
    
  );

  // Redraw everything whenever shapes or polygonPoints change
  useEffect(() => {
    if (paper.project) {
      redrawShapes();
    }
  }, [shapes, polygonPoints]);

  const redrawShapes = useCallback(() => {
    if (!paper.project) return;
    paper.project.activeLayer.removeChildren();

    // Only redraw changed shapes
    shapes.forEach(shape => {
      const path = shape.type === 'circle' 
        ? new paper.Path.Circle({
            center: new paper.Point(shape.center[0], shape.center[1]),
            radius: shape.radius
          })
        : new paper.Path({
            segments: shape.points,
            closed: true
          });
  
      path.strokeColor = shape.id === selectedShape?.id ? 'yellow' : shape.strokeColor;
      path.strokeWidth = shape.id === selectedShape?.id ? 3 : 2;
      path.data = { id: shape.id };
    });
  
    // Draw temporary polygon
    if (polygonPoints.length > 0) {
      new paper.Path({
        segments: polygonPoints,
        strokeColor: tempShape?.strokeColor || 'black',
        strokeWidth: 2,
        closed: false
      });
    }
  
    paper.view.update();
  
  
  }, [shapes, polygonPoints, selectedShape, tempShape]);

  const finishPolygon = () => {
    setMode(null);
    setDrawingMode(false);
  
    if (polygonPoints.length >= 3 && tempShape) {
      console.log("drawingMode:", drawingMode);
  
      const baseProps = shapeProperties[tempShape.dataType] || {};
      
      const finalizedShape = {
        ...tempShape,
        points: [...polygonPoints],
        properties: {
          ...baseProps,
          ...tempShape.properties
        },
        createdAt: new Date().toISOString()
      };
  
      updateShapes([...shapes, finalizedShape]);
      setPolygonPoints([]);
      setTempShape(null);
      highlightShape(finalizedShape);
    }
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
            height: img.naturalHeight,
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
    //setShapes([]);
    updateShapes([]);
    setPolygonPoints([]);
  };
  const handleResize = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasSize({
        width: rect.width,
        height: rect.height,
      });
    }
  };
 
  // Set initial canvas size based on the image size
  // and update it on window resize
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasSize.width;
      canvasRef.current.height = canvasSize.height;
    }
  }, [canvasSize]);

 
  const saveAnnotations = () => {
    const annotationData = {
      imageUrl: imageUrl,
      imageDimensions: canvasSize,
      shapes: shapes.map((shape) => ({
        ...shape,
        // Ensure properties are included in the saved data
        properties: shape.properties || {},
      })),
      timestamp: new Date().toISOString(),
    };

    // Convert to JSON string
    const dataStr = JSON.stringify(annotationData);

    // Save to localStorage (or you could send to a server)
    localStorage.setItem("savedAnnotations", dataStr);

   
  };

  const loadAnnotations = () => {
    // Load from localStorage
    const savedData = localStorage.getItem("savedAnnotations");
    if (!savedData) return;

    try {
      const annotationData = JSON.parse(savedData);
      setImageUrl(annotationData.imageUrl);
      setCanvasSize(annotationData.imageDimensions);

      // Ensure all nodules have either properties object or null
      setShapes(
        annotationData.shapes.map((shape) => ({
          ...shape,
          properties: shape.properties || null,
        }))
      );
    } catch (error) {
      console.error("Load error:", error);
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

        alert("Annotations loaded from file!");
      } catch (error) {
        console.error("Error loading from file:", error);
        alert("Invalid annotation file!");
      }
    };
    reader.readAsText(file);
  };
  // sidebar for annotation types
 
  // Modify highlightShape to handle selection
 
   // Highlight the shape visually
   const highlightShape = useCallback((shape) => {
    console.log("Highlighting shape:", shape);
    if (!shape) {
      setSelectedShape(null);
      return;
    }
  
    setSelectedShape(shape);
    setHasChanges(false); // Reset unsaved changes when selecting new shape
    
    // Initialize shapeProperties with the shape's current properties
    setShapeProperties(prev => ({
      ...prev,
      [shape.dataType]: {
        ...prev[shape.dataType],
        ...shape.properties
      }
    }));
  }, []);


  
  const handlePropertyChange = useCallback((property, value) => {
    if (!selectedShape) return;
  
    // For checkboxes - save immediately
    if (['measured', 'needleInNodule', 'notSuitableForUse'].includes(property)) {
      setShapes(prev => prev.map(shape => 
        shape.id === selectedShape.id
          ? { ...shape, properties: { ...shape.properties, [property]: value } }
          : shape
      ));
      setHasChanges(true); // Mark that changes occurred
    } 
    // For other properties
    else {
      setHasChanges(true);
    }
  
    // Always update the shapeProperties for UI
    setShapeProperties(prev => ({
      ...prev,
      [selectedShape.dataType]: {
        ...prev[selectedShape.dataType],
        [property]: value
      }
    }));
  }, [selectedShape]);
  const handleSaveProperties = useCallback(() => {
    if (!selectedShape || !hasChanges) return;
  
    // Save all current properties (including checkbox states)
   
    setShapes(prev => prev.map(shape => 
      shape.id === selectedShape.id
        ? { 
            ...shape, 
            properties: {
              ...shape.properties,
              ...shapeProperties[selectedShape.dataType]
            }
          }
        : shape
    ));
  
    // Reset states
    setHasChanges(false);
    setSelectedShape(null);
    message.success('Changes saved successfully!');
  }, [selectedShape, hasChanges, shapeProperties]);
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Sidebar */}
      <ShapeSidebar shapes={shapes} onHighlightShape={highlightShape} />

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto',padding: '20px'  }}>
        <h1>Image Annotation Tool</h1>
        <div style={{ marginBottom: "20px" }}>
          
          <div style={{ marginBottom: "10px" }}>
            <strong>Nodule Annotations:</strong>
            <button
              onClick={() => {setMode("circle"); setDrawingMode(true);}}
              style={{
                margin: "0 10px",
                fontWeight: mode === "circle" ? "bold" : "normal",
                color: COLORS.nodule,
              }}
            >
              Circle
            </button>
            <button
              onClick={() => {setMode("nodule-polygon"); setDrawingMode(true);}}
              style={{
                fontWeight: mode === "nodule-polygon" ? "bold" : "normal",
                color: COLORS.nodule,
              }}
            >
              Nodule Polygon
            </button>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>Region Annotations:</strong>
            <button
              onClick={() => {
                setMode("strap");
                setDrawingMode(true);
                
              }}
              style={{
                margin: "0 10px",
                fontWeight: mode === "strap" ? "bold" : "normal",
                color: COLORS.region,
              }}
            >
              Strap Kasi
            </button>
            <button
              onClick={() => {setMode("parenchyma"); setDrawingMode(true);}}
              style={{
                fontWeight: mode === "parenchyma" ? "bold" : "normal",
                color: COLORS.parenchyma,
              }}
            >
              Zemin Parenkim
            </button>
          </div>

          {(mode === "nodule-polygon" ||
            mode === "strap" ||
            mode === "parenchyma") && (
            <div style={{ marginTop: "10px" }}>
              <button onClick={finishPolygon} style={{ marginRight: "10px" }}>
                Finish Drawing
              </button>
              <button onClick={() => setPolygonPoints([])}>Cancel</button>
            </div>
          )}

          <div style={{ marginTop: "10px" }}>
            <button onClick={clearAll} style={{ marginRight: "10px" }}>
              Clear All
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button onClick={() => fileInputRef.current.click()}>
              Upload Image
            </button>
          </div>
          <div style={{ marginTop: "10px" }}>
            <button onClick={saveAnnotations} style={{ marginRight: "10px" }}>
              Save Annotations
            </button>
            <button onClick={loadAnnotations} style={{ marginRight: "10px" }}>
              Load Annotations
            </button>
            <input
              type="file"
              id="annotationFile"
              accept=".json"
              onChange={loadAnnotationsFromFile}
              style={{ display: "none" }}
            />
            <button
              onClick={() => document.getElementById("annotationFile").click()}
            >
              Load From File
            </button>
          </div>
          <div style={{ marginTop: "10px", display: 'flex', gap: '10px' }}>
  <button
    onClick={undo}
    disabled={history.past.length === 0}
    style={{
      padding: '5px 10px',
      background: history.past.length === 0 ? '#f5f5f5' : '#1890ff',
      color: history.past.length === 0 ? '#d9d9d9' : 'white',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    Undo (Ctrl+Z)
  </button>
  <button
    onClick={redo}
    disabled={history.future.length === 0}
    style={{
      padding: '5px 10px',
      background: history.future.length === 0 ? '#f5f5f5' : '#52c41a',
      color: history.future.length === 0 ? '#d9d9d9' : 'white',
      border: 'none',
      borderRadius: '4px'
    }}
  >
    Redo (Ctrl+Y)
  </button>
</div>
        </div>
      
       <div style={{ position: 'relative', border: '1px solid #ccc' }}>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Annotation base"
              style={{ display: "block", maxWidth: "100%" }}
            />
          )}
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              cursor: "crosshair",
            }}
          />
     
        </div>
        </div>
        {/* Right Sidebar */}
        
        <PropertiesSidebar
      shape={selectedShape}
      properties={shapeProperties}
      hasChanges={hasChanges}
      onPropertiesChange={handlePropertyChange}
      onSave={handleSaveProperties}
    />

      
    </div>
  );
};

export default ImageWithShapes;
