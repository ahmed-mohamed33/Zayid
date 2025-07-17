import React from "react";
import Lock from "../../assets/icons/lock.svg";
import Vodafone from "../../assets/icons/vodafone.svg";
import Visa from "../../assets/icons/visa.svg";
import {
  formatCardNumber,
  formatCVV,
  formatExpiryDate,
} from "../../utils/formUtils";

function PaymentMethodSelector({
  paymentMethods,
  selectedPayment,
  setSelectedPayment,
  register,
  errors,
  setValue,
}) {
  const renderField = (name, label) => {
    const getFieldConfig = (fieldName) =>
      ({
        phoneNumber: {
          type: "tel",
          placeholder: "01xxxxxxxxx",
          dir: "rtl",
        },
        name: {
          type: "text",
          placeholder: "الاسم كما يظهر على البطاقة",
          dir: "rtl",
        },
        number: {
          type: "text",
          placeholder: "xxxx xxxx xxxx xxxx",
          dir: "ltr",
          maxLength: 19,
        },
        cvv: {
          type: "text",
          placeholder: "xxx",
          dir: "ltr",
          maxLength: 4,
        },
        expiry: {
          type: "text",
          placeholder: "MM/YY",
          dir: "ltr",
          maxLength: 5,
        },
      }[fieldName] || {});

    const config = getFieldConfig(name);
    const formatters = {
      number: formatCardNumber,
      cvv: formatCVV,
      expiry: formatExpiryDate,
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
          className={`input input-bordered w-full text-right ${
            errors[name] ? "input-error" : ""
          }`}
          onChange={
            formatters[name]
              ? (e) => {
                  const formatted = formatters[name](e.target.value);
                  setValue(name, formatted, { shouldValidate: true });
                }
              : undefined
          }
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
    const Icon = { Vodafone, Visa }[method.icon];

    return (
      <div
        key={methodKey}
        className={`card bg-white shadow-md cursor-pointer transition-all duration-300 ${
          isSelected ? "ring-2 ring-orange-500" : ""
        }`}
        onClick={() => setSelectedPayment(methodKey)}
      >
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center text-white">
              <img src={Icon} alt={method.title} className="w-8 h-8" />
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-900">
                {method.title}
              </h3>
              {method.description && (
                <p className="text-sm text-gray-600">{method.description}</p>
              )}
            </div>
          </div>

          {isSelected && (
            <div className="space-y-4">
              {methodKey === "card" ? (
                <>
                  {renderField("name", "اسم حامل البطاقة")}
                  {renderField("number", "رقم البطاقة")}
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("cvv", "رمز الأمان (CVV)")}
                    {renderField("expiry", "تاريخ الانتهاء")}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                    <img src={Lock} alt="Lock" className="w-4 h-4" />
                    <span>معلوماتك آمنة ويتم تشفيرها</span>
                  </div>
                </>
              ) : (
                renderField("phoneNumber", "رقم الهاتف")
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.keys(paymentMethods).map(renderPaymentMethod)}
    </div>
  );
}

export default PaymentMethodSelector;
