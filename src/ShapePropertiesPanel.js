import React, { useState } from 'react';
const ShapePropertiesPanel = ({ shapeType, properties, onSave, onCancel }) => {
    console.log('Shape Type:', shapeType);
    console.log('Properties:', properties);
    const PROPERTY_OPTIONS = {
        nodule: {
          composition: ['Cystic', 'Spongiform', 'Mixed', 'Solid', 'Other'],
          echogenicity: ['Anechoic', 'Hyperechoic', 'Hypoechoic', 'Isoechoic', 'Heterogeneous'],
          shape: ['Oval', 'Round', 'Taller-than-wide', 'Irregular'],
          margin: ['Smooth', 'Ill-defined', 'Lobulated', 'Irregular', 'Extrathyroidal'],
          echogenicFoci: ['None', 'Macrocalcifications', 'Peripheral', 'Punctate', 'Comet-tail']
        },
        parenchyma: {
          heterojenitesi: ['Yok', 'Hafif', 'Orta', 'Belirgin']
        }
      };
    const [localProperties, setLocalProperties] = useState(properties);
  
    const handleChange = (property, value) => {
      setLocalProperties(prev => ({ ...prev, [property]: value }));
    };
  
    const handleSave = () => {
      onSave(localProperties);
    };
  
    return (
      <div style={{
        position: 'absolute',
        right: 20,
        top: 20,
        width: 300,
        background: 'white',
        padding: 20,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <h3>
          {shapeType === 'nodule-polygon' ? 'Nodule Properties' : 
           shapeType === 'parenchyma' ? 'Parenchyma Properties' : 'Shape Properties'}
        </h3>
        
        {Object.entries(PROPERTY_OPTIONS[shapeType === 'parenchyma' ? 'parenchyma' : 'nodule'] || {}).map(([property, options]) => (
          <div key={property} style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>
              {property.charAt(0).toUpperCase() + property.slice(1)}:
            </label>
            <select
              value={localProperties[property]}
              onChange={(e) => handleChange(property, e.target.value)}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="">Select {property}</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={onCancel}>Cancel</button>
          <button 
            onClick={handleSave}
            disabled={!Object.values(localProperties).every(val => val)}
            style={{ background: '#1890ff', color: 'white' }}
          >
            Save Properties
          </button>
        </div>
      </div>
    );
  };
  export default ShapePropertiesPanel;