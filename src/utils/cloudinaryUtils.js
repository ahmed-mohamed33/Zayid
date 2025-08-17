const CLOUDINARY_CLOUD_NAME = 'dtdqcxn9c';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = 'auctions';

export const uploadToCloudinary = async (file, preset = UPLOAD_PRESET) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);
        formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response' } }));
            throw new Error(
                errorData?.error?.message ||
                `Upload failed with status ${response.status}: ${response.statusText}`
            );
        }

        const data = await response.json();
        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id
        };
    } catch (error) {
        return {
            success: false,
            error: `Upload failed: ${error.message}`
        };
    }
};

export const uploadMultipleImages = async (files, preset = UPLOAD_PRESET) => {
    try {
        const uploadPromises = files.map(file => uploadToCloudinary(file, preset));
        const results = await Promise.all(uploadPromises);

        // Check if any upload failed
        const failedUploads = results.filter(result => !result.success);
        if (failedUploads.length > 0) {
            const errors = failedUploads.map(result => result.error).join(', ');
            throw new Error(`Failed to upload images: ${errors}`);
        }

        return {
            success: true,
            urls: results.map(result => result.url)
        };
    } catch (error) {
        return {
            success: false,
            error: `Multiple upload failed: ${error.message}`
        };
    }
}; 
