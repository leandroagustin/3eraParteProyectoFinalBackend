const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, `/public/images`));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let update = multer({ storage });

module.exports = update;
