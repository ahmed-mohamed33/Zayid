import React from 'react'
import SmsIcon from '../assets/icons/sms.svg';
import Logo from '../assets/images/Logo.png';
import { useFormik } from 'formik';





export default function Forgetpass() {

    const validate = values => {
    const errors = {};
    if (!values.email) {
      errors.email = 'الرجاء إدخال عنوان بريد إلكتروني صحيح';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'الرجاء إدخال عنوان بريد إلكتروني صحيح';
    }
    return errors;
}

    const formik = useFormik({
        initialValues: {
          email: '',
          password: '',
        },
        validate,
        onSubmit: values => {
          // Handle forget password
          alert(JSON.stringify(values, null, 2));
        },
      });
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F1F1]">
        <form onSubmit={formik.handleSubmit} className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center" dir="rtl">
          {/* Logo and Title */}
          <div className="flex flex-row gap-1 items-center mb-8 w-full">
            <img src={Logo} alt="زايد" className="w-20 h-20 rounded-full mb-2 flex items-start justify-start" />
            <span className="text-5xl font-bold text-gray-700">زايد</span>
          </div>
          {/* Heading */}
          <div className="flex flex-col items-start w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">استرجاع كلمة المرور</h2>
            <p className="text-gray-500 mb-8 text-center">ادخل البريد الالكتروني المرتبط بحسابك لاسترجاع كلمة المرور</p>
          </div>
          {/* Email Input */}
          <div className="w-full mb-2">
            <label className="block text-gray-700 mb-2">البريد الالكتروني</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ادخل البريد الالكتروني"
                className={`w-full pr-12 pl-4 py-3 rounded-lg border ${formik.touched.email && formik.errors.email ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-orange-500 text-gray-700 bg-gray-50`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <img src={SmsIcon} alt="email" className="w-5 h-5" />
              </span>
            </div>
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            ) : null}
          </div>
          
          {/* Login Button */}
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-lg transition mb-4">ارسال الكود</button>
          
        </form>
    </div>
  )
}


import React from 'react'
import SmsIcon from '../assets/svg/sms.svg';
import Logo from '../assets/images/Logo.png';
import { useFormik } from 'formik';





export default function Forget() {

    const validate = values => {
    const errors = {};
    if (!values.email) {
      errors.email = 'الرجاء إدخال عنوان بريد إلكتروني صحيح';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'الرجاء إدخال عنوان بريد إلكتروني صحيح';
    }
    return errors;
}

    const formik = useFormik({
        initialValues: {
          email: '',
          password: '',
        },
        validate,
        onSubmit: values => {
          // Handle login
          alert(JSON.stringify(values, null, 2));
        },
      });
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F1F1]">
        <form onSubmit={formik.handleSubmit} className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center" dir="rtl">
          {/* Logo and Title */}
          <div className="flex flex-row gap-1 items-center mb-8 w-full">
            <img src={Logo} alt="زايد" className="w-20 h-20 rounded-full mb-2 flex items-start justify-start" />
            <span className="text-5xl font-bold text-gray-700">زايد</span>
          </div>
          {/* Heading */}
          <div className="flex flex-col items-start w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500 mb-8 text-center">قم بتسجيل الدخول للوصول إلى حسابك</p>
          </div>
          {/* Email Input */}
          <div className="w-full mb-2">
            <label className="block text-gray-700 mb-2">البريد الالكتروني</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ادخل البريد الالكتروني"
                className={`w-full pr-12 pl-4 py-3 rounded-lg border ${formik.touched.email && formik.errors.email ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-orange-500 text-gray-700 bg-gray-50`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <img src={SmsIcon} alt="email" className="w-5 h-5" />
              </span>
            </div>
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            ) : null}
          </div>
          
          {/* Login Button */}
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-lg transition mb-4">ارسال الكود</button>
          
        </form>
    </div>
  )
}
