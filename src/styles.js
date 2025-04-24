const sidebarStyle = {
  width: '300px',
  padding: '16px',
  background: '#fafafa',
  height: '100vh',
  borderLeft: '1px solid #e8e8e8',
  overflowY: 'auto'
};

const propertyFieldStyle = {
  marginBottom: '16px'
};

const selectStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px'
};

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px'
};

const saveButtonStyle = {
  background: '#1890ff',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px'
};
const typeConfig = {
  'nodule-polygon': {
    color: '#f5222d',
    icon: '🔴'
  },
  parenchyma: {
    color: '#52c41a',
    icon: '🟢'
  },
  strap: {
    color: '#faad14',
    icon: '🟡'
  },
  unknown: {
    color: '#d9d9d9',
    icon: '⚪'
  }
};
export  {
  sidebarStyle,
  propertyFieldStyle,
  selectStyle,
  buttonGroupStyle,
  saveButtonStyle,
  typeConfig
};
   