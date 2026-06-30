import streamifier from 'streamifier';
import cloudinary from './cloudinary.bocket';

export const uploadToCloudinary = (file: Express.Multer.File) =>
  new Promise<any>((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('video')
      ? 'video'
      : file.mimetype.startsWith('image')
        ? 'image'
        : 'auto';

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'yawa_reports',
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
});
