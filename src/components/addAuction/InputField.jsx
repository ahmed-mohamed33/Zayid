import React from "react";
import uploadIcon from "../../assets/icons/upload.svg";

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  variant = "default",
  icon,
  name,
  accept,
  error,
  disabled = false,
  readOnly = false,
  ...props
}) {
  const containerClass = `
    border ${error ? "border-red-500" : "border-[#bfc0c0]"}
    rounded-lg
    flex
    ${variant === "textarea" ? "flex-col items-start" : "flex-row items-center"}
    px-4
    ${variant === "textarea" ? "h-[112px]" : "h-[56px]"}
    w-full
    mb-1
    relative
    bg-white
  `;

  const inputClass = `
    border-none
    outline-none
    text-[16px]
    text-[#2D3142]
    bg-transparent
    w-full
    h-full
    ${variant === "textarea" ? "resize-none py-3" : ""}
  `;

  const labelClass = `
    text-[18px]
    font-normal
    text-[#2d3142]
    mb-1
    block
  `;

  if (variant === "file") {
    return (
      <div className="w-full mb-4">
        {label && <label className={labelClass}>{label}</label>}

        <label
          htmlFor={name}
          className={`
            border ${
              error ? "border-red-500" : "border-dashed border-[#BFC0C0]"
            }
            rounded-lg
            p-4
            h-[112px]
            flex flex-col items-center justify-center
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            text-center
            text-[#6B6E74]
            text-[14px]
          `}
        >
          <img src={uploadIcon} alt="Upload" className="w-8 h-8 mb-3" />
          {disabled
            ? "تم الوصول للحد الأقصى من الصور"
            : " اسحب الملف هنا أو اضغط للتحميل"}
          <span className="text-[12px] text-[#4F5D75] mt-2 list-disc list-inside">
            يمكنك رفع حتى 5 صور فقط الحد الأقصى للملف 5 ميجابايت
          </span>
        </label>

        <input
          id={name}
          type="file"
          accept={accept}
          name={name}
          multiple
          onChange={onChange}
          disabled={disabled}
          className="hidden"
        />

        {value && value.length > 0 && (
          <ul className="text-[12px] text-[#4F5D75] mt-2 list-disc list-inside">
            {Array.from(value).map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        )}

        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full mb-4">
      {label && <label className={labelClass}>{label}</label>}

      <div className={containerClass}>
        {variant === "icon" && icon && <span className="ml-1">{icon}</span>}

        {variant === "textarea" ? (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={inputClass}
            readOnly={readOnly}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={inputClass}
            readOnly={readOnly}
            {...props}
          />
        )}
      </div>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default InputField;
