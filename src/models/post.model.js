const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BaiViet = new Schema({
  tieude: {
    type: String,
    required: true,
  },
  noidung: {
    type: String,
    required: true,
  },
  anh: {
    type: String,
    default:
      "https://res.cloudinary.com/ak-tracuusaubenh/image/upload/v1666934115/ak-tracuusaubenh/depositphotos_247872612-stock-illustration-no-image-available-icon-vector_gojmbi.webp",
  },
  tacgia: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "NguoiDung",
  },
  trangthai: {
    type: String,
    default: "Chờ duyệt",
  },
  luotxem: {
    type: Number,
    default: 0,
  },
  thoigian: {
    type: Date,
    default: Date.now(),
  },
  ghichu: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("BaiViet", BaiViet);

