import React from 'react'
import SparkleIcon from '../../assets/icons/sparkle.svg';

const tipStyle ={
  fontSize: '16px',
  fontWeight: 'medium',
  color: '#2D3142',
}
const iconStyle ={
  color: '#4F5D75',
  width: '16px',
  height: '16px'
}
const lineStyle ={
  display: 'flex',
  gap: '4px',
  justifyContent: 'right',
  alignItems: 'center',
}

export default function sideBarTips() {

  return (
    <div style={{
      backgroundColor: '#fff', 
      borderRight: '4px solid #fa6300',
      borderRadius: '16px',
      padding: '24px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      }}>
      
      <h3 style={{fontSize: '24px', fontWeight:'bold', color: '#2D3142'}}>نصائح لإنشاء مزاد ناجح</h3>
      <div style={lineStyle}>
        <img src={SparkleIcon} style={iconStyle}></img>
        <div style={tipStyle}>استخدم صوراً واضحة وعالية الجودة للمنتج</div>
      </div>
      <div style={lineStyle}>
        <img src={SparkleIcon} style={iconStyle}></img>
        <div style={tipStyle}>قدم وصفاً تفصيلياً يشمل المواصفات والحالة</div>
      </div>
      <div style={lineStyle}>
        <img src={SparkleIcon} style={iconStyle}></img>
        <div style={tipStyle}>حدد سعراً ابتدائياً منطقياً لجذب المزايدين</div>
      </div>
      <div style={lineStyle}>
        <img src={SparkleIcon} style={iconStyle}></img>
        <div style={tipStyle}>اختر مدة مناسبة للمزاد (3-7 أيام مثالية)</div>
      </div>
      <div style={lineStyle}>
        <img src={SparkleIcon} style={iconStyle}></img>
        <div style={tipStyle}>كن واضحاً بشأن سياسة الشحن والاسترجاع</div>
      </div>
    </div>
  )
}
