import React, { useState, useEffect } from 'react';
import Lock from '../assets/icons/Lock.svg';
import Vodafone from '../assets/icons/Vodafone.svg';
import Fawry from '../assets/icons/Fawry.svg';
import Visa from '../assets/icons/Visa.svg';
import { useForm } from 'react-hook-form';
import {
  getFormConfig,
  handlePaymentSubmit,
  getFieldConfig,
  paymentMethods,
  formatCardNumber,
  formatCVV,
  formatExpiryDate
} from '../utils/formUtils';

function Payment() {
  const [selectedPayment, setSelectedPayment] = useState('vodafone');
  const [status, setStatus] = useState({ error: null, success: false });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm(getFormConfig(selectedPayment));

  useEffect(() => {
    reset();
  }, [selectedPayment, reset]);

  const onSubmit = async (values) => {
    try {
      const result = await handlePaymentSubmit(values, selectedPayment);
      setStatus({
        success: result.success,
        error: result.success ? null : result.error
      });
    } catch (error) {
      setStatus({ success: false, error: error.message });
    }
  };

  const renderField = (name, label) => {
    const config = getFieldConfig(name);
    const formatters = {
      number: formatCardNumber,
      cvv: formatCVV,
      expiry: formatExpiryDate
    };

    return (
      <div className="form-control">
        <label className="label">
          <span className="text-lg font-normal leading-normal label-text text-right text-[#2D3142]">
            {label}
          </span>
        </label>
        <input
          {...register(name)}
          {...config}
          className={`input input-bordered w-full text-right ${errors[name] ? 'input-error' : ''}`}
          onChange={formatters[name] ? (e) => {
            const formatted = formatters[name](e.target.value);
            setValue(name, formatted, { shouldValidate: true });
          } : undefined}
        />
        {errors[name] && (
          <div className="text-error text-sm mt-1">{errors[name].message}</div>
        )}
      </div>
    );
  };

  const renderPaymentMethod = (methodKey) => {
    const method = paymentMethods[methodKey];
    const isSelected = selectedPayment === methodKey;
    const Icon = { Vodafone, Fawry, Visa }[method.icon];

    return (
      <div
        key={methodKey}
        className={`card bg-white shadow-md cursor-pointer transition-all duration-300 ${
          isSelected ? 'ring-2 ring-orange-500' : ''
        }`}
        onClick={() => setSelectedPayment(methodKey)}
      >
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center text-white">
              <img src={Icon} alt={method.title} className="w-8 h-8" />
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-900">{method.title}</h3>
              {method.description && (
                <p className="text-sm text-gray-600">{method.description}</p>
              )}
            </div>
          </div>

          {isSelected && (
            <div className="space-y-4">
              {methodKey === 'card' ? (
                <>
                  {renderField('name', 'اسم حامل البطاقة')}
                  {renderField('number', 'رقم البطاقة')}
                  <div className="grid grid-cols-2 gap-4">
                    {renderField('cvv', 'رمز الأمان (CVV)')}
                    {renderField('expiry', 'تاريخ الانتهاء')}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                    <img src={Lock} alt="Lock" className="w-4 h-4" />
                    <span>معلوماتك آمنة ويتم تشفيرها</span>
                  </div>
                </>
              ) : (
                renderField('phoneNumber', 'رقم الهاتف')
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-right mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">إتمام عملية الدفع</h1>
          <p className="text-lg text-gray-700">اختر وسيلة الدفع لإكمال المزاد</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {Object.keys(paymentMethods).map(renderPaymentMethod)}
            </div>

            <div className="lg:w-96 h-fit top-8">
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-2xl font-bold text-gray-900 text-right mb-6">
                    ملخص الفاتورة
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-gray-700">قيمة المزاد</span>
                      <span className="text-2xl font-bold text-gray-900">20.000 ج.م</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-gray-700">قيمة التامين</span>
                      <span className="text-2xl font-bold text-gray-900">1.000 ج.م</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-gray-700">رسوم الخدمة</span>
                      <span className="text-2xl font-bold text-gray-900">1.000 ج.م</span>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-gray-900">المبلغ الإجمالي</span>
                    <span className="text-2xl font-bold text-orange-500">22.000 ج.م</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn bg-[#FA6300] hover:bg-[#e55a00] w-full text-white font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري المعالجة...' : 'اتمام الدفع'}
                  </button>

                  {status.error && (
                    <div className="text-error text-sm mt-4 text-center">{status.error}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Payment;
