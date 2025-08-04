import React, { useState, useContext, useEffect } from "react";
import { getDatabase, ref, set, get } from "firebase/database";

import { UserContext } from "../../context/UserContext";
import { useParams } from "react-router-dom";
import { getFormattedDate } from "../../utils/dateUtils";
import { sendEmail } from "../../config/Firebase";
function PreviewOptions() {
  const [activeTab, setActiveTab] = useState("personal");

  const { user, auctions } = useContext(UserContext);
  const { auctionId } = useParams();
  const auction = auctions.find((a) => String(a.id) === String(auctionId));
  const [inspectionChoice, setInspectionChoice] = useState("in-person");
  const [hasBookedInspection, setHasBookedInspection] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    //  بيجيب داتا الشخص اللي داخل يشارك في المزاد اللي هي كراسة الشروط اشتراها ولا لا حجز معاينة ولا لا
    const getCurrentData = async () => {
      const db = getDatabase();
      const participantRef = ref(
        db,
        `auctions/${auctionId}/participants/${user.uid}`
      );
      const snapshot = await get(participantRef);
      let fetchedData = {};
      if (snapshot.exists()) {
        fetchedData = snapshot.val();
      }
      setCurrentData(fetchedData);
      if (
        fetchedData.inspectionChoice !== null &&
        fetchedData.inspectionChoice !== undefined &&
        fetchedData.inspectionChoice !== ""
      ) {
        setHasBookedInspection(true);
      } else {
        setHasBookedInspection(false);
      }
    };
    getCurrentData();
  }, [auctionId, user.uid]);

  const updateInspectionChoice = async () => {
    if (hasBookedInspection) {
      return;
    }
    const db = getDatabase();

    const updates = {
      ...currentData,
      inspectionChoice: inspectionChoice,
      inspectionDate: auction?.inspection?.inspectionDate,
      inspectionLocation:
        inspectionChoice === "in-person"
          ? auction?.inspection?.place
          : "online",
    };

    try {
      await sendEmail({
        to: "ahmedselim33@protonmail.com",
        subject: "تأكيد حجز معاينة المزاد",
        text: `تم تأكيد حجز المعاينة الخاصة بك لمزاد "${
          auction?.title || ""
        }" في ${
          inspectionChoice === "in-person"
            ? `الموقع: ${auction?.inspection?.place || "غير محدد"}`
            : "معاينة عبر مكالمة فيديو"
        } بتاريخ ${getFormattedDate(auction, "inspection.inspectionDate")}.`,
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تأكيد حجز المعاينة - زايد</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                direction: rtl;
                text-align: right;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background-color: #FA6300;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .button {
                background-color: #FA6300;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
              .warning {
                background-color: #fff3e0;
                border: 1px solid #ffcc80;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
              }
              .info-box {
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                padding: 15px;
                border-radius: 4px;
                margin: 15px 0;
              }
              .info-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
                flex-direction: row-reverse;
              }
              .info-item:last-child {
                border-bottom: none;
              }
              .info-label {
                font-weight: bold;
                color: #2D3142;
                min-width: 120px;
                margin-right: 15px;
              }
              .info-value {
                color: #666;
                flex: 1;
                text-align: right;
              }
              .success-icon {
                width: 60px;
                height: 60px;
                background-color: #28a745;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                font-size: 24px;
              }
              .text-center {
                text-align: center;
              }
              .text-right {
                text-align: right;
              }
              h1, h2, h3, h4, h5, h6 {
                text-align: right;
              }
              p {
                text-align: right;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>زايد - تأكيد حجز المعاينة</h1>
                <p>معاينة مزاد - ${auction?.title || ""}</p>
              </div>
              
              <div class="content">
                <div class="success-icon">✓</div>
                <h2 class="text-center" style="color: #28a745; margin-bottom: 20px;">تم تأكيد حجز المعاينة بنجاح</h2>
                
                <p>مرحباً <strong>${user.email || "المستخدم"}</strong>،</p>
                <p>نود إعلامك بأنه تم تأكيد حجز المعاينة الخاصة بك بنجاح. إليك تفاصيل الحجز:</p>
                
                <div class="info-box">
                  <h3 style="color: #2D3142; margin-top: 0;">تفاصيل الحجز</h3>
                  
                  <div class="info-item">
                    <span class="info-label">نوع المعاينة:</span>
                    <span class="info-value">
                      ${
                        inspectionChoice === "in-person"
                          ? "معاينة شخصية"
                          : "معاينة عبر مكالمة فيديو"
                      }
                    </span>
                  </div>
                  
                  <div class="info-item">
                    <span class="info-label">موعد المعاينة:</span>
                    <span class="info-value">
                      ${getFormattedDate(auction, "inspection.inspectionDate")}
                    </span>
                  </div>
                  
                  ${
                    inspectionChoice === "in-person"
                      ? `<div class="info-item">
                          <span class="info-label">مكان المعاينة:</span>
                          <span class="info-value">${
                            auction?.inspection?.place || "غير محدد"
                          }</span>
                         </div>`
                      : `<div class="info-item">
                          <span class="info-label">رابط المكالمة:</span>
                          <span class="info-value">سيتم إرساله قبل الموعد</span>
                         </div>`
                  }
                </div>

                <div class="warning">
                  <strong>ملاحظة مهمة:</strong>
                  <p style="margin: 10px 0 0 0;">
                    ${
                      inspectionChoice === "in-person"
                        ? "يرجى التوجه إلى المكان المحدد في الموعد المحدد مع إحضار هوية شخصية."
                        : "ستتلقى رابط Zoom أو Google Meet عبر البريد الإلكتروني قبل الموعد بـ 30 دقيقة."
                    }
                  </p>
                </div>

                <div class="text-center" style="margin: 30px 0;">
                  <a href="https://zayid-itp25.web.app/" class="button">زيارة منصة زايد</a>
                </div>

                <p>إذا كان لديك أي استفسارات، يرجى التواصل مع فريق الدعم الفني.</p>
              </div>
              
              <div class="footer">
                <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
                <p>© 2024 زايد. جميع الحقوق محفوظة</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (err) {
      console.error("sendEmail error:", err);
    }

    await set(
      // هيحدث الداتا في الداتابيس
      ref(db, `auctions/${auctionId}/participants/${user.uid}`),
      updates
    );

    setHasBookedInspection(true);
    setCurrentData(updates);
  };
  return (
    <>
      {hasBookedInspection && auction.status === "approved" ? ( // لو المعاينه محجوزه هيطلعله بيانات الحجز
        <div className="py-4 px-6 bg-white rounded-lg shadow-md border border-gray-200 text-right text-gray-800 font-semibold">
          تم حجز المعاينة بنجاح.
          <br />
          الاختيار المحدد:{" "}
          {currentData.inspectionChoice === "in-person"
            ? "معاينة شخصية"
            : "معاينة عبر مكالمه فيديو"}
          <br />
          الموعد : {getFormattedDate(auction, "inspection.inspectionDate")}
          <br />
          {currentData.inspectionChoice === "in-person" ? (
            <>
              المكان : {currentData.inspectionLocation}
              <br />
              برجاء التوجه إلى المكان المحدد في الموعد المحدد.
            </>
          ) : (
            <>
              المعاينة ستكون عبر الانترنت
              <br />
              ستتلقى رابط Zoom أو Google Meet عبر البريد الإلكتروني.
            </>
          )}
        </div>
      ) : (
        auction.status === "approved" && (
          // هيطلعله انه يحجز
          <div className="py-4 px-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold py-3 text-gray-800">
              خيارات معاينة المزاد
            </h2>

            <div className="flex gap-3 text-gray-500 pb-4 font-bold">
              <p
                className={`py-2 cursor-pointer ${
                  activeTab === "personal"
                    ? "border-b-2 border-orange-500 text-orange-500"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab("personal");
                  setInspectionChoice("in-person");
                }}
              >
                معاينة شخصيه
              </p>
              <p
                className={`py-2 cursor-pointer ${
                  activeTab === "video"
                    ? "border-b-2 border-orange-500 text-orange-500"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab("video");
                  setInspectionChoice("video");
                }}
              >
                معاينة عبر مكالمه فيديو
              </p>
            </div>

            {activeTab === "personal" ? (
              <div className="flex flex-col gap-2 text-gray-600 text-[15px]">
                <span>العنوان : {auction?.inspection?.place}</span>
                <span>
                  المواعيد المتاحة:{" "}
                  {getFormattedDate(auction, "inspection.inspectionDate")}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-gray-600 text-[15px]">
                <p>
                  سيتم ترتيب مكالمة فيديو بين البائع والمشتري لمعاينة المنتج عن
                  بُعد.
                  <span className="block py-2">
                    ستتلقى رابط Zoom أو Google Meet عبر البريد الإلكتروني بعد
                    تأكيد الحجز.
                  </span>
                </p>
                <span>
                  المواعيد المتاحة:{" "}
                  {getFormattedDate(auction, "inspection.inspectionDate")}
                </span>
              </div>
            )}

            {activeTab === "personal" ? (
              <button
                onClick={updateInspectionChoice}
                disabled={hasBookedInspection}
                className="w-fit bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-8 mt-5 cursor-pointer rounded-md hover:bg-orange-600 transition-colors duration-200"
              >
                حجز معاينة شخصية
              </button>
            ) : (
              <button
                onClick={updateInspectionChoice}
                disabled={hasBookedInspection}
                className="w-fit bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-8 mt-5 cursor-pointer rounded-md hover:bg-orange-600 transition-colors duration-200"
              >
                حجز مكالمة فيديو
              </button>
            )}

            <button className="flex items-center justify-between bg-[#FFF0E6] cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-sm">
              ننصح بمعاينة المنتج قبل بدء المزاد للتأكد من مطابقة كل شيء للوصف.
            </button>
          </div>
        )
      )}
    </>
  );
}
export default PreviewOptions;
