export function truncateText(text, maxLength = 80) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function formatDate(dateString) {
    if (!dateString) return 'Date not provided';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Date not provided';
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) return imageUrl;
    return imageUrl; // relative path served via proxy
}

export function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}
