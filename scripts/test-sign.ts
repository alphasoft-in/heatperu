import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const publicId = "heatfactory/productos/fichas/ESPECIFICACIONES_TECNICAS_SERVOMOTOR_HONEYWELL_ML7999A_CONTROL_LINK_1782634989236.pdf";

const signedUrl = cloudinary.url(publicId, { 
  sign_url: true, 
  resource_type: 'raw',
  type: 'upload'
});

console.log(signedUrl);
