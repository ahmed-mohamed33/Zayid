import React from 'react'
import InputField from './InputField';
import { useState } from 'react';
import DollarIcon from '../../assets/icons/dollar-circle.svg';
import InformationIcon from '../../assets/icons/information.svg';
import CalendarIcon from '../../assets/icons/calendar-2.svg';
import LocationIcon from '../../assets/icons/location.svg';


function AddAuctionForm() {
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);


  const formStyle ={
    backgroundColor: '#ffffff',
    padding: '52px 56px',
    width: '73%',
    borderRadius: '24px'
  };
  
  return (
    <div style={formStyle}>
      <div style={{color: '#2d3142', fontSize: '28px', fontWeight: '700', marginBottom: '24px'}}>إضافة منتج للمزايدة</div>
      <div style={{display:'flex', marginBottom: '24px'}}>
        <img src={InformationIcon} alt="info" width={24} height={24} />
        <div style={{color:'#fa6300'}}>كل البيانات مطلوبة</div>
      </div>
      <InputField
      label="اسم المنتج"
      placeholder="ادخل اسم المنتج"
      value={productName}
      onChange={(e) => setProductName(e.target.value)}
      />
      <InputField
        label="وصف المنتج"
        placeholder="اكتب وصف المنتج"
        variant="textarea"
        value={productDesc}
        onChange={(e) => setProductDesc(e.target.value)}
      />
      <InputField
        label="صور المنتج"
        variant='file'
        // value={initialPrice}
        // onChange={(e) => setInitialPrice(e.target.value)}
      />
      <div style={{display:'flex', marginBottom: '24px'}}>
        <img src={InformationIcon} alt="info" width={24} height={24} />
        <div style={{color:'#fa6300'}}>يجب ان تكون الصور واضحة وموافقة للوصف وإلا سيتم رفض المزاد</div>
      </div>
      <div style={{color: '#2d3142', fontSize: '24px', fontWeight: '700', marginBottom: '24px'}}>تفاصيل المزاد</div>
      <InputField
        label="السعر الابتدائي"
        placeholder="ادخل السعر الابتدائي"
        variant="icon"
        icon={<img src={DollarIcon} alt="dollar" width={24} height={24} />}
        value={initialPrice}
        onChange={(e) => setInitialPrice(e.target.value)}
      />
      <InputField
        label="الحد الأدنى للزيادة"
        placeholder="ادخل الحد الأدنى للزيادة"
        variant="icon"
        icon={<img src={DollarIcon} alt="dollar" width={24} height={24} />}
        // value={initialPrice}
        // onChange={(e) => setInitialPrice(e.target.value)}
      />
      <InputField
        label="تاريخ ووقت البدء"
        placeholder="يوم/ شهر/ سنة"
        variant="icon"
        icon={<img src={CalendarIcon} alt="CalendarIcon" width={24} height={24} />}
        // value={initialPrice}
        // onChange={(e) => setInitialPrice(e.target.value)}
      />
      <InputField
        label="مكان المعاينة"
        placeholder="ادخل مكان معاينة المنتج"
        variant="icon"
        icon={<img src={LocationIcon} alt="LocationIcon" width={24} height={24} />}
        // value={initialPrice}
        // onChange={(e) => setInitialPrice(e.target.value)}
      />
      <InputField
        label="موعد المعاينة"
        placeholder="يوم/ شهر/ سنة"
        variant="icon"
        icon={<img src={CalendarIcon} alt="CalendarIcon" width={24} height={24} />}
        // value={initialPrice}
        // onChange={(e) => setInitialPrice(e.target.value)}
      />
      <InputField
        label="شروط المزاد"
        placeholder="ادخل شروط المزاد"
        variant='textarea'
        // value={initialPrice}
        // onChange={(e) => setInitialPrice(e.target.value)}
      />
      <div style={{display:'flex', marginBottom: '24px'}}>
        <input
          type="checkbox"
          id="terms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          style={{ marginLeft: '8px' }}
        />
        <div style={{color:'#2d3142'}}> اوافق علي الشروط و الاحكام *</div>
      </div>
      <button style={{
        backgroundColor: '#FA6300', 
        width: '100%', 
        height: '48px', 
        borderRadius:'8px', 
        color:'#fff', 
        fontSize:'18px', 
        fontWeight:'700'}}>إضافة مزاد</button>
    </div>
  )
}

export default AddAuctionForm
