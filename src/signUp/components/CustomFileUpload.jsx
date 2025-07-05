import { useRef, useState } from 'react';

export default function CustomFileUpload({ onImageSelect }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div
        onClick={handleClick}
        className="mt-3 flex h-[112px] w-full cursor-pointer flex-col justify-center items-center gap-2 rounded-[8px] border border-dashed border-[#BFC0C0] bg-white px-4 py-3
    hover:bg-[#ffe5d1] active:bg-[#cc5200] active:text-white hover:text-white overflow-hidden relative transition-colors duration-200"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="معاينة الصورة"
              className="h-full object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
            >
              حذف الصورة
            </button>
          </>
        ) : (
          <>
            <img src="/assets/Frame.svg" alt="رفع" className="w-6 h-6" />
            <span className="text-gray-400 ">
              اسحب الملف هنا أو اضغط للتحميل
            </span>
          </>
        )}
      </div>
    </div>
  );
}
