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
  const [shapes, setShapes] = useState([]);

const [tempShape, setTempShape] = useState(null); // For shapes being drawn

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedShape, setSelectedShape] = useState(null);
  const [currentNodule, setCurrentNodule] = useState(null);
 
  const [currentShape, setCurrentShape] = useState(null);
  const [unsavedProperties, setUnsavedProperties] = useState({});

  const [activeShapeForProperties, setActiveShapeForProperties] = useState(null);

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
      };

      paper.view.onMouseDown = handleMouseDown;

      return () => {
        paper.view.off("mousedown");
        // If we have a currentNodule but cancel without saving
        if (currentNodule) {
          setCurrentNodule(null);
        }
      };
    },
    [imageUrl, mode],
    currentNodule
  );

  // Redraw everything whenever shapes or polygonPoints change
  useEffect(() => {
    if (paper.project) {
      redrawShapes();
    }
  }, [shapes, polygonPoints]);

  const redrawShapes = useCallback(() => {
    if (!paper.project) return;
  
    paper.project.activeLayer.removeChildren(); // Clear canvas
  
    // Draw finalized shapes only
    shapes.forEach(shape => {
      const isSelected = selectedShape?.id === shape.id;
      const path = shape.type === 'circle' 
        ? new paper.Path.Circle({
            center: new paper.Point(shape.center[0], shape.center[1]),
            radius: shape.radius
          })
        : new paper.Path({
            segments: shape.points,
            closed: true
          });
  
      path.strokeColor = isSelected ? 'yellow' : shape.strokeColor;
      path.strokeWidth = isSelected ? 3 : shape.properties ? 2 : 1;
      path.data = { id: shape.id, strokeColor: shape.strokeColor };
    });
    // Draw temporary polygon (committed points)
  if (polygonPoints.length > 0) {
    new paper.Path({
      segments: polygonPoints,
      strokeColor: tempShape?.strokeColor || 'black',
      strokeWidth: 2,
      closed: false // Don't close until finished
    });
  }
  
    paper.view.update();
  }, [shapes, polygonPoints, selectedShape, tempShape]);

  const finishPolygon = () => {
    if (polygonPoints.length >= 3 && tempShape) {
      const finalizedShape = {
        ...tempShape,
        points: [...polygonPoints],
        properties: {
          // Initialize ALL properties including checkboxes
          ...shapeProperties[tempShape.dataType],
          ...tempShape.properties
        }
      };
  
      setShapes(prev => [...prev, finalizedShape]);
      setPolygonPoints([]);
      setTempShape(null);
      
      // Keep the shape selected (remove the setTimeout)
      highlightShape(finalizedShape);
      
      // Reset properties for next shape
      if (finalizedShape.dataType === 'nodule-polygon') {
        setShapeProperties(prev => ({
          ...prev,
          'nodule-polygon': {
            composition: '',
            echogenicity: '',
            shape: '',
            margin: '',
            echogenicFoci: ''
          }
        }));
      } else if (finalizedShape.dataType === 'parenchyma') {
        setShapeProperties(prev => ({
          ...prev,
          'parenchyma': {
            heterojenitesi: ''
          }
        }));
      }
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
    setShapes([]);
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
  // Calculate shape counts by type
  const shapeCounts = shapes.reduce((acc, shape) => {
    const type = shape.dataType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Group shapes by type for the sidebar
  const groupedShapes = shapes.reduce((acc, shape) => {
    const type = shape.dataType || "unknown";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(shape);
    return acc;
  }, {});
  // Function to highlight a shape when clicked in the sidebar
  // Modify highlightShape to handle selection
 
   // Highlight the shape visually
   const highlightShape = useCallback((shape) => {
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
  // Add delete functionality
  const deleteSelectedShape = () => {
    if (!selectedShape) return;

    setShapes((prev) => prev.filter((shape) => shape.id !== selectedShape.id));
    setSelectedShape(null);
  };
  const saveNoduleProperties = (properties) => {
    if (!currentNodule) return;

    const finalizedNodule = {
      ...currentNodule,
      properties: properties, // Add the selected properties
    };

    // Add to shapes only once here
    setShapes((prev) => [...prev, finalizedNodule]);
    setCurrentNodule(null);
  };
  const saveShapeProperties = (properties) => {
    if (!currentShape) return;

    const finalizedShape = {
      ...currentShape,
      properties: properties,
    };

    setShapes((prev) => [...prev, finalizedShape]);
    setCurrentShape(null);
    setShapeProperties({});
  };

  /* too see what functionality to add 
  const handleShapeClick = (shape) => {
    if (editingShape) {
      setEditingShape(null);
    } else {
      setEditingShape(shape);
      setSelectedShape(shape);
      highlightShape(shape);
    }
  };
  const handleShapeMouseOver = (shape) => {
    if (editingShape) {
      setEditingShape(shape);
    }
  };
  const handleShapeMouseOut = () => {
    if (editingShape) {
      setEditingShape(null);
    }
  };
  const handleShapeSelect = (shape) => {
    setSelectedShape(shape);
    highlightShape(shape);
  };
  const handleShapeDeselect = () => {
    setSelectedShape(null);
  };
  const handleShapeEdit = (shape) => {
    setEditingShape(shape);
    setSelectedShape(shape);
  };
  const handleShapeDelete = (shape) => {
    setShapes((prev) => prev.filter((s) => s.id !== shape.id));
    setSelectedShape(null);
  };
  const handleShapePropertiesChange = (property, value) => {
    if (selectedShape) {
      setShapeProperties((prev) => ({
        ...prev,
        [selectedShape.dataType]: {
          ...prev[selectedShape.dataType],
          [property]: value,
        },
      }));
    }
  };
  const handleShapeSave = () => {
    if (selectedShape) {
      const updatedShapes = shapes.map((s) =>
        s.id === selectedShape.id
          ? { ...s, properties: shapeProperties[selectedShape.dataType] }
          : s
      );
      setShapes(updatedShapes);
      message.success("Properties updated successfully!");
    }
  };
  const handleShapeCancel = () => {
    setEditingShape(null);
    setSelectedShape(null);
  };
  const handleShapePropertiesSave = () => {
    if (selectedShape) {
      const updatedShapes = shapes.map((s) =>
        s.id === selectedShape.id
          ? { ...s, properties: shapeProperties[selectedShape.dataType] }
          : s
      );
      setShapes(updatedShapes);
      message.success("Properties updated successfully!");
    }
  };
  const handleShapePropertiesCancel = () => {
    setEditingShape(null);
    setSelectedShape(null);
  };
  const handleShapePropertiesDelete = () => {
    if (selectedShape) {
      setShapes((prev) => prev.filter((s) => s.id !== selectedShape.id));
      setSelectedShape(null);
    }
  };
  const startEditingShape = (shape) => {
    setEditingShape(shape);
    setMode(shape.dataType);
    setPolygonPoints(shape.points || []);
  };
  const saveEditedShape = () => {
    if (editingShape && polygonPoints.length >= 3) {
      setShapes(shapes.map(s => 
        s.id === editingShape.id 
          ? { ...s, points: [...polygonPoints] } 
          : s
      ));
      cancelEditing();
    }
  };
  const cancelEditing = () => {
    setEditingShape(null);
    setPolygonPoints([]);
    setMode(null);
  };
  */
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
              onClick={() => setMode("circle")}
              style={{
                margin: "0 10px",
                fontWeight: mode === "circle" ? "bold" : "normal",
                color: COLORS.nodule,
              }}
            >
              Circle
            </button>
            <button
              onClick={() => setMode("nodule-polygon")}
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
              onClick={() => setMode("strap")}
              style={{
                margin: "0 10px",
                fontWeight: mode === "strap" ? "bold" : "normal",
                color: COLORS.region,
              }}
            >
              Strap Kasi
            </button>
            <button
              onClick={() => setMode("parenchyma")}
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
