import React from "react";

export default function Start({ onFinish }) {
  return (
    <div className="text-center">
      <h2 style={{ fontSize: "36px" }} className="font-bold text-[#2D3142]">
        انت الان جاهز
      </h2>
      <p className="text-[#444] ">انطلق في عالم زايد</p>
      <button
        onClick={onFinish}
        className="mt-14 bg-orange-600 text-white px-38 py-2 rounded-md font-semibold hover:bg-orange-700"
      >
        التالي
      </button>
    </div>
  );
}
