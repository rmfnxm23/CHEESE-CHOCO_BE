const { Product, Category, sequelize } = require("../models");
require("dotenv").config();

const { cleanUnusedImages } = require("../services/editorImageCleaner");
const { Op } = require("sequelize");

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

    console.log(colorArray, "colorArray");
    // return;
    await Product.create({
      img: JSON.stringify(imgList), // 배열 형태의 데이터를 문자열로 변환 // JSON.parse(dbValue): 문자열을 다시 배열로 복원하려고
      name,
      price,
      content,
      color: JSON.stringify(colorArray),
      // color: colorArray,
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
  const { limit, sort, category, offset } = req.query;
  console.log(limit, sort);

  // 메인 요청: limit 4, offset undefined
  // 페이지네이션: limit 20, offset 40

  // console.log(req.query.category, "서버에서 확인"); // 서버에서 확인
  try {
    const whereClause = {};

    if (category) {
      whereClause.categoryId = category;
      console.log(typeof whereClause.categoryId, "--------");
      console.log(typeof category, "/////");
    }

    // 전체 상품 수 카운트 (카테고리 조건 포함)
    const total = await Product.count({ where: whereClause });

    const items = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          attributes: ["id", "category"], // 필요한 카테고리 필드만
        },
      ],
      ...(limit && { limit: parseInt(limit) }), // 4개 제한
      ...(offset && { offset: parseInt(offset) }), // 페이지네이션만
      ...(sort === "desc" && { order: [["createdAt", "DESC"]] }), // 최신순 정렬
    });

    // img 필드가 문자열인 경우 JSON 배열로 파싱
    const formatted = items.map((item) => ({
      ...item.dataValues,
      imgUrls: item.img ? JSON.parse(item.img) : [],
    }));

    // // 검색어가 있는데 결과가 없으면 빈 배열 그대로 응답
    // if (query && formatted.length === 0) {
    //   return res.json({ data: [] });
    // }

    // console.log(items.length, "조회된 아이템 수");
    // res.json({ data: items });
    res.json({
      data: formatted,
      total, // 페이지네이션 UI에 사용됨
    });
  } catch (err) {
    console.error(err);
  }
};

// 수정할 상품 조회
const getItem = async (req, res) => {
  try {
    let { id } = req.params;

    // console.log(req.params.id, "number");
    const item = await Product.findOne({
      where: { id },
      include: [
        {
          model: Category,
          attributes: ["id", "category"],
        },
      ],
    });

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

// 상품 검색
const getSearchItems = async (req, res) => {
  console.log("✅ 검색 API 도착"); // 이게 안 찍히면 라우팅 문제입니다
  try {
    const { query } = req.query;

    console.log("🔍 검색어:", query);

    if (!query || typeof query !== "string" || query.trim().length < 1) {
      return res.status(400).json({
        status: 400,
        message: "검색어(query 파라미터)를 입력해주세요.",
      });
    }

    const result = await Product.findAll({
      where: {
        name: {
          [Op.like]: `%${query.trim()}%`,
        },
      },
    });

    if (!result || result.length === 0) {
      return res
        .status(200)
        .json({ message: "상품을 찾을 수 없습니다.ㅋㅋㅋㅋ" });
    }

    // img 필드가 문자열인 경우 JSON 배열로 파싱
    const formatted = result.map((item) => ({
      ...item.dataValues,
      imgUrls: item.img ? JSON.parse(item.img) : [],
    }));

    return res.status(200).json({
      message: "상품을 불러왔습니다.",
      data: formatted,
    });
  } catch (err) {
    console.error("검색 오류:", err);
    return res.status(500).json({
      status: 500,
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  }
};

module.exports = {
  callbackImage,
  itemRegister,
  getItems,
  getItem,
  updateProduct,
  deleteProduct,
  getSearchItems,
};
