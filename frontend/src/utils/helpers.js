export function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function formatDate(dateString) {
    if (!dateString) return 'Date not provided';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Date not provided';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getImageUrl(imageUrl) {
    if (!imageUrl) return "https://via.placeholder.com/150"; // fallback
    if (imageUrl.startsWith("data:image")) return imageUrl; // already ok
    return `data:image/jpeg;base64,${imageUrl}`;
}

export function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}
