const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const productController = require("../controllers/productController");

// // 저장 위치 및 파일명 지정
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // 상대경로 또는 절대경로로 지정
//   },
//   //   filename: (req, file, cb) => {
//   //     // const ext = path.extname(file.originalname);
//   //     // cb(null, Date.now() + "-" + file.originalname);
//   //     const ext = path.extname(file.originalname); // 확장자 추출
//   //     const basename = path.basename(file.originalname, ext); // 확장자 제외한 순수 이름 추출
//   //     const safeName = basename.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // 특수 문자 제거
//   //     cb(null, `${Date.now()}-${safeName}${ext}`); // 파일명 중복 방지를 위해 Date.now() 추가
//   //   },
// });

// const upload = multer({ storage });

// 기존 product 이미지 업로드 (product/ 폴더에 저장)
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/product/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${randomName}${ext}`);
  },
});

const uploadProduct = multer({ storage: productStorage });

// 에디터용 이미지 업로드 (editor/ 폴더에 저장)
const editorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/editor/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${randomName}${ext}`);
  },
});
const uploadEditor = multer({ storage: editorStorage });

// 에디터 이미지 업로드
router.post(
  "/product/callbackImage",
  uploadEditor.array("image"),
  productController.callbackImage
);

// 상품 등록
router.post(
  "/product/register",
  //   upload.single("img"),
  uploadProduct.array("img"),
  productController.itemRegister
);

// 조회
router.get("/product", productController.getItems);

// 수정할 상품 조회
router.get("/product/:id", productController.getItem);

// 상품 수정
router.post(
  "/update/:id",
  uploadProduct.array("img"),
  productController.updateProduct
);

// 테이블 행(상품) 삭제
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
