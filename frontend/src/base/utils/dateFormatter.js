/**
 * Backend'den gelen naive (timezone'suz) UTC tarihlerini doğru 
 * okuyarak kullanıcının yerel cihaz saatine döndüren yardımcı metod.
 * Cross-platform güvenliği için toLocaleDateString yerine manuel parse yapıyoruz.
 */
export const formatDate = (dateString, showTime = false) => {
    if (!dateString) return "—";
    
    let safeDateString = dateString;
    if (typeof dateString === 'string' && !dateString.endsWith('Z')) {
        safeDateString += 'Z';
    }
    
    const date = new Date(safeDateString);
    if (isNaN(date.getTime())) return "—";
    
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const datePart = `${d}.${m}.${y}`;
    
    if (showTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${datePart} ${hours}:${minutes}`;
    }
    return datePart;
};
