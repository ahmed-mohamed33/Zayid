import { useState, useCallback } from 'react';
import { getDatabase, ref, push, update as dbUpdate, get } from 'firebase/database';
import { sendEmail } from '../config/Firebase';

export const useDisputeActions = () => {
    const [loading, setLoading] = useState(false);
    const db = getDatabase();

    const createDispute = useCallback(async (disputeData) => {
        try {
            setLoading(true);
            const {
                auctionId,
                userId,
                reason,
                description,
                amount,
                userName,
                userEmail,
                userPhone,
                auctionTitle,
                auctionPrice,
                auctionEndDate,
                sellerId,
                sellerName,
                sellerEmail,
                sellerPhone
            } = disputeData;

            // Get dispute settings
            const settingsRef = ref(db, 'settings/disputes');
            const settingsSnap = await get(settingsRef);
            const settings = settingsSnap.exists() ? settingsSnap.val() : null;

            if (!settings?.enabled) {
                throw new Error('نظام النزاعات غير مفعل حالياً');
            }

            if (amount < settings.minDisputeAmount) {
                throw new Error(`الحد الأدنى لمبلغ النزاع هو ${settings.minDisputeAmount} جنيه`);
            }

            // Create dispute
            const disputeRef = push(ref(db, 'disputes'));
            const disputeId = disputeRef.key;

            const now = new Date().toISOString();
            const slaDeadline = new Date();
            slaDeadline.setHours(slaDeadline.getHours() + settings.slaHours);

            const escalationDate = new Date();
            escalationDate.setDate(escalationDate.getDate() + settings.escalationDays);

            const autoCloseDate = new Date();
            autoCloseDate.setDate(autoCloseDate.getDate() + settings.autoCloseAfterDays);

            const timelineKey = Date.now().toString();

            const dispute = {
                id: disputeId,
                auctionId,
                auctionTitle,
                auctionPrice,
                auctionEndDate,
                userId,
                userName,
                userEmail,
                userPhone,
                sellerId,
                sellerName,
                sellerEmail,
                sellerPhone,
                reason,
                description,
                amount,
                status: 'pending',
                createdAt: now,
                slaDeadline: slaDeadline.toISOString(),
                escalationDate: escalationDate.toISOString(),
                autoCloseDate: autoCloseDate.toISOString(),
                lastUpdated: now,
                timeline: {
                    [timelineKey]: {
                        type: 'created',
                        date: now,
                        description: 'تم إنشاء النزاع',
                        by: userName || userEmail || 'مستخدم غير معروف'
                    }
                }
            };

            await dbUpdate(disputeRef, dispute);

            // Send notifications
            if (settings.notifyEmails?.length > 0) {
                const emailHtml = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>نزاع جديد - منصة زايد</title>
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
                        .alert {
                            background-color: #fff3cd;
                            border: 1px solid #ffeeba;
                            color: #856404;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>نزاع جديد</h1>
                            <p>مزاد رقم: ${auctionId}</p>
                        </div>
                        
                        <div class="content">
                            <div class="alert">
                                <strong>تنبيه:</strong> تم تسجيل نزاع جديد يحتاج إلى مراجعة.
                            </div>
                            
                            <div class="info-box">
                                <h3 style="color: #2D3142; margin-top: 0;">تفاصيل النزاع</h3>
                                
                                <div class="info-item">
                                    <span class="info-label">رقم المزاد:</span>
                                    <span>${auctionId}</span>
                                </div>
                                
                                <div class="info-item">
                                    <span class="info-label">عنوان المزاد:</span>
                                    <span>${auctionTitle}</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">مقدم النزاع:</span>
                                    <span>${userName} (${userEmail})</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">البائع:</span>
                                    <span>${sellerName} (${sellerEmail})</span>
                                </div>
                                
                                <div class="info-item">
                                    <span class="info-label">سبب النزاع:</span>
                                    <span>${reason}</span>
                                </div>
                                
                                <div class="info-item">
                                    <span class="info-label">المبلغ:</span>
                                    <span>${amount} جنيه</span>
                                </div>
                                
                                <div class="info-item">
                                    <span class="info-label">التفاصيل:</span>
                                    <span>${description}</span>
                                </div>
                            </div>

                            <div style="text-align: center;">
                                <a href="https://zayid-itp25.web.app/dashboard" class="button">
                                    مراجعة النزاع في لوحة التحكم
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
                            <p>© ${new Date().getFullYear()} زايد. جميع الحقوق محفوظة</p>
                        </div>
                    </div>
                </body>
                </html>`;

                await sendEmail({
                    to: settings.notifyEmails[0], // First email as primary
                    subject: `نزاع جديد - مزاد رقم ${auctionId}`,
                    text: `تم إنشاء نزاع جديد للمزاد رقم ${auctionId}\nالسبب: ${reason}\nالمبلغ: ${amount} جنيه\nالوصف: ${description}\n\nيرجى مراجعة النزاع في لوحة التحكم.`,
                    html: emailHtml
                });
            }

            return {
                success: true,
                disputeId,
                message: 'تم إنشاء النزاع بنجاح'
            };

        } catch (error) {
            console.error('Error creating dispute:', error);
            return {
                success: false,
                message: error.message || 'حدث خطأ أثناء إنشاء النزاع'
            };
        } finally {
            setLoading(false);
        }
    }, [db]);

    const updateDisputeStatus = useCallback(async (disputeId, newStatus, comment) => {
        try {
            setLoading(true);
            const disputeRef = ref(db, `disputes/${disputeId}`);

            // Get current dispute data
            const disputeSnap = await get(disputeRef);
            if (!disputeSnap.exists()) {
                throw new Error('النزاع غير موجود');
            }
            const dispute = disputeSnap.val();

            const now = new Date().toISOString();
            const timelineKey = Date.now().toString();

            const updates = {
                status: newStatus,
                lastUpdated: now,
                [`timeline/${timelineKey}`]: {
                    type: 'status_update',
                    date: now,
                    description: `تم تحديث حالة النزاع إلى: ${newStatus}`,
                    comment,
                    by: 'مدير النظام'
                }
            };

            await dbUpdate(disputeRef, updates);

            // Send email notifications if dispute is resolved
            if (newStatus === 'resolved') {
                const emailHtml = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>تم حل النزاع - منصة زايد</title>
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
                            background-color: #44A46F;
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
                        .button {
                            background-color: #44A46F;
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
                        .alert {
                            background-color: #d4edda;
                            border: 1px solid #c3e6cb;
                            color: #155724;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>تم حل النزاع</h1>
                            <p>مزاد رقم: ${dispute.auctionId}</p>
                        </div>
                        
                        <div class="content">
                            <div class="alert">
                                <strong>تهانينا!</strong> تم حل النزاع المتعلق بالمزاد الخاص بك.
                            </div>
                            
                            <div class="info-box">
                                <h3 style="color: #2D3142; margin-top: 0;">تفاصيل النزاع</h3>
                                
                                <div class="info-item">
                                    <span class="info-label">رقم المزاد:</span>
                                    <span>${dispute.auctionId}</span>
                                </div>
                                
                                <div class="info-item">
                                    <span class="info-label">عنوان المزاد:</span>
                                    <span>${dispute.auctionTitle}</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">تعليق الإدارة:</span>
                                    <span>${comment || 'تم حل النزاع'}</span>
                                </div>
                            </div>

                            <div style="text-align: center;">
                                <a href="https://zayid-itp25.web.app/auctions/${dispute.auctionId}" class="button">
                                    عرض تفاصيل المزاد
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
                            <p>© ${new Date().getFullYear()} زايد. جميع الحقوق محفوظة</p>
                        </div>
                    </div>
                </body>
                </html>`;

                // Send to both user and seller
                if (dispute.userEmail) {
                    await sendEmail({
                        to: dispute.userEmail,
                        subject: `تم حل النزاع - مزاد رقم ${dispute.auctionId}`,
                        text: `تم حل النزاع المتعلق بالمزاد رقم ${dispute.auctionId}.\nالتعليق: ${comment || 'تم حل النزاع'}\n\nيمكنك مراجعة تفاصيل المزاد على منصة زايد.`,
                        html: emailHtml
                    });
                }

                if (dispute.sellerEmail) {
                    await sendEmail({
                        to: dispute.sellerEmail,
                        subject: `تم حل النزاع - مزاد رقم ${dispute.auctionId}`,
                        text: `تم حل النزاع المتعلق بالمزاد رقم ${dispute.auctionId}.\nالتعليق: ${comment || 'تم حل النزاع'}\n\nيمكنك مراجعة تفاصيل المزاد على منصة زايد.`,
                        html: emailHtml
                    });
                }
            }

            return {
                success: true,
                message: 'تم تحديث حالة النزاع بنجاح'
            };

        } catch (error) {
            console.error('Error updating dispute status:', error);
            return {
                success: false,
                message: error.message || 'حدث خطأ أثناء تحديث حالة النزاع'
            };
        } finally {
            setLoading(false);
        }
    }, [db]);

    const escalateDispute = useCallback(async (disputeId, reason) => {
        try {
            setLoading(true);

            // Get dispute and settings
            const [disputeSnap, settingsSnap] = await Promise.all([
                get(ref(db, `disputes/${disputeId}`)),
                get(ref(db, 'settings/disputes'))
            ]);

            const dispute = disputeSnap.exists() ? disputeSnap.val() : null;
            const settings = settingsSnap.exists() ? settingsSnap.val() : null;

            if (!dispute) throw new Error('النزاع غير موجود');
            if (!settings?.enabled) throw new Error('نظام النزاعات غير مفعل');

            const now = new Date().toISOString();
            const timelineKey = Date.now().toString();

            await dbUpdate(ref(db, `disputes/${disputeId}`), {
                status: 'escalated',
                lastUpdated: now,
                [`timeline/${timelineKey}`]: {
                    type: 'escalation',
                    date: now,
                    description: 'تم تصعيد النزاع',
                    reason,
                    by: 'مدير النظام'
                }
            });

            // Send escalation emails
            if (settings.escalationEmails?.length > 0) {
                const emailHtml = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>تصعيد نزاع - منصة زايد</title>
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
                            background-color: #dc3545;
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
                        .button {
                            background-color: #dc3545;
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
                        .alert {
                            background-color: #f8d7da;
                            border: 1px solid #f5c6cb;
                            color: #721c24;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>تصعيد نزاع</h1>
                            <p>مزاد رقم: ${dispute.auctionId}</p>
                        </div>
                        
                        <div class="content">
                            <div class="alert">
                                <strong>تنبيه عاجل:</strong> تم تصعيد نزاع يحتاج إلى مراجعة فورية.
                            </div>
                            
                            <div class="info-box">
                                <h3 style="color: #2D3142; margin-top: 0;">تفاصيل التصعيد</h3>
                                
                                <div class="info-item">
                                    <span class="info-label">رقم النزاع:</span>
                                    <span>${disputeId}</span>
                                </div>
                                
                                <div class="info-item">
                                    <span class="info-label">رقم المزاد:</span>
                                    <span>${dispute.auctionId}</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">عنوان المزاد:</span>
                                    <span>${dispute.auctionTitle}</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">مقدم النزاع:</span>
                                    <span>${dispute.userName} (${dispute.userEmail})</span>
                                </div>

                                <div class="info-item">
                                    <span class="info-label">البائع:</span>
                                    <span>${dispute.sellerName} (${dispute.sellerEmail})</span>
                                </div>
                                
                                <div class="info-item">
                                    <span class="info-label">سبب التصعيد:</span>
                                    <span>${reason}</span>
                                </div>
                            </div>

                            <div style="text-align: center;">
                                <a href="https://zayid-itp25.web.app/dashboard" class="button">
                                    مراجعة النزاع في لوحة التحكم
                                </a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
                            <p>© ${new Date().getFullYear()} زايد. جميع الحقوق محفوظة</p>
                        </div>
                    </div>
                </body>
                </html>`;

                await sendEmail({
                    to: settings.escalationEmails[0], // First email as primary
                    subject: `تصعيد نزاع - مزاد رقم ${dispute.auctionId}`,
                    text: `تم تصعيد النزاع رقم ${disputeId} للمزاد رقم ${dispute.auctionId}\nسبب التصعيد: ${reason}\n\nيرجى مراجعة النزاع في لوحة التحكم.`,
                    html: emailHtml
                });
            }

            return {
                success: true,
                message: 'تم تصعيد النزاع بنجاح'
            };

        } catch (error) {
            console.error('Error escalating dispute:', error);
            return {
                success: false,
                message: error.message || 'حدث خطأ أثناء تصعيد النزاع'
            };
        } finally {
            setLoading(false);
        }
    }, [db]);

    return {
        loading,
        createDispute,
        updateDisputeStatus,
        escalateDispute
    };
};