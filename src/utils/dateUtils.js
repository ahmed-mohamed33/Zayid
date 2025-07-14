
export const formatDateArabic = (dateStr, includeTime = true) => {
    if (typeof dateStr !== "string" || !dateStr.trim()) {
        return "غير محدد";
    }

    try {
        const options = {
            year: "numeric",
            weekday: "long",
            month: "long",
            day: "numeric",
        };

        if (includeTime) {
            options.hour = "2-digit";
            options.minute = "2-digit";
            options.hour12 = true;
        }

        return new Date(dateStr).toLocaleDateString("ar-EG", options);
    } catch {
        return "غير محدد";
    }
};


export const getFormattedDate = (obj, path, includeTime = true) => {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
    return formatDateArabic(value, includeTime);
}; 