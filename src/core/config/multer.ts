// src/config/multer.ts
import multer, { StorageEngine } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import settings from './application';

// 🔒 Check for required Cloudinary environment variables
if (!settings.cloudinary.name || !settings.cloudinary.key || !settings.cloudinary.secret) {
  throw new Error('Cloudinary configuration missing in environment variables.');
}

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: settings.cloudinary.name!,
  api_key: settings.cloudinary.key!,
  api_secret: settings.cloudinary.secret!
});

// ✅ Cloudinary storage factory (for images or Excel files)
const cloudinaryStorage = (folder: string, format: 'image' | 'raw' = 'image'): StorageEngine => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder,
      resource_type: format,
      format: format === 'raw' ? 'xlsx' : undefined
      //   public_id: file.originalname.split('.')[0],
    })
  });
};

// ✅ Memory storage (for in-memory buffer processing like Excel)
const memoryStorage = multer.memoryStorage();

// Export specific uploaders

/** Use this for processing Excel in-memory (e.g., bulk upload) */
export const uploadExcel = multer({ storage: memoryStorage });

/** Use this to upload images directly to Cloudinary */
export const uploadImage = multer({ storage: cloudinaryStorage('user-images', 'image') });

/** Use this to upload Excel files to Cloudinary (if needed) */
export const uploadExcelToCloudinary = multer({ storage: cloudinaryStorage('excel-uploads', 'raw') });

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};
