import React, { useState } from "react";
import SmsIcon from "../assets/icons/sms.svg";
import Logo from "../assets/images/Logo.png";
import { useFormik } from "formik";
import { auth } from "../config/Firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Forgetpass() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "الرجاء إدخال عنوان بريد إلكتروني صحيح";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "الرجاء إدخال عنوان بريد إلكتروني صحيح";
    }
    return errors;
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validate,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        await sendPasswordResetEmail(auth, values.email);
        setSuccessMessage(
          "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        switch (error.code) {
          case "auth/user-not-found":
            setErrorMessage("لا يوجد حساب مرتبط بهذا البريد الإلكتروني");
            break;
          case "auth/invalid-email":
            setErrorMessage("البريد الإلكتروني غير صحيح");
            break;
          case "auth/too-many-requests":
            setErrorMessage(
              "تم تجاوز عدد المحاولات المسموح بها. الرجاء المحاولة لاحقاً"
            );
            break;
          default:
            setErrorMessage("حدث خطأ ما. الرجاء المحاولة مرة أخرى");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center p-4 justify-center bg-[#F1F1F1]">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-lg p-4 md:p-10 flex flex-col items-center"
        dir="rtl"
      >
        <div className="flex flex-row gap-1 items-center mb-8 w-full">
          <img
            src={Logo}
            alt="زايد"
            className="w-20 h-20 rounded-full mb-2 flex items-start justify-start"
          />
          <span className="text-5xl font-bold text-gray-700">زايد</span>
        </div>

        <div className="flex flex-col items-start w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            استرجاع كلمة المرور
          </h2>
          <p className="text-gray-500 mb-8  text-lg">
            ادخل البريد الالكتروني المرتبط بحسابك لاسترجاع كلمة المرور
          </p>
        </div>

        {successMessage && (
          <div className="w-full mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="w-full mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="w-full mb-6">
          <label className="block text-gray-700 mb-2">البريد الالكتروني</label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ادخل البريد الالكتروني"
              className={`w-full pr-12 pl-4 py-3 rounded-lg border ${
                formik.touched.email && formik.errors.email
                  ? "border-red-400"
                  : "border-gray-300"
              } focus:outline-none focus:border-orange-500 text-gray-700 bg-gray-50`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              disabled={loading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <img src={SmsIcon} alt="email" className="w-5 h-5" />
            </span>
          </div>
          {formik.touched.email && formik.errors.email ? (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.email}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className={`w-full ${
            loading ? "bg-orange-400" : "bg-orange-500 hover:bg-orange-600"
          } text-white font-bold py-3 rounded-lg text-lg transition mb-4`}
          disabled={loading}
        >
          {loading ? "جاري الإرسال..." : "ارسال الكود"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-orange-500 hover:text-orange-600 hover:underline cursor-pointer transition"
        >
          العودة إلى تسجيل الدخول
        </button>
      </form>
    </div>
  );
}
