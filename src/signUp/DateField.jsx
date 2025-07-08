import React from 'react';
import { Field, ErrorMessage } from 'formik';

const styles = {
  inputBase: `
    block w-full rounded-md bg-white p-4 text-base text-gray-900 
    outline-1 -outline-offset-1 outline-gray-300 
    focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200] 
    sm:text-sm/6 pr-12
  `,
  inputGroup: 'relative mt-3',
  inputIcon: `
    absolute right-3 top-1/2 -translate-y-1/2 flex items-center 
    text-gray-400 pointer-events-none
  `,
};

export default function DateField({ name, label }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm/6 font-medium text-gray-900">
        {label}
      </label>
      <div className={styles.inputGroup}>
        <Field
          id={name}
          name={name}
          type="date"
          className={styles.inputBase}
        />
        <div className={styles.inputIcon}>
          <img src="src\assets\icons\calendar.svg" alt="calendar" className="input-icon w-5 h-5" />
        </div>
      </div>
      <ErrorMessage name={name} component="div" className="text-red-600 text-sm mt-1" />
    </div>
  );
} 