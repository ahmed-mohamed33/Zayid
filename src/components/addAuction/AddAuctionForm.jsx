import React, { useState } from 'react';
import InputField from './InputField';
import DollarIcon from '../../assets/icons/dollar-circle.svg';
import InformationIcon from '../../assets/icons/information.svg';
import CalendarIcon from '../../assets/icons/calendar-2.svg';
import LocationIcon from '../../assets/icons/location.svg';
import ProductCategorySelector from './ProductCatigorySelector';
import DateInputField from './DateInput';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function AddAuctionForm() {
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [termsText, setTermsText] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [images, setImages] = useState(null);
  const [errors, setErrors] = useState({});
  const [category, setCategory] = useState('');

  const handleSubmit = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = 'هذا الحقل مطلوب';
    if (!productDesc.trim()) newErrors.productDesc = 'هذا الحقل مطلوب';
    if (!startDate.trim()) newErrors.startDate = 'هذا الحقل مطلوب';
    if (!endDate.trim()) newErrors.endDate = 'هذا الحقل مطلوب';
    if (!location.trim()) newErrors.location = 'هذا الحقل مطلوب';
    if (!inspectionDate.trim()) newErrors.inspectionDate = 'هذا الحقل مطلوب';
    if (!termsText.trim()) newErrors.termsText = 'هذا الحقل مطلوب';
    if (!agreeTerms) newErrors.terms = 'يجب الموافقة على الشروط';
    if (!images) newErrors.images = 'هذا الحقل مطلوب';
    if (!category.trim()) newErrors.category = 'يجب اختيار تصنيف المنتج';


    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      /////////////لو مفيش ايرورز يبعت للفاير بيز
    }
  };

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
        onChange={(e) => {
          setProductName(e.target.value);
          if (errors.productName && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, productName: null }));
          }
        }}
        error={errors.productName}
      />

      <ProductCategorySelector
        selectedCategory={category}
        setSelectedCategory={setCategory}
        error={errors.category}
      />


      <InputField
        label="وصف المنتج"
        placeholder="اكتب وصف المنتج"
        variant="textarea"
        value={productDesc}
        onChange={(e) => {
          setProductDesc(e.target.value);
          if (errors.productDesc && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, productDesc: null }));
          }
        }}
        error={errors.productDesc}
      />

      <InputField
        label="صور المنتج"
        variant="file"
        name="productImage"
        value={images}
        onChange={(e) => {
          const file = e.target.files?.[0];
          setImages(file);
          if (errors.images && file) {
            setErrors(prev => ({ ...prev, images: null }));
          }
        }}
        error={errors.images}
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
        onChange={(e) => {
          const value = e.target.value;
          setInitialPrice(value);

          if (!value.trim()) {
            setErrors(prev => ({ ...prev, initialPrice: 'هذا الحقل مطلوب' }));
          } else if (isNaN(value) || Number(value) <= 0) {
            setErrors(prev => ({ ...prev, initialPrice: 'يجب أن يكون رقمًا صحيحًا أكبر من صفر' }));
          } else {
            setErrors(prev => ({ ...prev, initialPrice: null }));
          }
        }}
        error={errors.initialPrice}
      />

      <InputField
        label="الحد الأدنى للزيادة"
        placeholder="ادخل الحد الأدنى للزيادة"
        variant="icon"
        icon={<img src={DollarIcon} alt="dollar" width={24} height={24} />}
        value={minIncrement}
        onChange={(e) => {
          const val = e.target.value;
          setMinIncrement(val);

          if (!val.trim()) {
            setErrors((prev) => ({ ...prev, minIncrement: 'هذا الحقل مطلوب' }));
          } else if (isNaN(val) || Number(val) <= 0) {
            setErrors((prev) => ({ ...prev, minIncrement: 'يجب أن يكون رقمًا صحيحًا أكبر من صفر' }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.minIncrement;
              return newErrors;
            });
          }
        }}
        error={errors.minIncrement}
      />

      <DateInputField
        label="تاريخ ووقت البدء"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          if (errors.startDate && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, startDate: null }));
          }
        }}
        error={errors.startDate}
      />


      <DateInputField
        label="تاريخ ووقت الانتهاء"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value);
          if (errors.endDate && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, endDate: null }));
          }
        }}
        error={errors.endDate}
      />


      <InputField
        label="مكان المعاينة"
        placeholder="ادخل مكان معاينة المنتج"
        variant="icon"
        icon={<img src={LocationIcon} alt="LocationIcon" width={24} height={24} />}
        value={location}
        onChange={(e) => {
          setLocation(e.target.value);
          if (errors.location && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, location: null }));
          }
        }}
        error={errors.location}
      />

      <DateInputField
        label="موعد المعاينة"
        value={inspectionDate}
        onChange={(e) => {
          setInspectionDate(e.target.value);
          if (errors.inspectionDate && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, inspectionDate: null }));
          }
        }}
        error={errors.inspectionDate}
      />

      <InputField
        label="شروط المزاد"
        placeholder="ادخل شروط المزاد"
        variant="textarea"
        value={termsText}
        onChange={(e) => {
          setTermsText(e.target.value);
          if (errors.termsText && e.target.value.trim()) {
            setErrors(prev => ({ ...prev, termsText: null }));
          }
        }}
        error={errors.termsText}
      />

      <div className="flex mb-2 mt-4">
        <input
          type="checkbox"
          id="terms"
          checked={agreeTerms}
          onChange={(e) => {
            setAgreeTerms(e.target.checked);
            if (errors.terms && e.target.checked) {
              setErrors(prev => ({ ...prev, terms: null }));
            }
          }}
          className="ml-2"
        />
        <label htmlFor="terms" className="text-[#2d3142]"> أوافق على الشروط والأحكام *</label>
      </div>
      {errors.terms && <p className="text-red-600 text-sm mb-4">{errors.terms}</p>}

      <button
        className="bg-[#FA6300] w-full h-12 rounded-lg text-white text-lg font-bold cursor-pointer hover:bg-[#e45a00] transition"
        onClick={handleSubmit}
      >
        إضافة مزاد
      </button>

    </div>
  );
}

export default AddAuctionForm;
