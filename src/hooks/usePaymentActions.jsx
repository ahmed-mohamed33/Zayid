import { useCallback } from "react";
import { getDatabase, ref, update, push, set } from "firebase/database";

export const usePaymentActions = () => {
  const db = getDatabase();

  // Verify payment
  const verifyPayment = useCallback(
    async (paymentId, data = {}) => {
      try {
        const updates = {
          status: "paid",
          processedAt: new Date().toISOString(),
          processedBy: "admin",
          paidAt: new Date().toISOString(),
          verificationNote: data.note || "تم تأكيد الدفع من قبل الإدارة",
          updatedAt: new Date().toISOString(),
        };

        await update(ref(db, `payments/${paymentId}`), updates);

        // Add to payment history
        if (data.note) {
          await push(ref(db, `payments/${paymentId}/notes`), {
            content: data.note,
            type: "verification",
            createdAt: new Date().toISOString(),
            createdBy: "admin",
          });
        }

        return { success: true, message: "تم تأكيد الدفع بنجاح" };
      } catch (error) {
        console.error("Error verifying payment:", error);
        return { success: false, message: "حدث خطأ أثناء تأكيد الدفع" };
      }
    },
    [db]
  );

  // Refund payment
  const refundPayment = useCallback(
    async (paymentId, data = {}) => {
      try {
        const { refundAmount, refundReason } = data;

        if (!refundReason?.trim()) {
          return { success: false, message: "يجب إدخال سبب الاسترداد" };
        }

        const updates = {
          status: "refunded",
          refundedAt: new Date().toISOString(),
          refundedBy: "admin",
          refundAmount: Number(refundAmount) || 0,
          refundReason: refundReason.trim(),
          processedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await update(ref(db, `payments/${paymentId}`), updates);

        // Add to payment history
        await push(ref(db, `payments/${paymentId}/notes`), {
          content: `تم استرداد مبلغ ${refundAmount} جنيه. السبب: ${refundReason}`,
          type: "refund",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        });

        return {
          success: true,
          message: `تم استرداد ${refundAmount} جنيه بنجاح`,
        };
      } catch (error) {
        console.error("Error refunding payment:", error);
        return { success: false, message: "حدث خطأ أثناء استرداد المبلغ" };
      }
    },
    [db]
  );

  // Update payment status
  const updatePaymentStatus = useCallback(
    async (paymentId, status, note = "") => {
      try {
        const statusMap = {
          pending: "معلق",
          paid: "مدفوع",
          failed: "فشل",
          cancelled: "ملغي",
          refunded: "مسترد",
        };

        const updates = {
          status,
          processedAt: new Date().toISOString(),
          processedBy: "admin",
          updatedAt: new Date().toISOString(),
        };

        // Add status-specific fields
        switch (status) {
          case "paid":
            updates.paidAt = new Date().toISOString();
            break;
          case "failed":
            updates.failedAt = new Date().toISOString();
            if (note) updates.failureReason = note;
            break;
          case "cancelled":
            updates.cancelledAt = new Date().toISOString();
            if (note) updates.cancellationReason = note;
            break;
        }

        await update(ref(db, `payments/${paymentId}`), updates);

        // Add to payment history
        const noteContent = note
          ? `تم تغيير الحالة إلى "${statusMap[status]}". ملاحظة: ${note}`
          : `تم تغيير الحالة إلى "${statusMap[status]}"`;

        await push(ref(db, `payments/${paymentId}/notes`), {
          content: noteContent,
          type: "status_change",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        });

        return {
          success: true,
          message: `تم تغيير الحالة إلى "${statusMap[status]}" بنجاح`,
        };
      } catch (error) {
        console.error("Error updating payment status:", error);
        return { success: false, message: "حدث خطأ أثناء تحديث الحالة" };
      }
    },
    [db]
  );

  // Bulk update status
  const bulkUpdateStatus = useCallback(
    async (paymentIds, action) => {
      try {
        if (!paymentIds || paymentIds.length === 0) {
          return { success: false, message: "لا توجد مدفوعات محددة" };
        }

        const statusMap = {
          verify: { status: "paid", message: "تم تأكيد الدفع" },
          pending: { status: "pending", message: "تم تعيين كمعلق" },
          failed: { status: "failed", message: "تم تعيين كفشل" },
          cancelled: { status: "cancelled", message: "تم إلغاء المدفوعة" },
        };

        const actionConfig = statusMap[action];
        if (!actionConfig) {
          return { success: false, message: "إجراء غير صالح" };
        }

        const updates = {};
        const timestamp = new Date().toISOString();

        paymentIds.forEach((paymentId) => {
          updates[`payments/${paymentId}/status`] = actionConfig.status;
          updates[`payments/${paymentId}/processedAt`] = timestamp;
          updates[`payments/${paymentId}/processedBy`] = "admin";
          updates[`payments/${paymentId}/updatedAt`] = timestamp;

          // Add status-specific fields
          if (actionConfig.status === "paid") {
            updates[`payments/${paymentId}/paidAt`] = timestamp;
          } else if (actionConfig.status === "failed") {
            updates[`payments/${paymentId}/failedAt`] = timestamp;
          } else if (actionConfig.status === "cancelled") {
            updates[`payments/${paymentId}/cancelledAt`] = timestamp;
          }
        });

        await update(ref(db), updates);

        // Add notes to each payment
        const notePromises = paymentIds.map((paymentId) =>
          push(ref(db, `payments/${paymentId}/notes`), {
            content: `${actionConfig.message} (إجراء جماعي)`,
            type: "bulk_action",
            createdAt: timestamp,
            createdBy: "admin",
          })
        );

        await Promise.all(notePromises);

        return {
          success: true,
          message: `تم ${actionConfig.message} لـ ${paymentIds.length} مدفوعة بنجاح`,
        };
      } catch (error) {
        console.error("Error in bulk update:", error);
        return { success: false, message: "حدث خطأ أثناء التحديث الجماعي" };
      }
    },
    [db]
  );

  // Export payments
  const exportPayments = useCallback(async (payments, format = "csv") => {
    try {
      if (!payments || payments.length === 0) {
        return { success: false, message: "لا توجد بيانات للتصدير" };
      }

      const formatCurrency = (amount) => {
        return new Intl.NumberFormat("ar-EG", {
          style: "currency",
          currency: "EGP",
          minimumFractionDigits: 0,
        }).format(amount || 0);
      };

      const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const getStatusText = (status) => {
        const statusMap = {
          paid: "مدفوع",
          pending: "معلق",
          failed: "فشل",
          refunded: "مسترد",
          cancelled: "ملغي",
        };
        return statusMap[status] || status || "غير محدد";
      };

      const getMethodText = (method) => {
        const methodMap = {
          vodafone: "فودافون كاش",
          card: "بطاقة ائتمان",
          visa: "فيزا",
          mastercard: "ماستركارد",
          bank: "تحويل بنكي",
          cash: "نقدي",
        };
        return methodMap[method] || method || "غير محدد";
      };

      const getTypeText = (type) => {
        const typeMap = {
          insurance: "تأمين",
          shroot: "كراسة شروط",
          auction: "مزاد",
          subscription: "اشتراك",
          fee: "رسوم",
        };
        return typeMap[type] || type || "غير محدد";
      };

      if (format === "csv") {
        // CSV Export
        const headers = [
          "رقم المدفوعة",
          "النوع",
          "المبلغ",
          "الرسوم",
          "طريقة الدفع",
          "الحالة",
          "المستخدم",
          "البريد الإلكتروني",
          "تاريخ الإنشاء",
          "تاريخ المعالجة",
          "معرف المعاملة",
          "معرف المزاد",
          "الوصف",
        ];

        const csvData = payments.map((payment) => [
          payment.id || "",
          getTypeText(payment.type),
          payment.amount || 0,
          payment.fee || 0,
          getMethodText(payment.method),
          getStatusText(payment.status),
          payment.userName || payment.userId || "",
          payment.userEmail || "",
          formatDate(payment.createdAt || payment.timestamp),
          formatDate(payment.processedAt),
          payment.transactionId || "",
          payment.auctionId || "",
          payment.description || "",
        ]);

        const csvContent = [headers, ...csvData]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");

        // Create and download file
        const blob = new Blob(["\ufeff" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `payments_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "pdf") {
        // PDF Export (simplified - you might want to use a library like jsPDF)
        const printContent = `
          <html>
            <head>
              <title>تقرير المدفوعات</title>
              <style>
                body { font-family: Arial, sans-serif; direction: rtl; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                .summary { margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>تقرير المدفوعات</h1>
                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
                <p>عدد المدفوعات: ${payments.length}</p>
              </div>
              
              <div class="summary">
                <h3>ملخص المدفوعات:</h3>
                <p>إجمالي المبلغ: ${formatCurrency(
                  payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                )}</p>
                <p>المدفوعات المؤكدة: ${
                  payments.filter((p) => p.status === "paid").length
                }</p>
                <p>المدفوعات المعلقة: ${
                  payments.filter((p) => p.status === "pending").length
                }</p>
                <p>المدفوعات الفاشلة: ${
                  payments.filter((p) => p.status === "failed").length
                }</p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>رقم المدفوعة</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>طريقة الدفع</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments
                    .map(
                      (payment) => `
                    <tr>
                      <td>${payment.id?.substring(0, 8) || ""}...</td>
                      <td>${getTypeText(payment.type)}</td>
                      <td>${formatCurrency(payment.amount)}</td>
                      <td>${getMethodText(payment.method)}</td>
                      <td>${getStatusText(payment.status)}</td>
                      <td>${formatDate(
                        payment.createdAt || payment.timestamp
                      )}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </body>
          </html>
        `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }

      return {
        success: true,
        message: `تم تصدير ${payments.length} مدفوعة بنجاح`,
      };
    } catch (error) {
      console.error("Error exporting payments:", error);
      return { success: false, message: "حدث خطأ أثناء تصدير البيانات" };
    }
  }, []);

  // Add payment note
  const addPaymentNote = useCallback(
    async (paymentId, note) => {
      try {
        if (!note?.trim()) {
          return { success: false, message: "الملاحظة فارغة" };
        }

        await push(ref(db, `payments/${paymentId}/notes`), {
          content: note.trim(),
          type: "manual",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        });

        // Update payment's updatedAt
        await update(ref(db, `payments/${paymentId}`), {
          updatedAt: new Date().toISOString(),
        });

        return { success: true, message: "تم إضافة الملاحظة بنجاح" };
      } catch (error) {
        console.error("Error adding payment note:", error);
        return { success: false, message: "حدث خطأ أثناء إضافة الملاحظة" };
      }
    },
    [db]
  );

  // Delete payment (soft delete by marking as deleted)
  const deletePayment = useCallback(
    async (paymentId, reason = "") => {
      try {
        const updates = {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: "admin",
          deletionReason: reason,
          updatedAt: new Date().toISOString(),
        };

        await update(ref(db, `payments/${paymentId}`), updates);

        // Add deletion note
        await push(ref(db, `payments/${paymentId}/notes`), {
          content: `تم حذف المدفوعة. ${reason ? `السبب: ${reason}` : ""}`,
          type: "deletion",
          createdAt: new Date().toISOString(),
          createdBy: "admin",
        });

        return { success: true, message: "تم حذف المدفوعة بنجاح" };
      } catch (error) {
        console.error("Error deleting payment:", error);
        return { success: false, message: "حدث خطأ أثناء حذف المدفوعة" };
      }
    },
    [db]
  );

  return {
    verifyPayment,
    refundPayment,
    updatePaymentStatus,
    bulkUpdateStatus,
    exportPayments,
    addPaymentNote,
    deletePayment,
  };
};
