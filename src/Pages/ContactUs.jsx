import React, { useState } from "react";
import smsBlack from "../assets/contact/sms-black.svg";
import messageText from "../assets/contact/message-text.svg";
import sms from "../assets/contact/sms.svg";
import call from "../assets/contact/call.svg";
import location from "../assets/contact/location.svg";
import clock from "../assets/contact/clock.svg";
import profile from "../assets/contact/profile.svg";
import Swal from "sweetalert2";
import { sendEmail } from "../config/Firebase";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sendContactEmail = async (data) => {
    try {
      const emailData = {
        to: "ahmedselim33@protonmail.com",
        subject: `رسالة جديدة من ${data.name}`,
        text: `
          اسم المرسل: ${data.name}
          البريد الإلكتروني: ${data.email}
          
          الرسالة:
          ${data.message}
          
          تم إرسال هذه الرسالة من صفحة التواصل في موقع زايد
        `,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #FA6300; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h2 style="margin: 0;">رسالة جديدة من صفحة التواصل</h2>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 20px;">
                <strong style="color: #FA6300;">اسم المرسل:</strong> ${data.name}
              </div>
              <div style="margin-bottom: 20px;">
                <strong style="color: #FA6300;">البريد الإلكتروني:</strong> ${data.email}
              </div>
              <div style="margin-bottom: 20px;">
                <strong style="color: #FA6300;">الرسالة:</strong>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; border-right: 4px solid #FA6300;">
                  ${data.message}
                </div>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                تم إرسال هذه الرسالة من صفحة التواصل في موقع زايد
              </div>
            </div>
          </div>
        `,
      };

      await sendEmail(emailData);
    } catch (error) {
      console.error("Error in sendContactEmail:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      Swal.fire({
        icon: "error",
        title: "خطأ في البيانات",
        text: "يرجى ملء جميع الحقول المطلوبة",
        confirmButtonText: "حسناً",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "error",
        title: "خطأ في البريد الإلكتروني",
        text: "يرجى إدخال بريد إلكتروني صحيح",
        confirmButtonText: "حسناً",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendContactEmail(formData);

      Swal.fire({
        icon: "success",
        title: "تم الإرسال بنجاح!",
        text: "سنقوم بالرد على رسالتك في أقرب وقت ممكن",
        confirmButtonText: "حسناً",
      });

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ في الإرسال",
        text: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى",
        confirmButtonText: "حسناً",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F1F1F1] min-h-screen py-6 px-4 md:px-6 lg:px-14 ">
      <div className=" grid md:grid-cols-2 gap-6">
        {/* **** Right: Contact Form **** */}
        <div className="py-6 px-4 md:px-6 bg-white rounded-3xl overflow-hidden  ">
          <h2 className="font-bold text-[#2D3142] mb-4 text-4xl">تواصل معنا</h2>
          <p className="text-[#2D3142] mb-4">
            نحن هنا للرد على استفساراتك، دعمك، ومساعدتك بكل ترحيب.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="الاسم"
              placeholder="ادخل اسمك"
              icon={profile}
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
            />
            <InputField
              label="البريد الإلكتروني"
              placeholder="ادخل بريدك الإلكتروني"
              icon={smsBlack}
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
            />
            <InputField
              label="رسالتك"
              placeholder="اكتب رسالتك"
              icon={messageText}
              textarea
              value={formData.message}
              onChange={(value) => handleInputChange("message", value)}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#FA6300] hover:bg-orange-600 transition-colors text-white w-full py-2 px-6 rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال رسالة"}
            </button>
          </form>
        </div>

        {/* **** Left: Contact Info **** */}
        <div className="space-y-6">
          <ContactCard
            icon={sms}
            title="البريد الإلكتروني"
            value="support@zayed.com"
          />
          <ContactCard icon={call} title="رقم الهاتف" value="0100 123 4567" />
          <ContactCard icon={location} title="العنوان" value="القاهرة، مصر" />
          <ContactCard
            icon={clock}
            title="ساعات العمل"
            value="السبت - الخميس: 10 ص - 6 م"
          />
        </div>
      </div>
    </div>
  );
}

// Contact Card
function ContactCard({ icon, title, value }) {
  return (
    <div
      style={{ border: "0.5px solid  #B9B9B9" }}
      className="bg-white rounded-3xl px-6 py-8 flex items-center"
    >
      <div
        className="ml-3 flex justify-center"
        style={{
          alignItems: "center",
          backgroundColor: "rgba(250, 99, 0, 0.10)",
          height: "48px",
          width: "48px",
          borderRadius: "24px",
        }}
      >
        <img className="w-6 h-6 object-contain" src={icon} alt="" />
      </div>
      <div className="space-y-1 text-right">
        <h5 className="text-[#2D3142] font-bold">{title}</h5>
        <p className="text-[#2D3142]">{value}</p>
      </div>
    </div>
  );
}

// Input Field with custom placeholder
function InputField({
  label,
  placeholder,
  icon,
  textarea = false,
  value = "",
  onChange,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setHasValue(!!newValue);
    onChange && onChange(newValue);
  };

  // Update hasValue when value prop changes
  React.useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  return (
    <div className="text-right relative">
      <label className="block font-medium text-[#2D3142] mb-2">{label}</label>

      {/* Custom placeholder */}
      {!hasValue && !isFocused && (
        <div
          style={textarea ? {} : { top: "calc(0.67 * 100%)" }}
          className={`absolute ${textarea ? "top-12" : ""} right-4 
      transform ${textarea ? "" : "-translate-y-1/2"} 
      flex items-center text-[#9CA3AF] pointer-events-none space-x-2`}
        >
          {icon && <img src={icon} alt="icon" className="w-6 h-6" />}
          <span className="text-[#5F626F]">{placeholder}</span>
        </div>
      )}

      {textarea ? (
        <textarea
          style={{ height: "96px", resize: "none" }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInput={handleChange}
          className="  w-full p-4 pr-10 rounded-md border border-[#BFC0C0] focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
          rows="4"
        />
      ) : (
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInput={handleChange}
          type="text"
          className="w-full p-4 pr-10 rounded-md border border-[#BFC0C0] focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
        />
      )}
    </div>
  );
}
