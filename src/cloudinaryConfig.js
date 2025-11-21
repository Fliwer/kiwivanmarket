// Configuration Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: 'dzkrted9t',  // 
  uploadPreset: 'van_images',
  folder: 'vans'
};

// Upload une image vers Cloudinary
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'van_images');
  formData.append('folder', 'vans');

  try {
    console.log('📤 Uploading to Cloudinary...');
    
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dzkrted9t/image/upload',  // ← UN SEUL "t" !
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    console.log('✅ Upload success!');
    
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};