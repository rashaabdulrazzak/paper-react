import React, { useState } from 'react';
import {sidebarStyle,propertyFieldStyle,selectStyle,buttonGroupStyle,saveButtonStyle} from "./styles"
const PropertiesSidebar = ({ shape, properties, onPropertiesChange, onSave, onCancel }) => {
    const PROPERTY_OPTIONS = {
      'nodule-polygon': {
        composition: ['Cystic', 'Spongiform', 'Mixed', 'Solid', 'Other'],
        echogenicity: ['Anechoic', 'Hyperechoic', 'Hypoechoic', 'Isoechoic', 'Heterogeneous'],
        shape: ['Oval', 'Round', 'Taller-than-wide', 'Irregular'],
        margin: ['Smooth', 'Ill-defined', 'Lobulated', 'Irregular', 'Extrathyroidal'],
        echogenicFoci: ['None', 'Macrocalcifications', 'Peripheral', 'Punctate', 'Comet-tail']
      },
      'parenchyma': {
        heterojenitesi: ['Yok', 'Hafif', 'Orta', 'Belirgin']
      }
    };
  
    if (!shape) {
      return (
        <div style={sidebarStyle}>
          <h3>No Shape Selected</h3>
          <p>Click on a shape to view and edit its properties</p>
        </div>
      );
    }
  
    const shapeType = shape.dataType;
    const currentOptions = PROPERTY_OPTIONS[shapeType] || {};
  
    return (
      <div style={sidebarStyle}>
        <h3>
          {shapeType === 'nodule-polygon' ? 'Nodule Properties' : 
           shapeType === 'parenchyma' ? 'Parenchyma Properties' :
           'Shape Properties'}
        </h3>
        
        {shapeType === 'strap' ? (
          <p>Strap Kasi has no editable properties</p>
        ) : (
          Object.entries(currentOptions).map(([property, options]) => (
            <div key={property} style={propertyFieldStyle}>
              <label style={{ display: 'block', marginBottom: 5 }}>
                {property === 'heterojenitesi' ? 'Heterojenitesi' :
                 property.charAt(0).toUpperCase() + property.slice(1)}:
              </label>
              <select
                value={properties[property] || ''}
                onChange={(e) => onPropertiesChange(property, e.target.value)}
                style={selectStyle}
              >
                <option value="">Select {property}</option>
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))
        )}
  
        {shapeType !== 'strap' && (
          <div style={buttonGroupStyle}>
            <button onClick={onCancel}>Reset</button>
            <button 
              onClick={onSave}
              disabled={!Object.values(properties).every(val => val)}
              style={saveButtonStyle}
            >
              Save
            </button>
          </div>
        )}
      </div>
    );
  };
    export default PropertiesSidebar;