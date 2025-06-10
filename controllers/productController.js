const { Product, Category } = require("../models");
require("dotenv").config();

const { cleanUnusedImages } = require("../services/editorImageCleaner");

// 에디터(content:본문) 이미지 업로드
const callbackImage = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "파일이 첨부되지 않았습니다." });
  }

  // 여러 이미지의 URL 반환
  const urls = req.files.map((file) => {
    return `${process.env.BASE_URL}/uploads/editor/${file.filename}`;
  });

  res.status(200).json({ urls }); // 배열 형태로 반환
};

// 상품 등록
const itemRegister = async (req, res) => {
  try {
    // console.log(req.files, "배열?");

    const imgList = req.files.map((file) => file.filename);
    // console.log(imgList, "저장 상태");

    let { name, price, content, color, size, categoryId } = req.body;

    // console.log(color, "color");
    // console.log(size, "size");
    // const img = req.file ? req.file.filename : null;
    // console.log(img);

    const colorArray = color
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item); // 공백 제거 + 빈 값 제거
    console.log(typeof colorArray);

    const sizeArray = size
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item); // 공백 제거 + 빈 값 제거

    // return;
    await Product.create({
      img: JSON.stringify(imgList), // 배열 형태의 데이터를 문자열로 변환 // JSON.parse(dbValue): 문자열을 다시 배열로 복원하려고
      name,
      price,
      content,
      color: JSON.stringify(colorArray),
      size: JSON.stringify(sizeArray),
      categoryId,
    });

    // 미사용 이미지 정리 서비스 호출
    cleanUnusedImages(content);

    res.status(201).json({ message: "상품이 등록되었습니다." });
  } catch (err) {
    console.error(err);
  }
};

// 상품 전체 조회
const getItems = async (req, res) => {
  const { limit, sort, category } = req.query;
  console.log(limit, sort);

  console.log(req.query.category, "서버에서 확인"); // 서버에서 확인
  try {
    const whereClause = {};

    if (category) {
      whereClause.categoryId = category;
      console.log(typeof whereClause.categoryId);
      console.log(typeof category);
    }

    const items = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          attributes: ["id", "category"], // 필요한 카테고리 필드만
        },
      ],
      ...(limit && { limit: parseInt(limit) }), // 4개 제한
      ...(sort === "desc" && { order: [["createdAt", "DESC"]] }), // 최신순 정렬
    });

    // img 필드가 문자열인 경우 JSON 배열로 파싱
    const formatted = items.map((item) => ({
      ...item.dataValues,
      imgUrls: item.img ? JSON.parse(item.img) : [],
    }));

    console.log(items.length, "조회된 아이템 수");
    // res.json({ data: items });
    res.json({ data: formatted });
  } catch (err) {
    console.error(err);
  }
};

// 수정할 상품 조회
const getItem = async (req, res) => {
  try {
    let { id } = req.params;

    // console.log(req.params.id, "number");
    const item = await Product.findOne({ where: { id } });

    if (!item) {
      return res.json({ message: "상품을 찾을 수 없습니다." });
    }
    console.log(item.img, "no?");

    // 이미지 필드가 JSON 문자열이면 배열로 파싱
    const imgUrls = item.img ? JSON.parse(item.img) : [];
    const colorArray = item.color ? JSON.parse(item.color) : [];
    const sizeArray = item.size ? JSON.parse(item.size) : [];

    // res.json({ data: item });
    res
      .status(200)
      .json({ data: { ...item.dataValues, imgUrls, colorArray, sizeArray } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "서버 오류로 상품을 불러오지 못했습니다." });
  }
};

// 테이블 행(상품) 수정
const updateProduct = async (req, res) => {
  try {
    let { id } = req.params;

    let { name, price, content, color, size, categoryId } = req.body;

    let imgUrls = [];

    // 새로 업로드된 이미지가 있는 경우
    if (req.files && req.files.length > 0) {
      imgUrls = req.files.map((file) => file.filename);
    }
    // 새 이미지가 없고 기존 이미지 정보가 있는 경우
    else if (req.body.existingImg) {
      // 여러 개일 수 있으므로 배열로 보장
      if (Array.isArray(req.body.existingImg)) {
        imgUrls = req.body.existingImg;
      } else {
        imgUrls = [req.body.existingImg];
      }
    }

    const colorArray = color
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item); // 공백 제거 + 빈 값 제거
    console.log(typeof colorArray);

    const sizeArray = size
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item); // 공백 제거 + 빈 값 제거

    const CategoryId = parseInt(categoryId, 10); // 숫자로 변환

    const product = await Product.update(
      {
        img: JSON.stringify(imgUrls), // 배열 형태의 데이터를 문자열로 변환 // JSON.parse(dbValue): 문자열을 다시 배열로 복원하려고
        name,
        price,
        content,
        color: JSON.stringify(colorArray),
        size: JSON.stringify(sizeArray),
        categoryId: CategoryId,
      },
      { where: { id } }
    );
    res.status(200).json({ message: "상품이 성공적으로 수정되었습니다." });
  } catch (err) {
    console.error(err);
  }
};

// 테이블 행(상품) 삭제
const deleteProduct = async (req, res) => {
  try {
    console.log(req, "csdfsd");
    let { id } = req.params;

    const product = await Product.destroy({ where: { id } });

    res.json({ message: "삭제되었습니다." });
  } catch (err) {
    console.error(err);
  }
};
module.exports = {
  callbackImage,
  itemRegister,
  getItems,
  getItem,
  updateProduct,
  deleteProduct,
};
