import { useRef, useState } from "react";
import { uploadToCloudinaryNationalID } from "../utils/CloudinaryNationalID";
import { uploadToCloudinaryCommercialRecord } from "../utils/CloudinaryCommercialRecord";
import uploadIcon from "../assets/icons/Frame.svg";
export default function CustomFileUpload({
  onImageSelect,
  documentType = "nationalId",
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      try {
        setIsUploading(true);
        let cloudinaryUrl;

        if (documentType === "commercialRecord") {
          cloudinaryUrl = await uploadToCloudinaryCommercialRecord(file);
        } else {
          cloudinaryUrl = await uploadToCloudinaryNationalID(file);
        }

        if (onImageSelect) {
          onImageSelect(cloudinaryUrl);
        }
      } catch (error) {
        // You might want to show an error message to the user here
      } finally {
        setIsUploading(false);
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

  const getUploadText = () => {
    if (documentType === "commercialRecord") {
      return "اسحب السجل التجاري هنا أو اضغط للتحميل";
    }
    return "اسحب الهوية الوطنية هنا أو اضغط للتحميل";
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
        className={`mt-3 flex h-[112px] w-full cursor-pointer flex-col justify-center items-center gap-2 rounded-[8px] border border-dashed border-[#BFC0C0] bg-white px-4 py-3
    hover:bg-[#ffe5d1] active:bg-[#cc5200] active:text-white hover:text-white overflow-hidden relative transition-colors duration-200 ${
      isUploading ? "opacity-70 cursor-wait" : ""
    }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={
                documentType === "commercialRecord"
                  ? "معاينة السجل التجاري"
                  : "معاينة الهوية الوطنية"
              }
              className="h-full object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              disabled={isUploading}
            >
              حذف الصورة
            </button>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white">جاري الرفع...</span>
              </div>
            )}
          </>
        ) : (
          <>
            <img src={uploadIcon} alt="رفع" className="w-6 h-6" />
            <span className="text-gray-400">{getUploadText()}</span>
          </>
        )}
      </div>
    </div>
  );
}

