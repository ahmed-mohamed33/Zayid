import React, { memo } from "react";
import { FaDollarSign } from "react-icons/fa";

const PaymentsTab = memo(
  ({
    userPayments,
    formatCurrency,
    getPaymentTypeName,
    getPaymentMethodName,
  }) => {
    if (userPayments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FaDollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد مدفوعات لهذا المستخدم</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          مدفوعات المستخدم ({userPayments.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  نوع الدفع
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  المبلغ
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  طريقة الدفع
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {getPaymentTypeName(payment.type)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getPaymentMethodName(payment.method)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status === "paid" ? "مدفوع" : "معلق"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {payment.timestamp || payment.createdAt
                      ? new Date(
                          payment.timestamp || payment.createdAt
                        ).toLocaleDateString("ar-EG")
                      : "غير محدد"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

PaymentsTab.displayName = "PaymentsTab";

export default PaymentsTab;
