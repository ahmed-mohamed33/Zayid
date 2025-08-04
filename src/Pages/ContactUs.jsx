import React, { useState } from "react";
import smsBlack from "../assets/contact/sms-black.svg";
import messageText from "../assets/contact/message-text.svg";
import sms from "../assets/contact/sms.svg";
import call from "../assets/contact/call.svg";
import location from "../assets/contact/location.svg";
import clock from "../assets/contact/clock.svg";
import profile from "../assets/contact/profile.svg";

export default function ContactUs() {
  return (
    <div  className="bg-[#F1F1F1] min-h-screen py-6 px-4 md:px-6 lg:px-14 ">
      <div className=" grid md:grid-cols-2 gap-6">
        {/* **** Right: Contact Form **** */}
        <div
      
          className="py-6 px-4 md:px-6 bg-white rounded-3xl overflow-hidden  "
        >
          <h2 className="font-bold text-[#2D3142] mb-4 text-4xl">تواصل معنا</h2>
          <p className="text-[#2D3142] mb-4">
            نحن هنا للرد على استفساراتك، دعمك، ومساعدتك بكل ترحيب.
          </p>

          <form className="space-y-4">
            <InputField
              label="الاسم"
              placeholder="ادخل اسمك"
              icon={profile}
            />
            <InputField
              label="البريد الإلكتروني"
              placeholder="ادخل بريدك الإلكتروني"
              icon={smsBlack}
            />
            <InputField
              label="رسالتك"
              placeholder="اكتب رسالتك"
              icon={messageText}
              textarea
            />
            <button
              type="submit"
              className="bg-[#FA6300] hover:bg-orange-600 transition-colors text-white w-full py-2 px-6 rounded-md font-bold"
            >
              إرسال رسالة
            </button>
            {/* <p className="text-[#2D3142] text-center">
              سنقوم بالرد على استفسارك في أقرب وقت ممكن.
            </p> */}
          </form>
        </div>

        {/* **** Left: Contact Info **** */}
        <div className="space-y-6">
          <ContactCard
            icon={sms}
            title="البريد الإلكتروني"
            value="support@zayed.com"
          />
          <ContactCard
            icon={call}
            title="رقم الهاتف"
            value="0100 123 4567"
          />
          <ContactCard
            icon={location}
            title="العنوان"
            value="القاهرة، مصر"
          />
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
function InputField({ label, placeholder, icon, textarea = false }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
  };

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
