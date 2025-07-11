import * as Yup from 'yup';

const messages = {
  // Login messages
  emailRequired: 'الرجاء إدخال عنوان بريد إلكتروني صحيح',
  emailInvalid: 'الرجاء إدخال عنوان بريد إلكتروني صحيح',
  passwordRequired: 'الرجاء إدخال كلمة المرور الصحيحة',
  passwordMin: 'كلمة المرور يجب أن تكون 8 أحرف أو أكثر',

  // Signup messages
  fullNameRequired: 'الاسم مطلوب',
  phoneInvalid: 'رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقم',
  phoneRequired: 'رقم الهاتف مطلوب',
  passwordShort: 'كلمة المرور يجب أن تكون 8 أحرف أو أكثر',
  passwordConfirmMatch: 'كلمة المرور غير متطابقة',
  passwordConfirmRequired: 'يرجى تأكيد كلمة المرور',
  birthDateRequired: 'تاريخ الميلاد مطلوب',
  nationalIDFormat: 'الرقم القومي يجب أن يكون 14 رقمًا',
  nationalIDRequired: 'الرقم القومي مطلوب',

  // Payment messages
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
  }),

  login: Yup.object().shape({
    email: Yup.string()
      .email(messages.emailInvalid)
      .required(messages.emailRequired),
    password: Yup.string()
      .min(8, messages.passwordMin)
      .required(messages.passwordRequired)
  }),

  signup: Yup.object().shape({
    fullName: Yup.string()
      .required(messages.fullNameRequired),
    email: Yup.string()
      .email(messages.emailInvalid)
      .required(messages.emailRequired),
    phone: Yup.string()
      .matches(/^01[0125][0-9]{8}$/, messages.phoneInvalid)
      .required(messages.phoneRequired),
    password: Yup.string()
      .min(8, messages.passwordShort)
      .required(messages.passwordRequired),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], messages.passwordConfirmMatch)
      .required(messages.passwordConfirmRequired),
    birthDate: Yup.string()
      .required(messages.birthDateRequired),
    nationalID: Yup.string()
      .matches(/^\d{14}$/, messages.nationalIDFormat)
      .required(messages.nationalIDRequired),
  })
};

export const getValidationSchema = (type) => schemas[type];

// Export individual schemas for direct import
export const { 
  login: loginValidationSchema,
  signup: signupValidationSchema,
  phone: phoneValidationSchema,
  card: cardValidationSchema
} = schemas; 