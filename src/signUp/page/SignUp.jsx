import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import CustomFileUpload from '../components/CustomFileUpload';

export default function SignUp() {
  //initial validation form
  const initialValues = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    nationalID: '',
  };

  // must valid
  const validationSchema = Yup.object({
    fullName: Yup.string().required('الاسم مطلوب'),
    email: Yup.string()
      .email('بريد إلكتروني غير صحيح')
      .required('الإيميل مطلوب'),
    phone: Yup.string()
      .matches(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صحيح')
      .required('رقم الهاتف مطلوب'),
    password: Yup.string().min(6, 'كلمة المرور قصيرة').required('مطلوبة'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'كلمة المرور غير متطابقة')
      .required('يرجى تأكيد كلمة المرور'),
    birthDate: Yup.string().required('تاريخ الميلاد مطلوب'),
    nationalID: Yup.string()
      .matches(/^\d{14}$/, 'الرقم القومي يجب أن يكون 14 رقمًا')
      .required('الرقم القومي مطلوب'),
  });

  // redundant code
  let input_primary_style =
    'block w-full rounded-md bg-white p-4 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200] sm:text-sm/6 placeholder:opacity-0;';

  const handlePlaceholderVisibility = (e) => {
    const placeholder = e.target.nextElementSibling;
    if (e.target.value) {
      placeholder.style.opacity = 0;
    } else {
      placeholder.style.opacity = 1;
    }
  };

  // agree conditions
  const [isChecked, setIsChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState('');

  // toggle password
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // ensure
  const [companyName, setCompanyName] = useState('');
  const [idImageFile, setIdImageFile] = useState(null);

  //alert if state not upload
  const [companyImageError, setCompanyImageError] = useState('');

  // upload file
  const handleImageSelect = (file) => {
    setIdImageFile(file);
  };

  // validation company img
  const [companyImageFile, setCompanyImageFile] = useState(null);

  const handleSubmit = (values) => {
    if (!isChecked) {
      setCheckboxError('يجب الموافقة على الشروط قبل المتابعة');
      return;
    } else {
      setCheckboxError('');
    }

    if (companyName.trim() !== '' && !companyImageFile) {
      setCompanyImageError('يرجى رفع صورة السجل التجاري');
      return;
    } else {
      setCompanyImageError('');
    }

    console.log(' تم إرسال البيانات');
    console.log('البيانات المرسلة:', values);
  };
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8  bg-auth">
        {/* **** SignUp **** */}
        <div className="w-full max-w-[794px] px-[56px] py-[52px] mx-auto bg-white rounded-md  flex flex-col items-start">
          <img
            alt="logo-zayid"
            src="/assets/logo-zayid.png"
            className="size-logo"
          />
          <h3 className="mt-6 text-center  text-2xl/9 font-bold tracking-tight text-gray-900">
            إنشاء حساب جديد
          </h3>
          <p className="mt-6 font-normal text-[#5F626F]">
            أنشئ حسابك للمشاركة في المزادات
          </p>
          <div className="flex items-center  mt-6">
            {' '}
            <img
              src="/assets/information.svg"
              alt="information icon"
              className="size-icon-info"
            />
            <p className="text-[#FA6300]">
              كل البيانات المطلوبة يجب أن تطابق بطاقة الرقم القومي
            </p>
          </div>

          {/* **** form SignUp **** */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => handleSubmit(values)} //
          >
            {({ handleSubmit }) => (
              <Form className="w-full space-y-6 mt-6">
                {/* fullName Input */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    الاسم الكامل
                  </label>

                  <div className="relative mt-3">
                    <Field
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      className="block w-full rounded-md bg-white p-4 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200] sm:text-sm/6 placeholder:opacity-0"
                      onInput={handlePlaceholderVisibility}
                    />

                    <div className="gap-2 absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 pointer-events-none transition-opacity duration-200">
                      <img
                        src="/assets/profile.svg"
                        alt="avatar"
                        className="input-icon"
                      />
                      <span>ادخل الاسم كاملا</span>
                    </div>
                  </div>

                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    البريد الإلكتروني
                  </label>

                  <div className="relative mt-3">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={input_primary_style}
                      onInput={handlePlaceholderVisibility}
                    />
                    <div className="gap-2 absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 pointer-events-none transition-opacity duration-200">
                      <img
                        src="/assets/sms.svg"
                        alt="email"
                        className="input-icon"
                      />
                      <span>ادخل البريد الالكتروني</span>
                    </div>
                  </div>

                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* **** Phone **** */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    رقم الهاتف
                  </label>
                  <div className="relative  mt-3">
                    <Field
                      id="phone"
                      name="phone"
                      type="string"
                      autoComplete="cc-number"
                      className="block w-full rounded-md bg-white p-4 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200]"
                      onInput={handlePlaceholderVisibility}
                    />

                    <div className="gap-2 absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 pointer-events-none transition-opacity duration-200">
                      <img
                        src="/assets/call.svg"
                        alt="avatar"
                        className="input-icon"
                      />
                      <span>ادخل رقم الهاتف</span>
                    </div>
                  </div>{' '}
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* **** password **** */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    كلمة المرور
                  </label>

                  <div className="relative mt-3">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="block w-full rounded-md bg-white p-4 pr-12 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200] sm:text-sm/6 placeholder:opacity-0"
                      onInput={handlePlaceholderVisibility}
                    />

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 transition-opacity duration-200 pointer-events-none">
                      <img
                        src="/assets/lock.svg"
                        alt="lock icon"
                        className="input-icon"
                      />
                      <span>ادخل كلمة المرور</span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute left-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    >
                      <img
                        src={
                          showPassword
                            ? '/assets/eye-off.svg'
                            : '/assets/eye.svg'
                        }
                        alt="toggle visibility"
                        className="input-icon"
                      />
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* **** confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    نأكيد كلمة المرور
                  </label>

                  <div className="relative mt-3">
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="block w-full rounded-md bg-white p-4 pr-12 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200] sm:text-sm/6 placeholder:opacity-0"
                      onInput={handlePlaceholderVisibility}
                    />

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 transition-opacity duration-200 pointer-events-none">
                      <img
                        src="/assets/lock.svg"
                        alt="lock icon"
                        className="input-icon"
                      />
                      <span>ادخل كلمة المرور</span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute left-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    >
                      <img
                        src={
                          showPassword
                            ? '/assets/eye-off.svg'
                            : '/assets/eye.svg'
                        }
                        alt="toggle visibility"
                        className="input-icon"
                      />
                    </button>
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* **** birthDate **** */}
                <div>
                  <label
                    htmlFor="birthDate"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    تاريخ الميلاد
                  </label>
                  <div className="relative  mt-3">
                    <Field
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      required
                      autoComplete="number"
                      className={input_primary_style}
                      onInput={handlePlaceholderVisibility}
                    />
                    <div className="gap-2 absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 pointer-events-none transition-opacity duration-200">
                      <img
                        src="/assets/calendar.svg"
                        alt="calendar"
                        className="input-icon"
                      />
                      <span>ادخل تاريخ الميلاد</span>
                    </div>
                  </div>
                  <ErrorMessage
                    name="birthDate"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* ID */}
                <div>
                  <label
                    htmlFor="nationalID"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    الرقم القومي
                  </label>
                  <div className="relative  mt-3">
                    <Field
                      id="nationalID"
                      name="nationalID"
                      required
                      autoComplete="number"
                      className={input_primary_style}
                      onInput={handlePlaceholderVisibility}
                    />
                    <div className="gap-2 absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 pointer-events-none transition-opacity duration-200">
                      <img
                        src="/assets/security-user.svg"
                        alt="user"
                        className="input-icon"
                      />
                      <span>ادخل الرقم القومي</span>
                    </div>
                  </div>
                  <ErrorMessage
                    name="nationalID"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                {/* ****ID img**** */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    صورة بطاقة الرقم القومي
                  </label>
                  <CustomFileUpload onImageSelect={setIdImageFile} />
                </div>

                {/* name company */}
                <div>
                  <label
                    htmlFor="nameCompany"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    اسم الشركة (اختياري)
                  </label>
                  <div className="relative  mt-3">
                    <input
                      id="nameCompany"
                      name="nameCompany"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      autoComplete="text"
                      className={input_primary_style}
                      onInput={handlePlaceholderVisibility}
                    />
                    <div className="gap-2 absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 pointer-events-none transition-opacity duration-200">
                      <img
                        src="/assets/buildings.svg"
                        alt="buildings"
                        className="input-icon"
                      />
                      <span>ادخل اسم الشركة</span>
                    </div>
                  </div>
                </div>

                {/* **** CR img */}
                {companyName.trim() !== '' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      صورة السجل التجاري (إجباري اذا كتبت اسم الشركة؟)
                    </label>

                    <CustomFileUpload onImageSelect={setCompanyImageFile} />

                    {companyImageError && (
                      <p className="text-sm text-red-600 mt-2">
                        {companyImageError}
                      </p>
                    )}
                  </div>
                )}

                {/* **** agree conditions **** */}
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

                {/* **** approve all **** */}
                {checkboxError && (
                  <p className="text-sm text-red-600 mt-1">{checkboxError}</p>
                )}

                {/* **** btn submit **** */}
                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold shadow-xs bg-col-btn-prim"
                  >
                    إنشاء حسااب
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          {/* **** alredy have account **** */}
          <p className="mt-10 text-center text-sm/6">
            لديك حساب بالفعل؟
            <a
              href="#"
              className="ms-0.5 font-semibold text-black hover:text-black"
            >
              سجل الدخول
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
