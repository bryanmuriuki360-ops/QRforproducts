import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL
 * @param {string} text - The text/URL to encode in the QR code
 * @param {Object} options - QR code generation options
 * @returns {Promise<string>} - Data URL of the generated QR code
 */
export async function generateQRCode(text, options = {}) {
    const defaultOptions = {
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        },
        width: 256,
        ...options
    };

    try {
        const dataURL = await QRCode.toDataURL(text, defaultOptions);
        return dataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Generate QR code for a Shopify product
 * @param {Object} product - Shopify product object
 * @param {string} baseUrl - Base URL of the store
 * @param {Object} options - QR code generation options
 * @returns {Promise<string>} - Data URL of the generated QR code
 */
export async function generateProductQRCode(product, baseUrl, options = {}) {
    const productUrl = `${baseUrl}/products/${product.handle}`;
    return generateQRCode(productUrl, options);
}
