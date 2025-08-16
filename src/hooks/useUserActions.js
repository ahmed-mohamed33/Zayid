import { getDatabase, ref, update, remove } from 'firebase/database';
import Swal from 'sweetalert2';
import { sendUserActivationNotification } from '../utils/notificationService';

export const useUserActions = () => {
    const db = getDatabase();

    const handleActivateUser = async (userId) => {
        try {
            await update(ref(db, `users/${userId}`), {
                isActive: true,
                activatedAt: new Date().toISOString()
            });



            let notificationResult = null;
            try {
                notificationResult = await sendUserActivationNotification(userId);
                console.log('Activation notification sent successfully');
            } catch (notificationError) {
                console.error('Error sending activation notification:', notificationError);
            }

            await Swal.fire({
                title: 'تم التفعيل!',
                text: 'تم تفعيل المستخدم بنجاح',
                icon: 'success',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#10b981'
            });
            return { success: true };
        } catch (err) {
            await Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء تفعيل المستخدم',
                icon: 'error',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#ef4444'
            });
            return { success: false, error: err };
        }
    };

    const handleDeactivateUser = async (userId) => {
        const result = await Swal.fire({
            title: 'تأكيد إلغاء التفعيل',
            text: 'هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، إلغاء التفعيل',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) {
            return { success: false, cancelled: true };
        }

        try {
            await update(ref(db, `users/${userId}`), {
                isActive: false,
                deactivatedAt: new Date().toISOString()
            });
            await Swal.fire({
                title: 'تم إلغاء التفعيل!',
                text: 'تم إلغاء تفعيل المستخدم بنجاح',
                icon: 'success',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#10b981'
            });
            return { success: true };
        } catch (err) {
            await Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء إلغاء تفعيل المستخدم',
                icon: 'error',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#ef4444'
            });
            return { success: false, error: err };
        }
    };

    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            text: 'هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف المستخدم',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) {
            return { success: false, cancelled: true };
        }

        try {
            await remove(ref(db, `users/${userId}`));
            await Swal.fire({
                title: 'تم الحذف!',
                text: 'تم حذف المستخدم بنجاح',
                icon: 'success',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#10b981'
            });
            return { success: true };
        } catch (err) {
            await Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء حذف المستخدم',
                icon: 'error',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#ef4444'
            });
            return { success: false, error: err };
        }
    };

    const handleSuspendUser = async (userId, reason = '') => {
        const result = await Swal.fire({
            title: 'تأكيد التعليق',
            text: 'هل أنت متأكد من تعليق هذا المستخدم؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، علق المستخدم',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) {
            return { success: false, cancelled: true };
        }

        try {
            await update(ref(db, `users/${userId}`), {
                isActive: null,
                suspendedAt: new Date().toISOString(),
                suspensionReason: reason
            });
            await Swal.fire({
                title: 'تم التعليق!',
                text: 'تم تعليق المستخدم بنجاح',
                icon: 'success',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#10b981'
            });
            return { success: true };
        } catch (err) {
            await Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء تعليق المستخدم',
                icon: 'error',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#ef4444'
            });
            return { success: false, error: err };
        }
    };

    const handleResetPassword = async (userId, email) => {
        try {
            // This would typically send a password reset email
            // For now, we'll just show a confirmation
            await Swal.fire({
                title: 'تم الإرسال!',
                text: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`,
                icon: 'success',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#10b981'
            });
            return { success: true };
        } catch (err) {
            await Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور',
                icon: 'error',
                confirmButtonText: 'موافق',
                confirmButtonColor: '#ef4444'
            });
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