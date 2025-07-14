import React from "react";
import CustomFileUpload from "../signUp/CustomFileUpload";

const styles = {
  inputBase: `
    block w-full rounded-md bg-white p-4 text-base text-gray-900 
    outline-1 -outline-offset-1 outline-gray-300 
    focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200] 
    sm:text-sm/6 pr-12
  `,
  inputGroup: "relative mt-3",
  inputIcon: `
    absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 
    text-gray-400 pointer-events-none
  `,
};

export default function CompanyFields({
  companyName,
  setCompanyName,
  setCompanyImageFile,
  companyImageError,
}) {
  return (
    <>
      {/* Company Name Input */}
      <div>
        <label
          htmlFor="nameCompany"
          className="block text-sm/6 font-medium text-gray-900"
        >
          اسم الشركة (اختياري)
        </label>
        <div className={styles.inputGroup}>
          <input
            id="nameCompany"
            name="nameCompany"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ادخل اسم الشركة"
            className={styles.inputBase}
          />
          <div className={styles.inputIcon}>
            <img
              src="src\assets\icons\buildings.svg"
              alt="buildings"
              className="input-icon"
            />
          </div>
        </div>
      </div>

      {/* Commercial Record Upload */}
      {companyName.trim() !== "" && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            صورة السجل التجاري (إجباري اذا كتبت اسم الشركة)
          </label>
          <CustomFileUpload
            onImageSelect={setCompanyImageFile}
            documentType="commercialRecord"
          />
          {companyImageError && (
            <p className="text-sm text-red-600 mt-2">{companyImageError}</p>
          )}
        </div>
      )}
    </>
  );
}
