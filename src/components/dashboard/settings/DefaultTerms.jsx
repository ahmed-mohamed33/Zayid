import React, { useEffect, useState, useContext } from "react";
import { getDatabase, ref, onValue, set } from "firebase/database";
import Swal from "sweetalert2";
import { UserContext } from "../../../context/UserContext";
import {
  FaPlus,
  FaTrashAlt,
  FaPencilAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const DefaultTerms = () => {
  const db = getDatabase();
  const { userData } = useContext(UserContext);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const termsRef = ref(db, "settings/defaultTerms");
    const unsubscribe = onValue(termsRef, (snapshot) => {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        setTerms(data);
      } else if (data && Array.isArray(data.items)) {
        setTerms(data.items);
      } else {
        setTerms([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        items: terms.filter((t) => (t || "").trim() !== ""),
        updatedAt: new Date().toISOString(),
        updatedBy: userData?.fullName || userData?.email || "admin",
      };
      await set(ref(db, "settings/defaultTerms"), payload);
      Swal.fire({
        icon: "success",
        title: "تم الحفظ",
        text: "تم تحديث الشروط الافتراضية بنجاح",
        confirmButtonColor: "#FA6300",
      });
    } catch (error) {
      console.error("Error saving default terms:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء الحفظ. حاول مرة أخرى.",
        confirmButtonColor: "#FA6300",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditValue(terms[index]);
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditValue("");
  };

  const handleSaveEdit = (index) => {
    if (editValue.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لا يمكن أن يكون الشرط فارغاً",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    const newTerms = [...terms];
    newTerms[index] = editValue.trim();
    setTerms(newTerms);
    setEditingIndex(-1);
    setEditValue("");
    handleSave();
  };

  const handleDelete = async (index) => {
    const result = await Swal.fire({
      title: "تأكيد الحذف",
      text: "هل أنت متأكد من حذف هذا الشرط؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      const newTerms = terms.filter((_, i) => i !== index);
      setTerms(newTerms);
      handleSave();
    }
  };

  const handleAddTerm = () => {
    if (newTerm.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لا يمكن إضافة شرط فارغ",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    setTerms([...terms, newTerm.trim()]);
    setNewTerm("");
    setShowAddForm(false);
    handleSave();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FA6300] text-white rounded-lg hover:bg-[#e55a00] transition-colors"
          disabled={showAddForm}
        >
          <FaPlus className="w-4 h-4" />
          إضافة شرط جديد
        </button>
        <h2 className="text-xl font-bold text-[#2D3142]">
          إدارة الشروط والأحكام الافتراضية
        </h2>
      </div>

      {/* Add New Term Form */}
      {showAddForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="flex-1 border border-[#E5E7EB] rounded-lg p-2 text-right"
              placeholder="اكتب الشرط الجديد هنا"
              dir="rtl"
            />
            <button
              onClick={handleAddTerm}
              className="p-2  text-green-500 rounded-lg "
            >
              <FaCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTerm("");
              }}
              className="p-2  text-gray-700 rounded-lg "
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Terms List */}
      <div className="space-y-4">
        {terms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد شروط مضافة. أضف شروطاً جديدة باستخدام زر "إضافة شرط جديد".
          </div>
        ) : (
          terms.map((term, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                {editingIndex === index ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 border border-[#E5E7EB] rounded-lg p-2 text-right"
                      dir="rtl"
                    />
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="p-2  text-green-500 rounded-lg "
                    >
                      <FaCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2  text-gray-700 rounded-lg "
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[#2D3142] text-right">{term}</p>
                )}
              </div>
              {editingIndex !== index && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 text-blue-600 rounded-lg transition-colors"
                  >
                    <FaPencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-red-800 rounded-lg transition-colors"
                  >
                    <FaTrashAlt className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DefaultTerms;
