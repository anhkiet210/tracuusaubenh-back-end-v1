const UserModel = require("../../../models/user.model");
const bcrypt = require("bcrypt");
const { sendToken } = require("../../../helper/jwt.helper");
const { upload } = require("../../../helper/cloudinary");

const saltRounds = 10;
const folder = "ak-tracuusaubenh/avatar";

const Register = async (req, res, next) => {
  try {
    const email = req.body.email;
    const checkUser = await UserModel.findOne({ email: email });
    if (checkUser) {
      res.status(402).json({
        success: false,
        message: "Người dùng đã tồn tại",
      });
    } else {
      const hoten = req.body.name;
      const hashPass = bcrypt.hashSync(req.body.password, saltRounds);
      const sdt = req.body.phone;

      const infoUser = {
        hoten: hoten,
        email: email,
        matkhau: hashPass,
        sdt: sdt,
      };

      await UserModel.create(infoUser);
      res.status(200).json({
        success: true,
        message: "Đăng ký tài khoản thành công",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Hãy nhập đầy đủ thông tin!",
      });
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác!",
      });
    }

    const isPassValid = bcrypt.compareSync(password, user.matkhau);
    if (!isPassValid) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không chính xác!",
      });
    }

    sendToken(user, res, "Đăng nhập thành công.");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const users = await UserModel.find({}, { matkhau: 0 });
    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInfoUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id, { matkhau: 0 });
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin thành công.",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(404).json({
        success: false,
        message: "Hãy nhập đầy đủ thông tin!",
      });
    }

    const user = await UserModel.findById(req.user.id);
    const isPassValid = bcrypt.compareSync(currentPassword, user.matkhau);
    if (!isPassValid) {
      return res.status(404).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng!",
      });
    }

    const hashPass = bcrypt.hashSync(newPassword, saltRounds);
    user.matkhau = hashPass;
    user.save();
    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
      return;
    }
    user.delete();
    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateInfo = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await UserModel.findById(req.user._id, { matkhau: 0 });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng này",
      });
      return;
    }

    user.hoten = name || user.hoten;
    user.sdt = phone || user.sdt;
    user.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công.",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changeAvatar = async (req, res, next) => {
  try {
    const { file } = req.files;
    const user = await UserModel.findById(req.user._id, { matkhau: 0 });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng này",
      });
      return;
    }

    if (!file) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy ảnh",
      });
      return;
    }
    const linkImg = await upload(file.tempFilePath, folder);
    user.anhdaidien = linkImg.url || user.anhdaidien;
    user.save();
    res.status(200).json({
      success: true,
      message: "Đổi ảnh đại diện thành công.",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  Register,
  Login,
  getAllUser,
  getInfoUser,
  changePassword,
  deleteUser,
  updateInfo,
  changeAvatar,
};
