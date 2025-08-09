import React from "react";
import { Field, ErrorMessage } from "formik";
import lock from "../assets/icons/lock-register.svg";
import eye from "../assets/icons/eye.svg";
import eyeOff from "../assets/icons/eye-off.svg";
const styles = {
  inputBase: `
    block w-full rounded-md bg-white p-4 text-base text-gray-900 
    outline-1 -outline-offset-1 outline-gray-300 
    focus:outline-2 focus:-outline-offset-2 focus:outline-[#cc5200] 
    sm:text-sm/6 pr-12
  `,
  inputGroup: "relative mt-3",
  inputIcon: `
    absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 
    text-gray-400 pointer-events-none
  `,
};

export default function PasswordField({
  name,
  label,
  placeholder,
  showPassword,
  toggleShowPassword,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm/6 font-medium text-gray-900"
      >
        {label}
      </label>
      <div className={styles.inputGroup}>
        <Field
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder={placeholder}
          className={styles.inputBase}
        />
        <div className={styles.inputIcon}>
          <img src={lock} alt="lock" className="w-5 h-5" />
        </div>
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute left-3 top-1/2 -translate-y-1/2 focus:outline-none"
        >
          <img
            src={showPassword ? eyeOff : eye}
            alt="toggle visibility"
            className="w-5 h-5"
          />
        </button>
      </div>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-600 text-sm mt-1"
      />
    </div>
  );
}
