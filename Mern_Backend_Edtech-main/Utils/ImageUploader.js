const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async (file, folder = {}) => {
    const options = folder.options || {};

    // Set default resource type to auto if not provided
    options.resource_type = options.resource_type || "auto";

        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        return result;
    
}