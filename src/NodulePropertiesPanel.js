import React, { useState } from 'react';
const NodulePropertiesPanel = ({ shape, onSave, onCancel }) => {
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
    const [properties, setProperties] = useState({
      composition: '',
      echogenicity: '',
      shape: '',
      margin: '',
      echogenicFoci: ''
    });
  
    const handleChange = (property, value) => {
      setProperties(prev => ({ ...prev, [property]: value }));
    };
  
    const handleSave = () => {
      onSave(properties);
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
        <h3>Nodule Properties</h3>
        
        {Object.entries(PROPERTY_OPTIONS).map(([property, options]) => (
          <div key={property} style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>
              {property.charAt(0).toUpperCase() + property.slice(1).replace(/([A-Z])/g, ' $1')}:
            </label>
            <select
              value={properties[property]}
              onChange={(e) => handleChange(property, e.target.value)}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="">Select {property}</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={onCancel}>Cancel</button>
          <button 
            onClick={handleSave}
            disabled={!Object.values(properties).every(val => val)}
            style={{ background: '#1890ff', color: 'white' }}
          >
            Save Properties
          </button>
        </div>
      </div>
    );
  };
  export default NodulePropertiesPanel;