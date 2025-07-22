import React, { useState } from 'react';

const faqData = [
  {
    question: 'ما هي منصة ZAYID؟',
    answer:
      'هي منصة إلكترونية ذكية لإدارة المزادات في مختلف المجالات مثل السيارات، العقارات، التحف، الإلكترونيات، وغيرها. المنصة تربط بين البائعين والمشترين في بيئة آمنة وشفافة، وتوفر أدوات متقدمة لتسهيل العمليات والمزايدة.'
  },
  {
    question: 'كيف أشارك في مزاد؟',
    answer: (
      <ul className="list-disc pr-6 space-y-1">
        <li>أنشئ حساب على المنصة.</li>
        <li>استعرض المزادات المتاحة.</li>
        <li>قم بشراء كراسة الشروط الخاصة بالمزاد.</li>
        <li>ادفع مبلغ التأمين (إن وجد).</li>
        <li>بعد بدء المزاد، يمكنك المزايدة بسهولة.</li>
      </ul>
    )
  },
  {
    question: 'ما هي كراسة الشروط؟ ولماذا يجب شراؤها؟',
    answer:
      'كراسة الشروط تحتوي على كافة التفاصيل الخاصة بالمنتج أو العقار المعروض في المزاد، بما في ذلك الصور، المواصفات، الشروط القانونية، وطرق المعاينة. شراء الكراسة ضروري للمشاركة في المعاينة أو المزايدة.'
  },
  {
    question: 'ما هو التأمين؟',
    answer:
      'هو مبلغ مالي بسيط يتم دفعه لضمان جدية المشتري، ويخصم من السعر النهائي في حالة الفوز بالمزاد. يتم استرداده تلقائيًا إذا لم تفز بالمزاد.'
  },
  {
    question: 'ما هي أنواع المعاينة المتاحة؟',
    answer: (
      <ul className="list-disc pr-6 space-y-1">
        <li>معاينة ميدانية: حضور شخصي في موقع المنتج في اليوم المحدد.</li>
        <li>معاينة لايف فيديو: مكالمة فيديو مباشرة مع البائع لمشاهدة المنتج.</li>
        <li>معاينة إلكترونية: من خلال الصور والفيديوهات التي يرفعها البائع على المنصة.</li>
      </ul>
    )
  },
  {
    question: 'كيف أحصل على أموالي إذا لم أفز بالمزاد؟',
    answer:
      'إذا قمت بدفع مبلغ التأمين ولم تفز بالمزاد، فلا تقلق – سيتم استرداد المبلغ تلقائيًا إلى وسيلة الدفع التي استخدمتها (مثل البطاقة أو المحفظة الإلكترونية) خلال فترة زمنية محددة (عادة بين 1 إلى 5 أيام عمل).'
  },
  {
    question: 'كيف أبدأ البيع على ZAYID؟',
    answer: (
      <div>
        <div>إذا كنت بائعًا أو تود عرض منتجاتك للبيع بالمزاد، اتبع الخطوات التالية:</div>
        <ul className="list-disc pr-6 space-y-1 mt-2">
          <li>أنشئ حساب بائع على المنصة (تسجيل الدخول / تسجيل كيان).</li>
          <li>قم بإضافة مزاد جديد من صفحة "إضافة مزاد جديد"، واملأ البيانات:</li>
          <ul className="list-[circle] pr-8 space-y-1">
            <li>عنوان المنتج أو السلعة</li>
            <li>الوصف التفصيلي</li>
            <li>الصور أو الفيديوهات</li>
            <li>سعر البداية</li>
          </ul>
          <li>أرفق كراسة الشروط أو البيانات داخل المزاد (تحتوي على تفاصيل المنتج، شروط التسليم، وطريقة المعاينة).</li>
          <li>حدد نوع المعاينة (حضور شخصي - لايف فيديو - إلكترونية).</li>
          <li>انتظر موافقة فريق ZAYID وسيتم إبلاغك عند تفعيل المزاد وبدء عرض المنتج للمستخدمين.</li>
        </ul>
        <div className="font-bold mt-4">
          بعد انتهاء المزاد وفوز أحد المشترين، يتم إعلامك لإتمام الخطوات التالية (تسليم، استلام المبلغ... إلخ).
        </div>
      </div>
    )
  }
];

export default function FAq() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="rtl bg-gray-100 min-h-screen font-sans flex flex-col items-center py-12 px-2 w-full">
      <div className="w-full max-w-full mx-auto px-4 md:px-8 lg:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-right mb-10 text-gray-800">الأسئلة الشائعة</h2>
        <div className="space-y-5">
          {faqData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-300 rounded-xl shadow-sm transition-all duration-200 overflow-hidden"
            >
              <button
                onClick={() => handleToggle(idx)}
                className={`w-full flex items-center justify-between text-right px-6 py-5 md:py-6 text-lg md:text-xl font-bold text-gray-800 focus:outline-none transition-colors duration-150 ${openIndex === idx ? 'border-b border-gray-100 rounded-t-xl bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <span>{item.question}</span>
                <span
                  className={`text-orange-500 text-2xl transition-transform duration-200 ${openIndex === idx ? 'rotate-180' : ''}`}
                >
                  ▼
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-8 py-6 bg-gray-50 text-gray-700 text-base md:text-lg font-normal border-t border-gray-100 animate-fade-in-down">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
