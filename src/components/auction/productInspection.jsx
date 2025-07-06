import React from 'react';
import paper from '../../assets/images/Group 2147226028.png';

function ProductInspection() {
  return (
    <div id="korasetElShroot" className='korasetElShroot w-full bg-white rounded-md shadow-md p-4 my-6'>
      <h2 className=' font-bold text-xl text-[#2D3142] '>خيارات معاينة المنتج</h2>
      <div className='mt-6 w-fit flex flex-col items-center justify-center'>
        <img src={paper} className=' w-auto h-auto'/>
        <h2 className='  text-center font-extrabold my-3 text-[#4F5D75]'>كراسة الشروط </h2>
        <button className='btn bg-[#4F5D75] text-white border-none shadow-none '>شراء كراسة الشروط</button>
        <span className='text-center text-[#44A46F] py-2'>السعر : 3500 جنيه</span>
      </div>
      <button className='bg-[#FFF0E6] p-2 mt-2.5 w-full text-right border-r-4 border-amber-600 rounded text-sm'>
        من اجل معاينة المنتج يجب عليك شراء كراسة الشروط
      </button>
    </div>
  );
}

export default ProductInspection;
