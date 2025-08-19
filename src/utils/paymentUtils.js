import { sendEmail } from "../config/Firebase";

/**
 * Send email to seller about payment completion and request payment details
 */
export const sendSellerPaymentEmail = async (sellerData, buyerData, auctionData) => {
    const { email: sellerEmail, name: sellerName } = sellerData;
    const { email: buyerEmail, name: buyerName, phone: buyerPhone } = buyerData;
    const { title: auctionTitle, id: auctionId, price: auctionPrice } = auctionData;

    if (!sellerEmail || !buyerEmail || !sellerName || !buyerName) {
        console.error(" Missing required email data for seller:", {
            sellerEmail: !!sellerEmail,
            buyerEmail: !!buyerEmail,
            sellerName: !!sellerName,
            buyerName: !!buyerName
        });
        return { success: false, error: "Missing required email data" };
    }

    try {
        const sellerEmailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تم دفع مبلغ الفوز - منصة زايد</title>
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
              .info-box {
                  background-color: #f8f9fa;
                  border: 1px solid #e9ecef;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
              }
              .info-item {
                  margin: 10px 0;
                  padding: 8px 0;
                  border-bottom: 1px solid #e9ecef;
              }
              .info-label {
                  font-weight: bold;
                  color: #495057;
                  display: inline-block;
                  width: 120px;
              }
              .alert {
                  background-color: #fff3cd;
                  border: 1px solid #ffeeba;
                  color: #856404;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
              }
              .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>تم دفع مبلغ الفوز بالمزاد</h1>
                  <p>مبروك! تم دفع مبلغ الفوز لمزادك</p>
              </div>
              
              <div class="content">
                  <h2>مرحباً ${sellerName}،</h2>
                  
                  <p>تم دفع مبلغ الفوز لمزادك <strong>"${auctionTitle}"</strong> بنجاح.</p>
                  
                  <div class="info-box">
                      <h3>تفاصيل المزاد:</h3>
                      <div class="info-item">
                          <span class="info-label">عنوان المزاد:</span>
                          <span>${auctionTitle}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">رقم المزاد:</span>
                          <span>${auctionId}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">مبلغ الفوز:</span>
                          <span>${auctionPrice} جنيه</span>
                      </div>
                  </div>

                  <div class="info-box">
                      <h3>معلومات المشتري:</h3>
                      <div class="info-item">
                          <span class="info-label">الاسم:</span>
                          <span>${buyerName}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">البريد الإلكتروني:</span>
                          <span>${buyerEmail}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">رقم الهاتف:</span>
                          <span>${buyerPhone}</span>
                      </div>
                  </div>

                  <div class="alert">
                      <strong>مهم:</strong> يرجى تزويدنا برقم حسابك البنكي أو رقم فودافون كاش لتحويل المبلغ إليك.
                  </div>

                  <p>بعد استلام معلومات الدفع، سيتم تحويل المبلغ إليك خلال 24-48 ساعة عمل.</p>
                  
                  <p>يرجى التواصل مع المشتري لتنسيق عملية تسليم المزاد.</p>
              </div>
              
              <div class="footer">
                  <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
                  <p>© ${new Date().getFullYear()} زايد. جميع الحقوق محفوظة</p>
              </div>
          </div>
      </body>
      </html>`;

        await sendEmail({
            to: sellerEmail,
            subject: `تم دفع مبلغ الفوز - مزاد "${auctionTitle}"`,
            text: `مرحباً ${sellerName}،

تم دفع مبلغ الفوز لمزادك "${auctionTitle}" بنجاح.

تفاصيل المزاد:
- عنوان المزاد: ${auctionTitle}
- رقم المزاد: ${auctionId}
- مبلغ الفوز: ${auctionPrice} جنيه

معلومات المشتري:
- الاسم: ${buyerName}
- البريد الإلكتروني: ${buyerEmail}
- رقم الهاتف: ${buyerPhone}

مهم: يرجى تزويدنا برقم حسابك البنكي أو رقم فودافون كاش لتحويل المبلغ إليك.

بعد استلام معلومات الدفع، سيتم تحويل المبلغ إليك خلال 24-48 ساعة عمل.

يرجى التواصل مع المشتري لتنسيق عملية تسليم المزاد.`,
            html: sellerEmailHtml,
        });

        console.log("✅ Email sent to seller successfully");
        return { success: true };
    } catch (error) {
        console.error("❌ Failed to send email to seller:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Send email to buyer with seller details and delivery instructions
 */
export const sendBuyerPaymentEmail = async (sellerData, buyerData, auctionData) => {
    const { email: sellerEmail, name: sellerName } = sellerData;
    const { email: buyerEmail, name: buyerName } = buyerData;
    const { title: auctionTitle, id: auctionId, price: auctionPrice } = auctionData;

    if (!sellerEmail || !buyerEmail || !sellerName || !buyerName) {
        console.error("❌ Missing required email data for buyer:", {
            sellerEmail: !!sellerEmail,
            buyerEmail: !!buyerEmail,
            sellerName: !!sellerName,
            buyerName: !!buyerName
        });
        return { success: false, error: "Missing required email data" };
    }

    try {
        const buyerEmailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تم تأكيد الدفع - منصة زايد</title>
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
                  background-color: #28a745;
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
              .info-box {
                  background-color: #f8f9fa;
                  border: 1px solid #e9ecef;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
              }
              .info-item {
                  margin: 10px 0;
                  padding: 8px 0;
                  border-bottom: 1px solid #e9ecef;
              }
              .info-label {
                  font-weight: bold;
                  color: #495057;
                  display: inline-block;
                  width: 120px;
              }
              .success-box {
                  background-color: #d4edda;
                  border: 1px solid #c3e6cb;
                  color: #155724;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
              }
              .steps-box {
                  background-color: #e7f3ff;
                  border: 1px solid #b3d9ff;
                  color: #004085;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
              }
              .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>تم تأكيد الدفع بنجاح! 🎉</h1>
                  <p>مبروك! لقد فزت بالمزاد</p>
              </div>
              
              <div class="content">
                  <h2>مرحباً ${buyerName}،</h2>
                  
                  <div class="success-box">
                      <strong>تم تأكيد دفعك لمزاد "${auctionTitle}" بنجاح!</strong>
                  </div>
                  
                  <div class="info-box">
                      <h3>تفاصيل المزاد:</h3>
                      <div class="info-item">
                          <span class="info-label">عنوان المزاد:</span>
                          <span>${auctionTitle}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">رقم المزاد:</span>
                          <span>${auctionId}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">مبلغ الفوز:</span>
                          <span>${auctionPrice} جنيه</span>
                      </div>
                  </div>

                  <div class="info-box">
                      <h3>معلومات البائع:</h3>
                      <div class="info-item">
                          <span class="info-label">الاسم:</span>
                          <span>${sellerName}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">البريد الإلكتروني:</span>
                          <span>${sellerEmail}</span>
                      </div>
                  </div>

                  <div class="steps-box">
                      <h3>الخطوات التالية لإتمام عملية الاستلام:</h3>
                      <ol style="margin-right: 20px;">
                          <li>تواصل مع البائع عبر البريد الإلكتروني أو الهاتف</li>
                          <li>اتفق مع البائع على موعد ومكان تسليم المزاد</li>
                          <li>احضر معك إثبات الهوية عند الاستلام</li>
                          <li>تأكد من حالة المزاد قبل التوقيع على استلامه</li>
                      </ol>
                  </div>

                  <p><strong>ملاحظة:</strong> تم إرسال معلوماتك للبائع ليتواصل معك لتنسيق عملية التسليم.</p>
                  
                  <p>في حالة وجود أي استفسارات، يمكنك التواصل مع فريق الدعم.</p>
              </div>
              
              <div class="footer">
                  <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
                  <p>© ${new Date().getFullYear()} زايد. جميع الحقوق محفوظة</p>
              </div>
          </div>
      </body>
      </html>`;

        await sendEmail({
            to: buyerEmail,
            subject: `تم تأكيد الدفع - مزاد "${auctionTitle}"`,
            text: `مرحباً ${buyerName}،

تم تأكيد دفعك لمزاد "${auctionTitle}" بنجاح!

تفاصيل المزاد:
- عنوان المزاد: ${auctionTitle}
- رقم المزاد: ${auctionId}
- مبلغ الفوز: ${auctionPrice} جنيه

معلومات البائع:
- الاسم: ${sellerName}
- البريد الإلكتروني: ${sellerEmail}

الخطوات التالية لإتمام عملية الاستلام:
1. تواصل مع البائع عبر البريد الإلكتروني أو الهاتف
2. اتفق مع البائع على موعد ومكان تسليم المزاد
3. احضر معك إثبات الهوية عند الاستلام
4. تأكد من حالة المزاد قبل التوقيع على استلامه

ملاحظة: تم إرسال معلوماتك للبائع ليتواصل معك لتنسيق عملية التسليم.

في حالة وجود أي استفسارات، يمكنك التواصل مع فريق الدعم.`,
            html: buyerEmailHtml,
        });

        console.log("✅ Email sent to buyer successfully");
        return { success: true };
    } catch (error) {
        console.error("❌ Failed to send email to buyer:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Send payment completion emails to both seller and buyer
 */
export const sendPaymentCompletionEmails = async (sellerData, buyerData, auctionData, paymentType) => {
    if (paymentType !== "winner") {
        console.log("📧 Skipping emails for non-winner payment type:", paymentType);
        return { success: true, message: "Emails only sent for winner payments" };
    }

    console.log("🔍 Sending payment completion emails:", {
        sellerData: { email: sellerData.email, name: sellerData.name },
        buyerData: { email: buyerData.email, name: buyerData.name },
        auctionData: { title: auctionData.title, id: auctionData.id, price: auctionData.price }
    });

    try {
        // Send email to seller
        const sellerResult = await sendSellerPaymentEmail(sellerData, buyerData, auctionData);

        // Send email to buyer
        const buyerResult = await sendBuyerPaymentEmail(sellerData, buyerData, auctionData);

        if (sellerResult.success && buyerResult.success) {
            return {
                success: true,
                message: "Both emails sent successfully",
                sellerEmail: sellerResult,
                buyerEmail: buyerResult
            };
        } else {
            return {
                success: false,
                error: "Failed to send one or both emails",
                sellerEmail: sellerResult,
                buyerEmail: buyerResult
            };
        }
    } catch (error) {
        console.error("❌ Error sending payment completion emails:", error);
        return { success: false, error: error.message };
    }
};
