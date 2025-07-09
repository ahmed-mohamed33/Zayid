import React, { useState } from 'react';
import Logo from '../assets/images/Logo.png';
import logbg from '../assets/images/logbg.png';
import SmsIcon from '../assets/svg/sms.svg';
import LockIcon from '../assets/svg/lock.svg';
import EyeIcon from '../assets/svg/eye.svg';
import EyeOffIcon from '../assets/svg/eye-off.svg';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = values => {
    const errors = {};
    if (!values.email) {
      errors.email = 'الرجاء إدخال عنوان بريد إلكتروني صحيح';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'الرجاء إدخال عنوان بريد إلكتروني صحيح';
    }

    if (!values.password) {
      errors.password = 'الرجاء إدخال كلمة المرور الصحيحة';
    } else if (values.password.length < 8) {
      errors.password = 'كلمة المرور يجب أن تكون 8 أحرف أو أكثر';
    }
    return errors;
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate,
    onSubmit: () => {
      // Handle login
      navigate('/');
    },
  });

  return (
    <div className="min-h-screen flex bg-[#F1F1F1]">
      {/* Right Side Form (now first) */}
      <div className="flex w-full md:w-1/2 items-center justify-center">
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
          {/* Password Input */}
          <div className="w-full mb-2">
            <label className="block text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                placeholder="ادخل كلمة المرور"
                className="w-full pr-12 pl-4 py-3 rounded-lg border ${formik.touched.password && formik.errors.password ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:border-orange-500 text-gray-700 bg-gray-50"
                dir="rtl"
              />
              
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <img src={LockIcon} alt="password" className="w-5 h-5" />
              </span>
             
              <button
                type="button"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                <img src={showPassword ? EyeIcon : EyeOffIcon } alt="show/hide password" className="w-5 h-5" />
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            ) : null}
          </div>
          {/* Forgot Password */}
          <div className="w-full text-right mb-6">
            <a href="/forgetpass" className="text-sm text-gray-500 hover:underline">هل نسيت كلمة المرور؟</a>
          </div>
          {/* Login Button */}
          
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-lg transition mb-4">تسجيل الدخول</button>
          {/* Register Link */}
          <div className="w-full text-center">
            <span className="text-gray-500">أليس لديك حساب؟ </span>
            <a href="/Register" className="text-orange-500 font-semibold hover:underline">سجل الان</a>
          </div>
        </form>
      </div>
      {/* Left Side Image (now second) */}
      <div className="hidden md:block w-1/2 h-screen">
        <img 
          src={logbg} 
          alt="Join us online" 
          className="object-cover w-full h-full" 
        />
      </div>
    </div>
  );
}
