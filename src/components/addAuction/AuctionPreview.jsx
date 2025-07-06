import React from 'react'

export default function AuctionPreview() {
  return (
    <div style={{
      backgroundColor: '#fff', 
      borderRadius: '16px',
      padding: '24px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      }}>
      <h3 style={{fontSize: '24px', fontWeight:'bold', color: '#2D3142'}}> معاينة المزاد</h3>
      <div style={{
        height: '144px', 
        width: '100%', 
        backgroundColor:'#F1F1F1', 
        borderRadius:'4px',
        display: 'flex', 
        justifyContent:'center', 
        alignItems:'center'}}>لم يتم تحميل صورة بعد</div>

        <p style={{color:'#2D3142'}}>اسم المنتج: - </p>
        <p style={{color:'#2D3142'}}>السعر الابتدائي: -</p>
        <p style={{color:'#2D3142'}}>مدة المزاد: -</p>
    </div>
  )
}
