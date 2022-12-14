const PestModel = require("../../../models/pest.model");
// const DecisionTree = require('../../../helper/decisionTree');
const DecisionTree = require("decision-tree");
const PesticideModel = require("../../../models/pesticide.model");
const CropModel = require("../../../models/crop.model");
const StatisticalModel = require("../../../models/statistical.model");
const { upload } = require("../../../helper/cloudinary");

const folder = "ak-tracuusaubenh/img-pests";

const createPest = async (req, res, next) => {
  try {
    const { pestName, detailedSymptoms, la, than, re, idCrop } = req.body;
    const { file } = req.files;

    if (!pestName) {
      return res.status(404).json({
        success: false,
        message: "Hãy nhập tên sâu bệnh!",
      });
    }

    const checkPest = await PestModel.findOne({ ten: pestName });

    if (checkPest) {
      return res.status(402).json({
        success: false,
        message: "Bệnh đã tồn tại trong cơ sở dữ liệu!",
      });
    }

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Hãy thêm ảnh cho loại bệnh này!",
      });
    }

    // if (!identificationSymptoms) {
    //     return res.status(404).json({
    //         success: false,
    //         message: 'Hãy nhập đặc điểm nhận dạng cho sâu bệnh!',
    //     });
    // }

    if (!idCrop) {
      return res.status(404).json({
        success: false,
        message: "Hãy chọn loại cây cho bệnh này!",
      });
    }

    const trieuchungnhandang = {
      la: la,
      than: than,
      re: re,
    };

    const linkImg = await upload(file.tempFilePath, folder);
    const info = {
      ten: pestName,
      trieuchungchitiet: detailedSymptoms,
      trieuchungnhandang: trieuchungnhandang,
      LoaiCay: idCrop,
      anh: linkImg.url,
    };
    // console.log('info: ', info);
    // console.log('identificationSymptoms: ', identificationSymptoms);

    const pest = await PestModel.create(info);
    const crop = await CropModel.findById(pest.LoaiCay);
    return res.status(200).json({
      success: true,
      message: "Thêm thông tin sâu bệnh thành công.",
      data: {
        pest: pest,
        crop: crop,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPests = async (req, res, next) => {
  try {
    const pests = await PestModel.find();
    let list = [];
    for (let i = 0; i < pests.length; i++) {
      const LoaiCay = await CropModel.findById(pests[i].LoaiCay);
      list.push({
        pest: pests[i],
        crop: LoaiCay,
      });
    }
    res.status(200).json({
      success: true,
      message: "Thành công.",
      data: list,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPestById = async (req, res, next) => {
  try {
    const pest = await PestModel.findById(req.params.id);
    let list;
    const LoaiCay = await CropModel.findById(pest.LoaiCay);
    list = {
      pest: pest,
      crop: LoaiCay,
    };
    res.status(200).json({
      success: true,
      message: "Thành công.",
      data: list,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const detectPest = async (req, res, next) => {
  try {
    const pests = await PestModel.find();
    const infoPest = {
      la: req.body.la !== "" ? req.body.la : "không có",
      than: req.body.than !== "" ? req.body.than : "không có",
      re: req.body.re !== "" ? req.body.re : "không có",
    };
    // const training_data = [
    //     {
    //         la: 'vàng xanh xám',
    //         than: 'lùn',
    //         re: '',
    //         benh: { name: 'vàng lùn', id: 'abc13' },
    //     },
    //     { la: 'vàng xanh xám', than: '', re: '', benh: 'vàng lá' },
    //     { la: 'có đốm xám', than: '', re: '', benh: 'khô vằn' },
    //     { la: 'có đốm xám', than: 'thấp', re: '', benh: 'khô vằn' },
    // ];

    // let training_data = pests.map(async (item) => {
    //     const crops = await CropModel.findById(item.LoaiCay, { tenloai: 1 });
    //     const { la, than, re } = item.trieuchungnhandang;
    //     return { loaicay: crops.tenloai, la, than, re, benh: item };
    // });

    let training_data = [];

    for (let i = 0; i < pests.length; i++) {
      const crops = await CropModel.findById(pests[i].LoaiCay, { tenloai: 1 });
      training_data.push({
        loaicay: crops.tenloai,
        la: pests[i].trieuchungnhandang.la,
        than: pests[i].trieuchungnhandang.than,
        re: pests[i].trieuchungnhandang.re,
        benh: pests[i],
      });
    }

    // const training_data = [
    //     {
    //         loaicay: 'lúa',
    //         la: 'vàng khô',
    //         than: 'lùn',
    //         re: '',
    //         benh: 'vàng lùn',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'màu lá xanh đậm, rìa lá bị rách và gợn sóng, xoăn tít lại',
    //         than: 'lùn',
    //         re: '',
    //         benh: 'lùn xoắn lá',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'có vết bệnh màu xám nâu, hình thoi ở giữ có màu trắng',
    //         than: 'có vết bệnh màu xám nâu quanh thân',
    //         re: '',
    //         benh: 'đạo ôn',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'vết cháy có màu xám, hoặc vàng nâu hoặc nâu đỏ, dọc theo hai bên rìa lá',
    //         than: '',
    //         re: '',
    //         benh: 'cháy bìa lá',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'trên lá có ổ của rầy',
    //         than: 'là nơi tập trung của rầy trưởng thành',
    //         re: 'là nơi tập trung của rầy trưởng thành',
    //         benh: 'Rầy nâu, rầy lưng trắng',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'sâu non ăn biểu bì mặt trên và diệp lục của lá dọc theo gân lá tạo thành những vệt trắng dài',
    //         than: '',
    //         re: '',
    //         benh: 'Sâu cuốn lá nhỏ',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'có màu xanh tái sẫm, dần chuyển sang màu vàng và héo khô',
    //         than: 'có vết sâu đục vào phần dưới của thân',
    //         re: '',
    //         benh: 'Sâu đục thân 2 chấm',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'Vết bệnh ở bẹ lá lúc đầu là vết đốm hình bầu dục màu lục tối hoặc xám nhạt, vết vằn da hổ, dạng đám mây',
    //         than: '',
    //         re: '',
    //         benh: 'Bệnh khô vằn',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'vết bệnh là những sọc nhỏ ngắn khác nhau, chạy dọc giữa các gân lá, lúc đầu vết bệnh xanh tái, dần dần chuyển màu nâu',
    //         than: '',
    //         re: '',
    //         benh: 'Bệnh bạc lá và đốm sọc vi khuẩn',
    //     },
    // ];

    // const test_data = [
    //     {
    //         loaicay: 'lúa',
    //         la: 'màu lá xanh đậm, rìa lá bị rách và gợn sóng, xoăn tít lại',
    //         than: 'lùn',
    //         re: '',
    //         benh: 'lùn xoắn lá',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'có vết bệnh màu xám nâu, hình thoi ở giữ có màu trắng',
    //         than: 'có vết bệnh màu xám nâu quanh thân',
    //         re: '',
    //         benh: 'đạo ôn',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'vết cháy có màu xám, hoặc vàng nâu hoặc nâu đỏ, dọc theo hai bên rìa lá',
    //         than: '',
    //         re: '',
    //         benh: 'cháy bìa lá',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'trên lá có ổ của rầy',
    //         than: 'là nơi tập trung của rầy trưởng thành',
    //         re: 'là nơi tập trung của rầy trưởng thành',
    //         benh: 'Rầy nâu, rầy lưng trắng',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'sâu non ăn biểu bì mặt trên và diệp lục của lá dọc theo gân lá tạo thành những vệt trắng dài',
    //         than: '',
    //         re: '',
    //         benh: 'Sâu cuốn lá nhỏ',
    //     },
    //     {
    //         loaicay: 'lúa',
    //         la: 'có màu xanh tái sẫm, dần chuyển sang màu vàng và héo khô',
    //         than: 'có vết sâu đục vào phần dưới của thân',
    //         re: '',
    //         benh: 'Sâu đục thân 2 chấm',
    //     },
    // ];

    // var training_data = [
    //     { color: 'blue', shape: 'square', liked: false },
    //     { color: 'red', shape: 'square', liked: false },
    //     { color: 'blue', shape: 'circle', liked: true },
    //     { color: 'red', shape: 'circle', liked: true },
    //     { color: 'blue', shape: 'hexagon', liked: false },
    //     { color: 'red', shape: 'hexagon', liked: false },
    //     { color: 'yellow', shape: 'hexagon', liked: true },
    //     { color: 'yellow', shape: 'circle', liked: true },
    // ];
    // var class_name = 'liked';
    // var features = ['color', 'shape'];

    const class_name = "benh";
    const features = ["la", "than", "re"];
    const dt = new DecisionTree(class_name, features);
    dt.train(training_data);
    const treeJson = dt.toJSON();
    dt.import(treeJson);

    const predicted_class = dt.predict(infoPest);
    const crop = await CropModel.findById(predicted_class.LoaiCay);
    const pesticide = await PesticideModel.find({
      "Benhs.idBenh": predicted_class._id,
    });
    const statistical = await StatisticalModel.findOne({
      "tukhoa.la": infoPest.la,
      "tukhoa.than": infoPest.than,
      "tukhoa.re": infoPest.re,
      "benh.tenBenh": predicted_class.ten,
    });
    if (statistical) {
      statistical.luot += 1;
      statistical.save();
      // console.log("có");
    } else {
      // console.log("không");
      const benh = {
        tenBenh: predicted_class.ten,
        anh: predicted_class.anh,
      };
      await StatisticalModel.create({ tukhoa: infoPest, benh: benh });
    }
    // console.log("predicted_class: ", predicted_class);
    // var predicted_class = dt.predict({
    //     color: 'red',
    //     shape: 'circle',
    // });
    // const detect = await PestModel.find(infoPest);
    res.status(200).json({
      success: true,
      message: "Thành công.",
      // data: predicted_class,
      data: { pest: predicted_class, crop, pesticide },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePest = async (req, res, next) => {
  try {
    const pest = await PestModel.findById(req.params.id);
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: "Bệnh này không tồn tại!",
      });
    }
    const { pestName, detailedSymptoms, identificationSymptoms, idCrop } =
      req.body;
    const { file } = req.files;
    let linkImg;
    if (!file) {
      linkImg = null;
    } else {
      linkImg = await upload(file.tempFilePath, folder);
    }

    pest.ten = pestName || pest.ten;
    pest.trieuchungchitiet = detailedSymptoms || pest.trieuchungchitiet;
    pest.trieuchungnhandang = identificationSymptoms || pest.trieuchungnhandang;
    pest.anh = linkImg.url || pest.anh;
    pest.LoaiCay = idCrop || pest.LoaiCay;
    pest.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin sâu bệnh thành công.",
      data: pest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPest,
  getAllPests,
  getPestById,
  detectPest,
  updatePest,
};
