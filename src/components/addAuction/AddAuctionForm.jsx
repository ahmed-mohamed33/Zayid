import React from 'react'
import InputField from './InputField';
import { useState } from 'react';
import DollarIcon from '../../assets/icons/dollar-circle.svg';
import InformationIcon from '../../assets/icons/information.svg';
import CalendarIcon from '../../assets/icons/calendar-2.svg';
import LocationIcon from '../../assets/icons/location.svg';
import CatigorySelector from './ProductCatigorySelector'

function AddAuctionForm() {
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <div className="bg-white p-6 rounded-3xl">
      <div className="text-[#2d3142] text-2xl font-bold mb-6">إضافة منتج للمزايدة</div>
      <div className="flex mb-6 gap-2">
        <img src={InformationIcon} alt="info" width={24} height={24} />
        <div className="text-[#fa6300]">كل البيانات مطلوبة</div>
      </div>
      <InputField
      label="اسم المنتج"
      placeholder="ادخل اسم المنتج"
      value={productName}
      onChange={(e) => setProductName(e.target.value)}
      />
      <CatigorySelector/>
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
      <div className="flex mb-6 gap-2">
        <img src={InformationIcon} alt="info" width={24} height={24} />
        <div className="text-[#fa6300]">يجب ان تكون الصور واضحة وموافقة للوصف وإلا سيتم رفض المزاد</div>
      </div>

      <div className="text-[#2d3142] text-xl font-bold mb-6">تفاصيل المزاد</div>
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
        label="تاريخ ووقت الانتهاء"
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
      <div className="flex mb-6">
        <input
          type="checkbox"
          id="terms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="ml-2"
        />
        <div className="text-[#2d3142]"> اوافق علي الشروط و الاحكام *</div>
      </div>
      <button className="bg-[#FA6300] w-full h-12 rounded-lg text-white text-lg font-bold">
        إضافة مزاد
      </button>
    </div>
  )
}

export default AddAuctionForm;