import React from 'react';
import { Collapse, Badge, List, Divider } from 'antd';
import { 
  CaretRightOutlined, 
  DotChartOutlined,
  ClockCircleOutlined,
  PushpinOutlined,
  DeploymentUnitOutlined,
  GatewayOutlined,
  QuestionOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;

const typeIcons = {
  nodule: <PushpinOutlined />,
  region: <DeploymentUnitOutlined />,
  strap: <DeploymentUnitOutlined />,
  parenchyma: <GatewayOutlined />,
  unknown: <QuestionOutlined />
};

const ShapeSidebar = ({ shapes, onHighlightShape }) => {
  const typeConfig = {
    nodule: {
      color: 'red',
      icon: <PushpinOutlined />
    },
    region: {
      color: 'blue',
      icon: <DeploymentUnitOutlined />
    },
    strap: {
      color: 'blue',
      icon: <DeploymentUnitOutlined />
    },
    parenchyma: {
      color: 'purple',
      icon: <GatewayOutlined />
    },
    unknown: {
      color: 'gray',
      icon: <QuestionOutlined />
    }
  };

  // Count shapes by type
  const shapeCounts = shapes.reduce((acc, shape) => {
    const type = shape.dataType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Group shapes by type
  const groupedShapes = shapes.reduce((acc, shape) => {
    const type = shape.dataType || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(shape);
    return acc;
  }, {});

  return (
    <div style={{ width: 300, padding: '16px', background: '#fafafa', height: '100vh', overflowY: 'auto' }}>
      <Divider orientation="left" style={{ marginTop: 0 }}>
        <DotChartOutlined /> Annotations Summary
      </Divider>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {Object.entries(shapeCounts).map(([type, count]) => (
          <div key={type} style={{
            background: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            flex: 1,
            minWidth: '80px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                color: typeConfig[type]?.color || typeConfig.unknown.color,
                marginRight: '8px',
                fontSize: '16px'
              }}>
                {typeConfig[type]?.icon || typeConfig.unknown.icon}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>
                {type}
              </span>
            </div>
            <Badge 
              count={count} 
              style={{ 
                backgroundColor: typeConfig[type]?.color || typeConfig.unknown.color,
                marginTop: '4px'
              }}
            />
          </div>
        ))}
      </div>

      {/* Detailed List */}
      <Collapse 
        bordered={false}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        ghost
      >
        {Object.entries(groupedShapes).map(([type, typeShapes]) => (
          <Panel 
            key={type}
            header={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  color: typeConfig[type]?.color || typeConfig.unknown.color,
                  marginRight: '8px',
                  fontSize: '16px'
                }}>
                  {typeConfig[type]?.icon || typeConfig.unknown.icon}
                </span>
                <span style={{ flex: 1 }}>{type}</span>
                <Badge 
                  count={typeShapes.length} 
                  style={{ 
                    backgroundColor: typeConfig[type]?.color || typeConfig.unknown.color,
                    fontSize: '10px'
                  }} 
                />
              </div>
            }
          >
            <List
              size="small"
              dataSource={typeShapes}
              renderItem={(shape, index) => (
                <List.Item 
                  onClick={() => onHighlightShape(shape)}
                  style={{ 
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                    display: 'block' // Changed to block to allow full-width content
                  }}
                  className="shape-list-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ 
                      color: typeConfig[type]?.color || typeConfig.unknown.color,
                      marginRight: '8px'
                    }}>
                      {typeConfig[type]?.icon || typeConfig.unknown.icon}
                    </span>
                    <span style={{ flex: 1 }}>#{index + 1}</span>
                    {shape.createdAt && (
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {new Date(shape.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  {/* Nodule Properties Section */}
                  {shape.properties && (
                    <div style={{ 
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f5f5f5',
                      borderRadius: '4px'
                    }}>
                      {Object.entries(shape.properties).map(([key, value]) => (
                        <div key={key} style={{ 
                          display: 'flex',
                          fontSize: '12px',
                          marginBottom: '4px',
                          lineHeight: '1.4'
                        }}>
                          <span style={{ 
                            fontWeight: '500',
                            minWidth: '100px',
                            color: '#666'
                          }}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}:
                          </span>
                          <span style={{ color: '#222' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default ShapeSidebar;