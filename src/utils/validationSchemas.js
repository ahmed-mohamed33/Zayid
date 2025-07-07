import * as Yup from 'yup';

const messages = {
  required: 'هذا الحقل مطلوب',
  phone: 'يجب أن يبدأ رقم الهاتف بـ 01 ويتكون من 11 رقم',
  cardNumber: 'رقم البطاقة يجب أن يتكون من 16 رقم',
  cvv: 'رمز الأمان يجب أن يتكون من 3 أو 4 أرقام',
  expiry: 'تاريخ الانتهاء يجب أن يكون بصيغة MM/YY',
  expiryInvalid: 'تاريخ الانتهاء غير صالح',
  nameMin: 'يجب أن يكون الاسم 3 أحرف على الأقل'
};

const schemas = {
  phone: Yup.object().shape({
    phoneNumber: Yup.string()
      .matches(/^01[0-9]{9}$/, messages.phone)
      .required(messages.required)
  }),

  card: Yup.object().shape({
    name: Yup.string()
      .required(messages.required)
      .min(3, messages.nameMin),
    number: Yup.string()
      .required(messages.required)
      .test('card-number', messages.cardNumber, value => {
        if (!value) return false;
        const digitsOnly = value.replace(/\s/g, '');
        return /^[0-9]{16}$/.test(digitsOnly);
      }),
    cvv: Yup.string()
      .matches(/^[0-9]{3,4}$/, messages.cvv)
      .required(messages.required),
    expiry: Yup.string()
      .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, messages.expiry)
      .required(messages.required)
      .test('expiry', messages.expiryInvalid, value => {
        if (!value) return false;
        const [month, year] = value.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        return expiry > new Date();
      })
  })
};

export const getValidationSchema = (paymentMethod) => 
  (paymentMethod === 'card' ? schemas.card : schemas.phone); 