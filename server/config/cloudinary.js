let cloudinary;

try {
  cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
} catch (err) {
  // cloudinary package is missing or failed to load — fall back to a safe stub
  console.warn(
    "Cloudinary module not found or failed to initialize. Image uploads will use local storage or be disabled.",
    err && err.message
  );

  cloudinary = {
    uploader: {
      upload: () =>
        Promise.reject(
          new Error(
            "Cloudinary not available (module missing or not configured)."
          )
        ),
      destroy: () =>
        Promise.reject(
          new Error(
            "Cloudinary not available (module missing or not configured)."
          )
        ),
    },
  };
}

module.exports = cloudinary;
