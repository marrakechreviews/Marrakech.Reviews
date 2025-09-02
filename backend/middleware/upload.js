const multer = require('multer');
const path = require('path');

function createUploader(options) {
  const storage = multer.diskStorage({
    destination: '/tmp/uploads',
    filename: function (req, file, cb) {
      const prefix = options.prefix || file.fieldname;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }

  const upload = multer({
    storage: storage,
    limits: { fileSize: options.fileSize || 1000000 }, // 1MB default
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  });

  if (options.type === 'array') {
    return upload.array(options.fieldName, options.maxCount);
  } else {
    return upload.single(options.fieldName);
  }
}

module.exports = createUploader;
