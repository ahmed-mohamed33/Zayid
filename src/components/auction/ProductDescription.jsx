import React from 'react';

function ProductDescription({ description }) {
  return (
    <div className='description bg-white rounded-md shadow-md p-4'>
      <h3 className='font-semibold text-lg mb-2'>الوصف الكامل</h3>
      <p className='text-gray-700 leading-relaxed'>{description}</p>
    </div>
  );
}

export default ProductDescription;
