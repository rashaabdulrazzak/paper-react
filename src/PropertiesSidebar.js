import React, { useState } from 'react';
import {sidebarStyle,propertyFieldStyle,selectStyle,buttonGroupStyle,saveButtonStyle} from "./styles"
const PropertiesSidebar = ({ shape, properties, onPropertiesChange, onSave,hasChanges }) => {
    const PROPERTY_OPTIONS = {
        'nodule-polygon': {
            composition: ['Cystic', 'Spongiform', 'Mixed', 'Solid', 'Other'],
            echogenicity: ['Anechoic', 'Hyperechoic', 'Hypoechoic', 'Isoechoic', 'Heterogeneous'],
            shape: ['Oval', 'Round', 'Taller-than-wide', 'Irregular'],
            margin: ['Smooth', 'Ill-defined', 'Lobulated', 'Irregular', 'Extrathyroidal'],
            echogenicFoci: ['None', 'Macrocalcifications', 'Peripheral', 'Punctate', 'Comet-tail'],
            measured: { type: 'checkbox', label: 'Measured' },
            needleInNodule: { type: 'checkbox', label: 'Needle in Nodule' },
            notSuitableForUse: { type: 'checkbox', label: 'Not Suitable for Use' }
          },
          'parenchyma': {
            heterojenitesi: ['Yok', 'Hafif', 'Orta', 'Belirgin']
          }
      };
      if (!shape) return (
        <div style={sidebarStyle}>
          <h3>No Shape Selected</h3>
          <p>Select a shape to edit properties</p>
        </div>
      );
    
      const currentOptions = PROPERTY_OPTIONS[shape.dataType] || {};
      const currentProperties = properties[shape.dataType] || {};
      console.log("Rendering with properties:", currentProperties);
      return (
        <div style={sidebarStyle}>
          <h3>
            {shape.dataType === 'nodule-polygon' ? 'Nodule Properties' : 
             shape.dataType === 'parenchyma' ? 'Parenchyma Properties' : ''}
          </h3>
    
          {shape.dataType === 'strap' ? (
            <p>Strap Kasi has no editable properties</p>
          ) : (
            Object.entries(currentOptions).map(([property, options]) => (
              <div key={property} style={propertyFieldStyle}>
              {options.type === 'checkbox' ? (
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={currentProperties[property] || false}
                    onChange={(e) => onPropertiesChange(property, e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  {options.label}
                </label>
                
              ) : (
                <>
                  <label>{property}:</label>
                  <select
                    value={currentProperties[property] || ''}
                    onChange={(e) => onPropertiesChange(property, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select {property}</option>
                    {options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            ))
          )}
    
          {shape.dataType !== 'strap' && (
        <button
        onClick={(e) => {
          e.stopPropagation();
          onSave();
        }}
        style={{
          ...saveButtonStyle,
          opacity: hasChanges ? 1 : 0.6,
          cursor: hasChanges ? 'pointer' : 'not-allowed'
        }}
        disabled={!hasChanges}
      >
        Save Changes
      </button>
          )}
        </div>
      );
    
  };
   export default PropertiesSidebar;