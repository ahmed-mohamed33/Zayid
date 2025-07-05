import React from 'react';

//icons
import statistic from '../../assets/icons/statistic.svg'
import Users from '../../assets/icons/clock.svg'
import Group from '../../assets/icons/Group.svg'
import sandClock from '../../assets/icons/sandClock.svg'
import clock from '../../assets/icons/clock.svg'

function NumberCard({ icon, number, label }) {
  return (
    <div className="bg-[#F1F1F1] p-6 rounded-lg shadow-md">
      <div className="flex justify-center mb-2">
        <span
          className="p-2 rounded-full"
        >
          <img src={icon} alt={label} className="w-6 h-6" />
        </span>
      </div>
      <p className="text-2xl  font-semibold text-[#333c65e0]">{number}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}


function OurNumbers() {
  return (
    <div className="mx-auto px-4 md:px-7 lg:px-7  py-10 text-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">إحصائيات</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <NumberCard icon={statistic} number="+15,000" label="إجمالي المزادات" />
        <NumberCard icon={Users} number="+20" label="  الفئات" />
        <NumberCard icon={Group} number="+9,000" label=" مزاد مكتمل" />
        <NumberCard icon={sandClock} number="+1000" label="مزاد حالي" />
        <NumberCard icon={clock} number="+7" label="دول" />
      </div>
    </div>
  );
}

export default OurNumbers;