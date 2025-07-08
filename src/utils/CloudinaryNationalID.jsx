
export const uploadToCloudinaryNationalID = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'national_id'); // national_id > cloudinary presets
  formData.append('cloud_name', 'dtdqcxn9c');       // dtdqcxn9c > cloudinary cloud name

  const res = await fetch(`https://api.cloudinary.com/v1_1/dtdqcxn9c/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return data.secure_url; // This is what you save to Firestore
};