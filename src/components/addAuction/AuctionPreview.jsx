import React from 'react'

export default function AuctionPreview() {
  return (
    <div className="bg-white rounded-2xl p-6 w-full flex flex-col gap-5 ">
      <h3 className="text-2xl font-bold text-[#2D3142]">معاينة المزاد</h3>
      <div className="h-36 w-full bg-[#F1F1F1] rounded flex justify-center items-center">
        {images.length > 0 ? (
          <img src={images[0].preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <p className="text-gray-500">لم يتم تحميل صورة بعد</p>    
        )}
      </div>

      <p className="text-[#2D3142]">اسم المنتج: - </p>
      <p className="text-[#2D3142]">السعر الابتدائي: -</p>
      <p className="text-[#2D3142]">مدة المزاد: -</p>
    </div>
  )
}