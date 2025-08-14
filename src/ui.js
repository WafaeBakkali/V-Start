// Replace everything in src/ui.js with this code:

export function showToast(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'show';
    toast.classList.add(type); 

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

export async function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const textToCopy = element.innerText;

    if (!navigator.clipboard) {
        showToast('Clipboard API not available.', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy.', 'error');
    }
}
