import React from 'react';
import CardsInfo from './CardsInfo';

function ProductDetails({ product }) {
  return (
<div className='detailsSide bg-white w-full md:w-[50%] rounded-md py-9 px-6 shadow-md flex flex-col justify-between'>
      <div>
        <h2 className='text-xl font-bold mb-5'>{product.name}</h2>
        <p className='mb-3 text-lg text-[#2D3142]'>الفئة: {product.category}</p>
        <p className='mb-3 text-lg text-[#2D3142]'>السعر الإفتتاحي: {product.price} ج.م</p>
        <p className='mb-3 text-lg text-[#2D3142]'> موعد البدء : {product.endDate}</p>
        <p className='mb-3 text-lg text-[#2D3142]'> مدة المذاد : {product.allTime}</p>
        <p className='mb-3 text-lg text-[#2D3142]'> نوع المعاينة : {product.type}</p>
        <p className='mb-3 text-lg text-[#2D3142]'> حالة المنتج : {product.condition}</p>

        <button className='flex items-center justify-between bg-[#FFF0E6] cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-sm'>
          <a href='#korasetElShroot'>
          من اجل معاينة المنتج يجب عليك شراء كراسة الشروط
          </a>
          <a href='#korasetElShroot'
           className=' text-green-500  cursor-pointer '>اشتري الان
          </a>
        </button>
      </div>
    </div>
    
  );
}

export default ProductDetails;