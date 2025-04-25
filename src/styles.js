

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px'
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
const sidebarStyle = {
  width: '300px',
  padding: '16px',
  background: '#fafafa',
  borderLeft: '1px solid #e8e8e8',
  height: '100vh',
  overflowY: 'auto'
};

const propertyFieldStyle = {
  marginBottom: '16px'
};

const selectStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #d9d9d9'
};

const saveButtonStyle = {
  width: '100%',
  padding: '8px',
  background: '#1890ff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  marginTop: '16px'
};
export  {
  sidebarStyle,
  propertyFieldStyle,
  selectStyle,
  buttonGroupStyle,
  saveButtonStyle,
  typeConfig
};
   