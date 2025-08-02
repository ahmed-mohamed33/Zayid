import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../addAuction/InputField";
import DollarIcon from "../../assets/icons/dollar-circle.svg";
import InformationIcon from "../../assets/icons/information.svg";
import LocationIcon from "../../assets/icons/location.svg";
import ProductCategorySelector from "./ProductCatigorySelector";
import DateInputField from "../addAuction/DateInput";
import { UserContext } from "../../context/UserContext";
import { IoIosArrowDown } from "react-icons/io";

function AddAuctionForm() {
  const navigate = useNavigate();
  const { user, userData, isAuthenticated, createAuction } =
    useContext(UserContext);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [minIncrement, setMinIncrement] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [termsText, setTermsText] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // add productCondition
  const [productCondition, setProductCondition] = useState("new");

  // Image upload limits
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files would exceed the limit
    if (images.length + files.length > MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        images: `يمكنك رفع ${MAX_IMAGES} صور كحد أقصى. لديك ${images.length} صور حالياً.`,
      }));
      return;
    }

    // Validate each file
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(
          `${file.name} - حجم الملف كبير جداً (الحد الأقصى 5MB)`
        );
        return;
      }

      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(
          `${file.name} - نوع الملف غير مدعوم (JPG, PNG, WebP فقط)`
        );
        return;
      }

      validFiles.push(file);
    });

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        images: invalidFiles.join("\n"),
      }));
      return;
    }

    // Add valid files
    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);

    // Clear any previous image errors
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    // Show success message for valid uploads
    if (validFiles.length > 0) {
      console.log(`تم رفع ${validFiles.length} صور بنجاح`);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Validation
    if (!productName.trim()) newErrors.productName = "هذا الحقل مطلوب";
    if (!productDesc.trim()) newErrors.productDesc = "هذا الحقل مطلوب";
    if (!location.trim()) newErrors.location = "هذا الحقل مطلوب";
    if (!termsText.trim()) newErrors.termsText = "هذا الحقل مطلوب";
    if (!agreeTerms) newErrors.terms = "يجب الموافقة على الشروط";
    if (!images || images.length === 0) {
      newErrors.images = "هذا الحقل مطلوب";
    } else if (images.length > MAX_IMAGES) {
      newErrors.images = `يمكنك رفع ${MAX_IMAGES} صور كحد أقصى`;
    }
    if (!category.trim()) newErrors.category = "يجب اختيار تصنيف المنتج";
    if (!initialPrice.trim()) newErrors.initialPrice = "هذا الحقل مطلوب";
    if (!minIncrement.trim()) newErrors.minIncrement = "هذا الحقل مطلوب";
    if (!productCondition)
      newErrors.productCondition = "يجب اختيار حالة المنتج";
    // Date validation
    const now = new Date();

    // Validate start date
    if (!startDate.trim()) {
      newErrors.startDate = "هذا الحقل مطلوب";
    } else {
      const startDateTime = new Date(startDate);
      if (isNaN(startDateTime.getTime())) {
        newErrors.startDate = "تاريخ غير صالح";
      } else if (startDateTime < now) {
        newErrors.startDate = "يجب أن يكون تاريخ البدء في المستقبل";
      }
    }

    // Validate end date
    if (!endDate.trim()) {
      newErrors.endDate = "هذا الحقل مطلوب";
    } else {
      const endDateTime = new Date(endDate);
      const startDateTime = new Date(startDate);
      if (isNaN(endDateTime.getTime())) {
        newErrors.endDate = "تاريخ غير صالح";
      } else if (endDateTime <= startDateTime) {
        newErrors.endDate = "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء";
      }
    }

    // Validate inspection date
    if (!inspectionDate.trim()) {
      newErrors.inspectionDate = "هذا الحقل مطلوب";
    } else {
      const inspectionDateTime = new Date(inspectionDate);
      const startDateTime = new Date(startDate);
      if (isNaN(inspectionDateTime.getTime())) {
        newErrors.inspectionDate = "تاريخ غير صالح";
      } else if (inspectionDateTime >= startDateTime) {
        newErrors.inspectionDate =
          "يجب أن يكون موعد المعاينة قبل تاريخ بدء المزاد";
      }
    }
    scrollTo(0, 0);

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        setUploadProgress(10);

        const imageFiles = images.map((img) => img.file);
        const auctionData = {
          title: productName,
          description: productDesc,
          categoryId: category,
          startPrice: Number(initialPrice),
          minIncrement: Number(minIncrement),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          seller: {
            name: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            id: userData.userId || "",
          },
          inspection: {
            place: location,
            inspectionDate: new Date(inspectionDate).toISOString(),
          },
          terms: {
            details: termsText,
            price: Math.round(initialPrice * 0.05),
          },
          // بضيف حاله المنتج للمزاد
          productCondition: productCondition,
        };

        await createAuction(auctionData, imageFiles);

        setUploadProgress(100);
        navigate("/");
      } catch (error) {
        setErrors({
          submit:
            error.message ||
            "حدث خطأ أثناء إنشاء المزاد. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl max-md:w-full w-[75%]">
      <div className="text-[#2d3142] text-2xl font-bold mb-6">
        إضافة منتج للمزايدة
      </div>

      <div className="flex mb-6 gap-2">
        <img src={InformationIcon} alt="info" width={24} height={24} />
        <div className="text-[#fa6300]">كل البيانات مطلوبة</div>
      </div>

      {errors.submit && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {uploadProgress > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#FA6300] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            جاري رفع الصور والبيانات... {uploadProgress}%
          </p>
        </div>
      )}

      <InputField
        label="اسم المنتج"
        placeholder="ادخل اسم المنتج"
        value={productName}
        onChange={(e) => {
          setProductName(e.target.value);
          if (errors.productName && e.target.value.trim()) {
            setErrors((prev) => ({ ...prev, productName: null }));
          }
        }}
        error={errors.productName}
      />
      <label className="text-[18px]  font-normal  text-[#2d3142]  block">
        اختر فئة المزاد
      </label>
      <ProductCategorySelector
        selectedCategory={category}
        setSelectedCategory={(val) => {
          setCategory(val);
          if (errors.category && val.trim()) {
            setErrors((prev) => ({ ...prev, category: null }));
          }
        }}
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
            setErrors((prev) => ({ ...prev, productDesc: null }));
          }
        }}
        error={errors.productDesc}
      />
      <div className="mb-4">
        <label className="text-[#2d3142] text-base font-medium mb-2 block">
          حالة المنتج
        </label>
        <div className="dropdown dropdown-bottom w-full">
          <div
            tabIndex={0}
            role="button"
            className="btn bg-transparent border-1 text-right w-full flex justify-between items-center"
          >
            {productCondition === "new"
              ? "جديد"
              : productCondition === "veryGood"
              ? "جيد جدًا"
              : "مستعمل"}
            <IoIosArrowDown className="text-orange-500" />
          </div>

          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-10 w-full p-2 shadow-sm"
          >
            <li>
              <a
                onClick={() => {
                  setProductCondition("new");
                  if (errors.productCondition) {
                    setErrors((prev) => ({ ...prev, productCondition: null }));
                  }
                }}
              >
                جديد
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setProductCondition("veryGood");
                  if (errors.productCondition) {
                    setErrors((prev) => ({ ...prev, productCondition: null }));
                  }
                }}
              >
                جيد جدًا
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  setProductCondition("old");
                  if (errors.productCondition) {
                    setErrors((prev) => ({ ...prev, productCondition: null }));
                  }
                }}
              >
                مستعمل
              </a>
            </li>
          </ul>
        </div>
        {errors.productCondition && (
          <p className="text-red-600 text-sm mt-1">{errors.productCondition}</p>
        )}
      </div>

      <InputField
        label="صور المنتج"
        variant="file"
        name="productImage"
        multiple={true}
        onChange={handleImageChange}
        error={errors.images}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        disabled={images.length >= MAX_IMAGES}
      />

      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              الصور المرفوعة ({images.length}/{MAX_IMAGES})
            </h4>
            {images.length < MAX_IMAGES && (
              <span className="text-xs text-green-600">
                يمكنك إضافة {MAX_IMAGES - images.length} صور أخرى
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative border border-gray-300 rounded-lg p-2"
              >
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-contain rounded-lg"
                />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={() => {
                      setImages((prevImages) => {
                        const newImages = prevImages.filter(
                          (_, i) => i !== index
                        );
                        if (newImages.length === 0) {
                          setErrors((prev) => ({
                            ...prev,
                            images: "هذا الحقل مطلوب",
                          }));
                        }
                        return newImages;
                      });
                    }}
                    className="bg-[#f77518] text-white cursor-pointer rounded-md px-2 py-1 hover:bg-[#e45a00] text-xs"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex mb-6 gap-2">
        <img src={InformationIcon} alt="info" width={24} height={24} />
        <div className="text-[#fa6300]">
          يجب ان تكون الصور واضحة وموافقة للوصف وإلا سيتم رفض المزاد
        </div>
      </div>

      <div className="text-[#2d3142] text-xl font-bold mb-6">تفاصيل المزاد</div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
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
                setErrors((prev) => ({
                  ...prev,
                  initialPrice: "هذا الحقل مطلوب",
                }));
              } else if (isNaN(value) || Number(value) <= 0) {
                setErrors((prev) => ({
                  ...prev,
                  initialPrice: "يجب أن يكون رقمًا صحيحًا أكبر من صفر",
                }));
              } else {
                setErrors((prev) => ({ ...prev, initialPrice: null }));
              }
            }}
            error={errors.initialPrice}
          />
        </div>
        <div className="flex-1">
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
                setErrors((prev) => ({
                  ...prev,
                  minIncrement: "هذا الحقل مطلوب",
                }));
              } else if (isNaN(val) || Number(val) <= 0) {
                setErrors((prev) => ({
                  ...prev,
                  minIncrement: "يجب أن يكون رقمًا صحيحًا أكبر من صفر",
                }));
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
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <DateInputField
            label="تاريخ ووقت البدء"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (errors.startDate && e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, startDate: null }));
              }
            }}
            error={errors.startDate}
          />
        </div>
        <div className="flex-1">
          <DateInputField
            label="تاريخ ووقت الانتهاء"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (errors.endDate && e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, endDate: null }));
              }
            }}
            error={errors.endDate}
          />
        </div>
      </div>
      <InputField
        label="مكان المعاينة"
        placeholder="ادخل مكان معاينة المنتج"
        variant="icon"
        icon={
          <img src={LocationIcon} alt="LocationIcon" width={24} height={24} />
        }
        value={location}
        onChange={(e) => {
          setLocation(e.target.value);
          if (errors.location && e.target.value.trim()) {
            setErrors((prev) => ({ ...prev, location: null }));
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
            setErrors((prev) => ({ ...prev, inspectionDate: null }));
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
            setErrors((prev) => ({ ...prev, termsText: null }));
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
              setErrors((prev) => ({ ...prev, terms: null }));
            }
          }}
          className="ml-2"
        />
        <label htmlFor="terms" className="text-[#2d3142]">
          {" "}
          أوافق على الشروط والأحكام *
        </label>
      </div>
      {errors.terms && (
        <p className="text-red-600 text-sm mb-4">{errors.terms}</p>
      )}
      <button
        className={`bg-[#FA6300] w-full h-12 rounded-lg text-white text-lg font-bold cursor-pointer hover:bg-[#e45a00] transition ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
        }`}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري إنشاء المزاد..." : "إضافة مزاد"}
      </button>
    </div>
  );
}

export default AddAuctionForm;
