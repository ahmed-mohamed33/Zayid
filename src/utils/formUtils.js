import { yupResolver } from '@hookform/resolvers/yup';
import { getValidationSchema } from './validationSchemas';

// Form configuration based on payment method
export const getFormConfig = (paymentMethod) => ({
  resolver: yupResolver(getValidationSchema(paymentMethod)),
  defaultValues: getInitialValues(paymentMethod),
  mode: 'onChange'
});

// Initial values for different payment methods
export const getInitialValues = (paymentMethod) => {
  const values = {
    vodafone: { phoneNumber: '' },
    fawry: { phoneNumber: '' },
    card: { name: '', number: '', cvv: '', expiry: '' }
  };
  return values[paymentMethod] || {};
};

// Format card number with spaces
export const formatCardNumber = (value) => {
  if (!value) return value;
  // Remove all non-digits and existing spaces
  const digitsOnly = value.replace(/\D/g, '');
  // Limit to 16 digits
  const limitedDigits = digitsOnly.slice(0, 16);
  // Add spaces after every 4 digits
  const parts = limitedDigits.match(/.{1,4}/g) || [];
  return parts.join(' ');
};

// Format expiry date
export const formatExpiryDate = (value) => {
  if (!value) return value;
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  return v.length >= 2 ? `${v.slice(0, 2)}/${v.slice(2, 4)}` : v;
};

// Format CVV
export const formatCVV = (value) => {
  if (!value) return value;
  return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 4);
};

// Field configurations
export const getFieldConfig = (fieldName) => ({
  phoneNumber: {
    type: 'tel',
    placeholder: '01xxxxxxxxx',
    dir: 'rtl'
  },
  name: {
    type: 'text',
    placeholder: 'الاسم كما يظهر على البطاقة',
    dir: 'rtl'
  },
  number: {
    type: 'text',
    placeholder: 'xxxx xxxx xxxx xxxx',
    dir: 'ltr',
    maxLength: 19 // 16 digits + 3 spaces
  },
  cvv: {
    type: 'text',
    placeholder: 'xxx',
    dir: 'ltr',
    maxLength: 4
  },
  expiry: {
    type: 'text',
    placeholder: 'MM/YY',
    dir: 'ltr',
    maxLength: 5 // MM/YY format
  }
}[fieldName] || {});


export const handlePaymentSubmit = async (values, paymentMethod) => {
  try {
    const confirmMessage = paymentMethod === 'card' 
      ? `سيتم الدفع بالبطاقة المدخلة ${values.number}`
      : `سيتم إرسال كود الدفع إلى رقمك ${values.phoneNumber}`;

    if (!window.confirm(`${confirmMessage} لتأكيد الدفع هل تريد المتابعة ؟`)) {
      return { success: false, error: 'تم إلغاء عملية الدفع' };
    }

   
    console.log('Processing payment:', { values, paymentMethod });
    return { success: true };
  } catch (error) {
    console.error('Payment error:', error);
    return { success: false, error: error.message };
  }
};


export const paymentMethods = {
  vodafone: {
    title: 'فودافون كاش',
    description: 'سيتم إرسال كود الدفع إلى رقمك',
    icon: 'Vodafone'
  },
  fawry: {
    title: 'فوري',
    description: 'سيتم إرسال كود الدفع إلى رقمك',
    icon: 'Fawry'
  },
  card: {
    title: 'البطاقة البنكية',
    description: '',
    icon: 'Visa'
  }
}; 