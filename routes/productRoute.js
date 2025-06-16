const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const productController = require("../controllers/productController");

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

// 상품 검색
router.get("/product/search", productController.getSearchItems); // 수정할 상품 조회 보다 상위에 위치해야 함 // :id 보다 아래에 위치할 경우 search가 :id로 해석된 것

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
