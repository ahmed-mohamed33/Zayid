import React, { useState, useContext } from "react";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import CustomFileUpload from "../signUp/CustomFileUpload";
import InputField from "../signUp/InputField";
import PasswordField from "../signUp/PasswordField";
import DateField from "../signUp/DateField";
import CompanyFields from "../signUp/CompanyFields";
import { signupValidationSchema } from "../utils/validationSchemas";
import { ref, get, child, getDatabase } from "firebase/database";
import logo from "../assets/icons/logo-zayid.png";
import information from "../assets/icons/information.svg";
import profile from "../assets/icons/profile.svg";
import sms from "../assets/icons/sms.svg";
import call from "../assets/icons/call.svg";
import securityUser from "../assets/icons/security-user.svg";
import Loading from "../components/common/Loading";
// Form initial values
const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  birthDate: "",
  nationalID: "",
};

export default function SignUp() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useContext(UserContext);

  // Form state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState("");

  // File upload state
  const [idImageFile, setIdImageFile] = useState(null);
  const [companyImageFile, setCompanyImageFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyImageError, setCompanyImageError] = useState("");

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "هذا البريد الإلكتروني مسجل بالفعل";
      case "Firebase: Error (auth/email-already-in-use).":
        return "هذا البريد الإلكتروني مسجل بالفعل";
      case "auth/invalid-email":
        return "البريد الإلكتروني غير صالح";
      case "auth/operation-not-allowed":
        return "التسجيل بالبريد الإلكتروني غير مفعل";
      case "auth/weak-password":
        return "كلمة المرور ضعيفة جداً";
      default:
        return "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى";
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!isChecked) {
      setCheckboxError("يجب الموافقة على الشروط قبل المتابعة");
      isValid = false;
    } else {
      setCheckboxError("");
    }

    if (companyName.trim() !== "" && !companyImageFile) {
      setCompanyImageError("يرجى رفع صورة السجل التجاري");
      isValid = false;
    } else {
      setCompanyImageError("");
    }

    if (!idImageFile) {
      setError("يرجى رفع صورة الهوية الوطنية");
      isValid = false;
    } else {
      setError("");
    }

    return isValid;
  };

  const handleSubmit = async (values) => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError("");
      const dbRef = ref(getDatabase());
      const nationalIDSnapshot = await get(
        child(dbRef, `users/${values.nationalID}`)
      );
      if (nationalIDSnapshot.exists()) {
        setError("هذا الرقم القومي مسجل بالفعل في النظام");
        setIsLoading(false);
        return;
      }
      await register(values, idImageFile, companyName, companyImageFile);
      navigate("/onboarding");
    } catch (error) {
      console.error("Registration error:", error);
      setError(getFirebaseErrorMessage(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isAuthenticated && navigate("/")}
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12  lg:px-8 bg-auth">
        <div className="w-full max-w-[794px] px-[24px] py-[24px] mx-auto bg-white rounded-3xl flex flex-col items-start">
          {/* Header */}
          <img alt="logo-zayid" src={logo} className="size-logo" />
          <h3 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            إنشاء حساب جديد
          </h3>
          <p className="mt-6 font-normal text-[#5F626F]">
            أنشئ حسابك للمشاركة في المزادات
          </p>

          {/* Info Notice */}
          <div className="flex items-center mt-6">
            <img
              src={information}
              alt="information icon"
              className="size-icon-info"
            />
            <p className="text-[#FA6300]">
              كل البيانات المطلوبة يجب أن تطابق بطاقة الرقم القومي
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="w-full mt-4 p-3 rounded bg-red-100 text-red-700">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <Formik
            initialValues={initialValues}
            validationSchema={signupValidationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="w-full space-y-6 mt-6">
              {/* Personal Information */}
              <InputField
                name="fullName"
                type="text"
                label="الاسم الكامل"
                placeholder="ادخل الاسم كاملا"
                icon={profile}
                autoComplete="name"
              />

              <InputField
                name="email"
                type="email"
                label="البريد الإلكتروني"
                placeholder="ادخل البريد الالكتروني"
                icon={sms}
                autoComplete="email"
              />

              <InputField
                name="phone"
                type="tel"
                label="رقم الهاتف"
                placeholder="ادخل رقم الهاتف"
                icon={call}
                autoComplete="tel"
              />

              {/* Password Fields */}
              <PasswordField
                name="password"
                label="كلمة المرور"
                placeholder="ادخل كلمة المرور"
                showPassword={showPassword}
                toggleShowPassword={toggleShowPassword}
              />

              <PasswordField
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                placeholder="ادخل كلمة المرور مرة أخرى"
                showPassword={showPassword}
                toggleShowPassword={toggleShowPassword}
              />

              {/* Birth Date */}
              <DateField name="birthDate" label="تاريخ الميلاد" />

              {/* National ID */}
              <InputField
                name="nationalID"
                type="text"
                label="الرقم القومي"
                placeholder="ادخل الرقم القومي"
                icon={securityUser}
                autoComplete="nationalID"
              />

              {/* ID Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  صورة بطاقة الرقم القومي
                </label>
                <CustomFileUpload
                  onImageSelect={setIdImageFile}
                  documentType="nationalId"
                />
              </div>

              {/* Company Information */}
              <CompanyFields
                companyName={companyName}
                setCompanyName={setCompanyName}
                setCompanyImageFile={setCompanyImageFile}
                companyImageError={companyImageError}
              />

              {/* Terms Agreement */}
              <div className="mt-4 flex items-start gap-2">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  أوافق على الشروط والأحكام
                </label>
              </div>

              {checkboxError && (
                <p className="text-sm text-red-600 mt-1">{checkboxError}</p>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full justify-center items-center h-[48px] rounded-md  text-sm/6 font-semibold shadow-xs ${
                    isLoading
                      ? "bg-slate-500 cursor-not-allowed text-white"
                      : "bg-col-btn-prim hover:bg-[#cc5200]"
                  }`}
                >
                  {isLoading ? "جاري التسجيل..." : "إنشاء حساب"}
                </button>
              </div>
            </Form>
          </Formik>

          {/* Login Link */}
          <p className="mt-6 text-center text-[#2D3142]  text-sm/6">
            لديك حساب بالفعل؟
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="ms-0.5 font-semibold text-[#2D3142] hover:underline cursor-pointer"
            >
              سجل الدخول
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
