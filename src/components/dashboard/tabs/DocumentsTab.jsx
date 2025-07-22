import React, { memo } from "react";
import { FaIdCard, FaBuilding, FaImage, FaExpand } from "react-icons/fa";

const DocumentsTab = memo(({ localUser, setShowFullImage }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        الوثائق والمستندات
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* National ID */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <FaIdCard className="text-blue-500" />
            صورة الهوية الوطنية
          </h4>
          {localUser.nationalIDImage ? (
            <div className="relative group">
              <img
                src={localUser.nationalIDImage}
                alt="صورة الهوية"
                className="w-full object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFullImage(localUser.nationalIDImage);
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center pointer-events-none">
                <FaExpand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : (
            <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FaImage className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">لا توجد صورة</p>
              </div>
            </div>
          )}
        </div>

        {/* Commercial Record (for companies) */}
        {localUser.isCompany && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <FaBuilding className="text-green-500" />
              السجل التجاري
            </h4>
            {localUser.commercialRecordImage ||
            localUser.commercialRecord ||
            localUser.companyImageFile ? (
              <div className="relative group">
                <img
                  src={
                    localUser.commercialRecordImage ||
                    localUser.commercialRecord ||
                    localUser.companyImageFile
                  }
                  alt="السجل التجاري"
                  className="w-full object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFullImage(
                      localUser.commercialRecordImage ||
                        localUser.commercialRecord ||
                        localUser.companyImageFile
                    );
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center pointer-events-none">
                  <FaExpand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaImage className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">لا توجد صورة</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

DocumentsTab.displayName = "DocumentsTab";

export default DocumentsTab;
