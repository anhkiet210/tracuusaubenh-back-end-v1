const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Admin = new Schema({
  hoten: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  matkhau: {
    type: String,
    required: true,
  },
  sdt: {
    type: String,
    required: true,
  },
  anhdaidien: {
    type: String,
    default:
      "https://res.cloudinary.com/ak210/image/upload/v1668617301/ak-tracuusaubenh/user-icon_rcrrs9.jpg",
  },
});

module.exports = mongoose.model("Admin", Admin);
