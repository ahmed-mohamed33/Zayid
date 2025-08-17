import { useCallback } from "react";
import { getDatabase, ref, get } from "firebase/database";

export const useTermsActions = () => {
  const db = getDatabase();

  // Format date for Arabic locale
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency for Egyptian Pound
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Generate Terms and Conditions PDF
  const generateTermsPDF = useCallback(
    async (auctionData) => {
      try {
        const {
          auctionId,
          sellerName,
          sellerLocation,
          lowestBid,
          insurancePrice,
        } = auctionData;

        if (!auctionId) {
          throw new Error("معرف المزاد مطلوب لإنشاء كراسة الشروط");
        }

        // Fetch seller-specific terms from database
        let sellerTerms = "";
        try {
          const termsRef = ref(db, `auctions/${auctionId}/terms/details`);
          const termsSnapshot = await get(termsRef);
          if (termsSnapshot.exists()) {
            sellerTerms = termsSnapshot.val() || "";
          }
        } catch (error) {
          }

        // Fetch default terms from database with fallback
        let defaultTerms = [
          "يجب على المشتري دفع مبلغ التأمين قبل المشاركة في المزاد",
          "يحق للبائع رفض أي عرض لا يتناسب مع قيمة السلعة",
          "يتحمل المشتري مسؤولية فحص السلعة قبل الشراء",
          "لا يمكن إرجاع السلعة بعد إتمام عملية الشراء",
          "يجب إتمام عملية الدفع خلال 24 ساعة من انتهاء المزاد",
          "يتحمل المشتري تكاليف الشحن والتوصيل",
          "في حالة عدم الدفع، يحق للبائع بيع السلعة للمزايد التالي",
          "جميع المعاملات خاضعة لقوانين جمهورية مصر العربية",
        ];
        try {
          const defaultsRef = ref(db, `settings/defaultTerms`);
          const defaultsSnap = await get(defaultsRef);
          if (defaultsSnap.exists()) {
            const data = defaultsSnap.val();
            const items = Array.isArray(data)
              ? data
              : Array.isArray(data?.items)
              ? data.items
              : [];
            if (items.length > 0) defaultTerms = items;
          }
        } catch (e) {
          }

        // Generate PDF content
        const printContent = `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>كراسة الشروط والأحكام - مزاد رقم ${auctionId}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body { 
                  font-family: 'Arial', 'Tahoma', sans-serif; 
                  direction: rtl; 
                  margin: 20px;
                  line-height: 1.8;
                  color: #333;
                  background-color: #fff;
                }
                
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                }
                
                .header { 
                  text-align: center; 
                  margin-bottom: 40px; 
                  border-bottom: 3px solid #FA6300;
                  padding-bottom: 20px;
                }
                
                .header h1 {
                  color: #FA6300;
                  font-size: 32px;
                  margin-bottom: 10px;
                  font-weight: bold;
                }
                
                .header h2 {
                  color: #666;
                  font-size: 22px;
                  font-weight: normal;
                  margin-bottom: 10px;
                }
                
                .header .date {
                  color: #888;
                  font-size: 16px;
                }
                
                .auction-info { 
                  background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%);
                  padding: 25px; 
                  border-radius: 12px;
                  margin-bottom: 35px;
                  border-right: 6px solid #FA6300;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .auction-info h3 {
                  color: #FA6300;
                  margin-top: 0;
                  font-size: 20px;
                  margin-bottom: 20px;
                  font-weight: bold;
                }
                
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                }
                
                .info-item {
                  background: white;
                  padding: 15px;
                  border-radius: 8px;
                  border: 1px solid #e0e0e0;
                }
                
                .info-label {
                  font-weight: bold;
                  color: #555;
                  font-size: 14px;
                  margin-bottom: 5px;
                }
                
                .info-value {
                  color: #333;
                  font-size: 16px;
                  font-weight: 600;
                }
                
                .terms-section {
                  margin-bottom: 35px;
                }
                
                .terms-section h3 {
                  color: #FA6300;
                  font-size: 22px;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #FA6300;
                  padding-bottom: 8px;
                  font-weight: bold;
                }
                
                .terms-list {
                  list-style: none;
                  padding: 0;
                  counter-reset: term-counter;
                }
                
                .terms-list li {
                  background: #f8f9fa;
                  margin-bottom: 12px;
                  padding: 18px;
                  border-radius: 8px;
                  border-right: 4px solid #FA6300;
                  position: relative;
                  counter-increment: term-counter;
                  font-size: 16px;
                  line-height: 1.6;
                }
                
                .terms-list li:before {
                  content: counter(term-counter);
                  background: #FA6300;
                  color: white;
                  width: 25px;
                  height: 25px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 12px;
                  position: absolute;
                  right: -12px;
                  top: 15px;
                }
                
                .seller-terms {
                  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b3 100%);
                  border: 2px solid #FA6300;
                  border-radius: 12px;
                  padding: 25px;
                  margin-top: 25px;
                  box-shadow: 0 2px 10px rgba(250, 99, 0, 0.1);
                }
                
                .seller-terms h4 {
                  color: #FA6300;
                  margin-top: 0;
                  font-size: 18px;
                  margin-bottom: 15px;
                  font-weight: bold;
                }
                
                .seller-terms-content {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  white-space: pre-wrap;
                  line-height: 1.8;
                  font-size: 16px;
                  border: 1px solid #e0e0e0;
                  min-height: 80px;
                }
                
                .signature-section {
                  margin-top: 50px;
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                }
                
                .signature-box {
                  border: 2px solid #ddd;
                  padding: 25px;
                  text-align: center;
                  border-radius: 10px;
                  background: #fafafa;
                }
                
                .signature-box h4 {
                  color: #FA6300;
                  margin-bottom: 30px;
                  font-size: 18px;
                }
                
                .signature-line {
                  border-bottom: 2px solid #ccc;
                  height: 40px;
                  margin-bottom: 15px;
                }
                
                .date-line {
                  color: #666;
                  font-size: 14px;
                }
                
                .footer {
                  margin-top: 50px;
                  text-align: center;
                  font-size: 14px;
                  color: #666;
                  border-top: 2px solid #ddd;
                  padding-top: 25px;
                }
                
                .footer .logo {
                  color: #FA6300;
                  font-weight: bold;
                  font-size: 18px;
                  margin-bottom: 10px;
                }
                
                @media print {
                  body { 
                    margin: 0; 
                    font-size: 12px;
                  }
                  .container {
                    max-width: none;
                    margin: 0;
                    padding: 15px;
                  }
                  .header { 
                    page-break-after: avoid; 
                  }
                  .terms-section {
                    page-break-inside: avoid;
                  }
                  .signature-section {
                    page-break-before: always;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>كراسة الشروط والأحكام</h1>
                  <h2>مزاد رقم: ${auctionId || "غير محدد"}</h2>
                  <p class="date">تاريخ الإصدار: ${formatDate(new Date())}</p>
                </div>
                
                <div class="auction-info">
                  <h3>معلومات المزاد</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="info-label">اسم البائع:</div>
                      <div class="info-value">${sellerName || "غير محدد"}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">مكان المزاد:</div>
                      <div class="info-value">${
                        sellerLocation || "غير محدد"
                      }</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">أقل مزايدة:</div>
                      <div class="info-value">${
                        lowestBid ? formatCurrency(lowestBid) : "غير محدد"
                      }</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">مبلغ التأمين:</div>
                      <div class="info-value">${
                        insurancePrice
                          ? formatCurrency(insurancePrice)
                          : "غير محدد"
                      }</div>
                    </div>
                  </div>
                </div>

                <div class="terms-section">
                  <h3>الشروط والأحكام العامة</h3>
                  <ul class="terms-list">
                    ${defaultTerms.map((term) => `<li>${term}</li>`).join("")}
                  </ul>
                </div>

                ${
                  sellerTerms
                    ? `
                  <div class="seller-terms">
                    <h4>شروط البائع الخاصة</h4>
                    <div class="seller-terms-content">${sellerTerms}</div>
                  </div>
                `
                    : ""
                }

                <div class="signature-section">
                  <div class="signature-box">
                    <h4>توقيع البائع</h4>
                    <div class="signature-line"></div>
                    <p class="date-line">التاريخ: ___________</p>
                  </div>
                  <div class="signature-box">
                    <h4>توقيع المشتري</h4>
                    <div class="signature-line"></div>
                    <p class="date-line">التاريخ: ___________</p>
                  </div>
                </div>

                <div class="footer">
                  <div class="logo">منصة زايد للمزادات الإلكترونية</div>
                  <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
                  <p>هذه الوثيقة صادرة إلكترونياً ولا تحتاج إلى ختم أو توقيع للمصادقة عليها</p>
                </div>
              </div>
            </body>
          </html>
        `;

        // Open print window with better error handling
        const printWindow = window.open("", "_blank", "width=800,height=600");

        if (!printWindow) {
          throw new Error(
            "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة."
          );
        }

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = () => {
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };

        return {
          success: true,
          message: "تم إنشاء كراسة الشروط بنجاح",
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || "حدث خطأ أثناء إنشاء كراسة الشروط",
        };
      }
    },
    [db, formatDate, formatCurrency]
  );

  return {
    generateTermsPDF,
  };
};

