import React from 'react';
import uploadIcon from '../../assets/icons/upload.svg'; 

function InputField({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  variant = 'default', 
  icon,
  name,
  accept,
}) {
  const containerStyle = {
    border: '1px solid #bfc0c0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: variant === 'textarea' ? 'column' : 'row',
    alignItems: variant === 'textarea' ? 'flex-start' : 'center',
    padding: '0 16px',
    height: variant === 'textarea' ? '112px' : '56px',
    width: '100%',
    marginBottom: '16px',
    position: 'relative',
    backgroundColor: '#fff',
  };

  const inputStyle = {
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#2D3142',
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    resize: variant === 'textarea' ? 'none' : 'none',
    padding: variant === 'textarea' ? '12px 0' : '0',
  };

  const labelStyle = {
    fontSize: '18px',
    fontWeight: '400',
    color: '#2d3142',
    marginBottom: '4px',
    display: 'block',
  };

  if (variant === 'file') {
    return (
      <div style={{ width: '100%', marginBottom: '16px' }}>
        {label && <label style={labelStyle}>{label}</label>}

        <label
          htmlFor={name}
          style={{
            border: '1px dashed #BFC0C0',
            borderRadius: '8px',
            padding: '16px',
            height: '112px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            textAlign: 'center',
            color: '#6B6E74',
            fontSize: '14px',
          }}
        >
          <img
            src={uploadIcon}
            alt="Upload"
            style={{ width: '32px', height: '32px', marginBottom: '12px' }}
          />
          اسحب الملف هنا أو اضغط للتحميل
        </label>

        <input
          id={name}
          type="file"
          accept={accept}
          name={name}
          onChange={onChange}
          style={{ display: 'none' }}
        />

        {value && (
          <p style={{ fontSize: '12px', color: '#4F5D75', marginTop: '8px' }}>
            تم اختيار: {value.name}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {label && <label style={labelStyle}>{label}</label>}

      <div style={containerStyle}>
        {variant === 'icon' && icon && (
          <span style={{ marginLeft: '4px' }}>{icon}</span>
        )}

        {variant === 'textarea' ? (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={inputStyle}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={inputStyle}
          />
        )}
      </div>
    </div>
  );
}

export default InputField;
