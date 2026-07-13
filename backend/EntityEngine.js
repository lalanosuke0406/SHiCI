function extractSearchKeyword(text) {
  return String(text || "")
    .replace(/について教えて/g, "")
    .replace(/について/g, "")
    .replace(/教えて/g, "")
    .replace(/って何/g, "")
    .replace(/とは/g, "")
    .replace(/ですか/g, "")
    .replace(/[？?。]/g, "")
    .trim();
}



