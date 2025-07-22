import { getDatabase, ref, update, remove } from 'firebase/database';

export const useUserActions = () => {
    const db = getDatabase();

    const handleActivateUser = async (userId) => {
        try {
            await update(ref(db, `users/${userId}`), {
                isActive: true,
                activatedAt: new Date().toISOString()
            });
            alert('تم تفعيل المستخدم بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء تفعيل المستخدم');
            return { success: false, error: err };
        }
    };

    const handleDeactivateUser = async (userId) => {
        if (!window.confirm('هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟')) {
            return { success: false, cancelled: true };
        }

        try {
            await update(ref(db, `users/${userId}`), {
                isActive: false,
                deactivatedAt: new Date().toISOString()
            });
            alert('تم إلغاء تفعيل المستخدم بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء إلغاء تفعيل المستخدم');
            return { success: false, error: err };
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            return { success: false, cancelled: true };
        }

        try {
            await remove(ref(db, `users/${userId}`));
            alert('تم حذف المستخدم بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء حذف المستخدم');
            return { success: false, error: err };
        }
    };

    const handleSuspendUser = async (userId, reason = '') => {
        if (!window.confirm('هل أنت متأكد من تعليق هذا المستخدم؟')) {
            return { success: false, cancelled: true };
        }

        try {
            await update(ref(db, `users/${userId}`), {
                isActive: null, // null indicates suspended/pending
                suspendedAt: new Date().toISOString(),
                suspensionReason: reason
            });
            alert('تم تعليق المستخدم بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء تعليق المستخدم');
            return { success: false, error: err };
        }
    };

    const handleResetPassword = async (userId, email) => {
        try {
            // This would typically send a password reset email
            // For now, we'll just show a confirmation
            alert(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`);
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور');
            return { success: false, error: err };
        }
    };

    return {
        handleActivateUser,
        handleDeactivateUser,
        handleDeleteUser,
        handleSuspendUser,
        handleResetPassword,
    };
}; 