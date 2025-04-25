import React, { useState } from 'react';
import {sidebarStyle,propertyFieldStyle,selectStyle,buttonGroupStyle,saveButtonStyle} from "./styles"
const PropertiesSidebar = ({ shape, properties, onPropertiesChange, onSave }) => {
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
    if (!shape) return (
      <div style={sidebarStyle}>
        <h3>No Active Shape</h3>
        <p>Draw or select a shape to edit properties</p>
      </div>
    );
  
    const currentOptions = PROPERTY_OPTIONS[shape.dataType] || {};
    const currentProperties = properties[shape.dataType] || {};
  
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
            </div>
          ))
        )}
  
        {shape.dataType !== 'strap' && (
          <button 
            onClick={onSave}
            disabled={!Object.values(currentProperties).every(val => val)}
            style={saveButtonStyle}
          >
            {shape.id ? 'Update Properties' : 'Save Shape'}
          </button>
        )}
      </div>
    );
  };
   export default PropertiesSidebar;