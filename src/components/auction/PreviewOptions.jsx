import React, { useState, useContext, useEffect } from "react";
import { getDatabase, ref, set, get } from "firebase/database";
import { UserContext } from "../../context/UserContext";
import { useParams } from "react-router-dom";
import { getFormattedDate } from "../../utils/dateUtils";

function PreviewOptions() {
  const [activeTab, setActiveTab] = useState("personal");

  const { user, auctions } = useContext(UserContext);
  const { auctionId } = useParams();
  const auction = auctions.find((a) => String(a.id) === String(auctionId));
  const [inspectionChoice, setInspectionChoice] = useState("in-person");
  const [hasBookedInspection, setHasBookedInspection] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    //  بيجيب داتا الشخص اللي داخل يشارك في المزاد اللي هي كراسة الشروط اشتراها ولا لا حجز معاينة ولا لا
    const getCurrentData = async () => {
      const db = getDatabase();
      const participantRef = ref(
        db,
        `auctions/${auctionId}/participants/${user.uid}`
      );
      const snapshot = await get(participantRef);
      let fetchedData = {};
      if (snapshot.exists()) {
        fetchedData = snapshot.val();
      }
      setCurrentData(fetchedData);
      if (
        fetchedData.inspectionChoice !== null &&
        fetchedData.inspectionChoice !== undefined &&
        fetchedData.inspectionChoice !== ""
      ) {
        setHasBookedInspection(true);
      } else {
        setHasBookedInspection(false);
      }
    };
    getCurrentData();
  }, [auctionId, user.uid]);

  const updateInspectionChoice = async () => {
    if (hasBookedInspection) {
      return;
    }
    const db = getDatabase();

    const updates = {
      ...currentData,
      inspectionChoice: inspectionChoice,
      inspectionDate: auction?.inspection?.inspectionDate,
      inspectionLocation:
        inspectionChoice === "in-person"
          ? auction?.inspection?.place
          : "online",
    };
    await set(
      // هيحدث الداتا في الداتابيس
      ref(db, `auctions/${auctionId}/participants/${user.uid}`),
      updates
    );
    setHasBookedInspection(true);
    setCurrentData(updates);
  };
  return (
    <>
      {hasBookedInspection ? ( // لو المعاينه محجوزه هيطلعله بيانات الحجز
        <div className="py-4 px-6 bg-white rounded-lg shadow-md border border-gray-200 text-right text-gray-800 font-semibold">
          تم حجز المعاينة بنجاح.
          <br />
          الاختيار المحدد:{" "}
          {currentData.inspectionChoice === "in-person"
            ? "معاينة شخصية"
            : "معاينة عبر مكالمه فيديو"}
          <br />
          الموعد : {getFormattedDate(auction, "inspection.inspectionDate")}
          <br />
          {currentData.inspectionChoice === "in-person" ? (
            <>
              المكان : {currentData.inspectionLocation}
              <br />
              برجاء التوجه إلى المكان المحدد في الموعد المحدد.
            </>
          ) : (
            <>
              المعاينة ستكون عبر الانترنت
              <br />
              ستتلقى رابط Zoom أو Google Meet عبر البريد الإلكتروني.
            </>
          )}
        </div>
      ) : (
        // هيطلعله انه يحجز
        <div className="py-4 px-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold py-3 text-gray-800">
            خيارات معاينة المزاد
          </h2>

          <div className="flex gap-3 text-gray-500 pb-4 font-bold">
            <p
              className={`py-2 cursor-pointer ${
                activeTab === "personal"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("personal");
                setInspectionChoice("in-person");
              }}
            >
              معاينة شخصيه
            </p>
            <p
              className={`py-2 cursor-pointer ${
                activeTab === "video"
                  ? "border-b-2 border-orange-500 text-orange-500"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("video");
                setInspectionChoice("video");
              }}
            >
              معاينة عبر مكالمه فيديو
            </p>
          </div>

          {activeTab === "personal" ? (
            <div className="flex flex-col gap-2 text-gray-600 text-[15px]">
              <span>العنوان : {auction?.inspection?.place}</span>
              <span>
                المواعيد المتاحة:{" "}
                {getFormattedDate(auction, "inspection.inspectionDate")}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-gray-600 text-[15px]">
              <p>
                سيتم ترتيب مكالمة فيديو بين البائع والمشتري لمعاينة المنتج عن
                بُعد.
                <span className="block py-2">
                  ستتلقى رابط Zoom أو Google Meet عبر البريد الإلكتروني بعد
                  تأكيد الحجز.
                </span>
              </p>
              <span>
                المواعيد المتاحة:{" "}
                {getFormattedDate(auction, "inspection.inspectionDate")}
              </span>
            </div>
          )}

          {activeTab === "personal" ? (
            <button
              onClick={updateInspectionChoice}
              disabled={hasBookedInspection}
              className="w-fit bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-8 mt-5 cursor-pointer rounded-md hover:bg-orange-600 transition-colors duration-200"
            >
              حجز معاينة شخصية
            </button>
          ) : (
            <button
              onClick={updateInspectionChoice}
              disabled={hasBookedInspection}
              className="w-fit bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-8 mt-5 cursor-pointer rounded-md hover:bg-orange-600 transition-colors duration-200"
            >
              حجز مكالمة فيديو
            </button>
          )}

          <button className="flex items-center justify-between bg-[#FFF0E6] cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-sm">
            ننصح بمعاينة المنتج قبل بدء المزاد للتأكد من مطابقة كل شيء للوصف.
          </button>
        </div>
      )}
    </>
  );
}
export default PreviewOptions;
