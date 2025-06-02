const fs = require("fs");
const path = require("path");

// editor 폴더의 절대 경로를 설정
const editorFolder = path.join(__dirname, "../uploads/editor");

/**
 * 본문 HTML(content)에서 사용된 이미지 파일명만 추출하는 함수
 * 예: content 내 <img src="http://.../uploads/editor/filename.jpg">에서 filename.jpg만 추출
 */
const extractImageFilenamesFromContent = (content) => {
  const regex = /\/uploads\/editor\/([\w.-]+)/g; // 정규식으로 파일명 추출
  const matches = [];
  let match;
  // 모든 정규식 일치 결과를 반복해서 파일명을 추출
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]); // 추출된 파일명만 저장
  }
  return matches; // 사용 중인 이미지 파일명 배열 반환
};

/**
 * 에디터 content에 사용되지 않은 이미지 파일을 삭제하는 함수
 *
 * @param {string} content - 에디터 본문 (이미지 URL 포함)
 */
const cleanUnusedImages = (content) => {
  // 현재 editor 폴더 안에 있는 모든 파일 목록을 읽음
  const allFiles = fs.readdirSync(editorFolder);

  // 실제로 content에 사용 중인 이미지 파일명 추출
  const usedFiles = extractImageFilenamesFromContent(content);

  // 사용되지 않은 파일만 필터링
  const unusedFiles = allFiles.filter((file) => !usedFiles.includes(file));

  // 사용되지 않은 파일들을 순회하며 삭제 시도
  unusedFiles.forEach((file) => {
    const filePath = path.join(editorFolder, file);
    try {
      fs.unlinkSync(filePath); // 파일 삭제
      console.log(`Deleted unused image: ${file}`); // 성공 로그
    } catch (err) {
      console.error(`Failed to delete image ${file}:`, err); // 실패 로그
    }
  });
};

module.exports = {
  cleanUnusedImages,
  extractImageFilenamesFromContent,
};
