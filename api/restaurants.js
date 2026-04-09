export default async function handler(req, res) {
  const API_KEY = process.env.FOOD_API_KEY || "f479233845eb42f88e0d";
  const PAGE_SIZE = 20;

  const {
    page = 1,
    keyword = "",
    city = "",
    biz = "",
    pet = "Y",
  } = req.query;

  const start = (parseInt(page) - 1) * PAGE_SIZE + 1;
  const end = parseInt(page) * PAGE_SIZE;

  let url = `https://openapi.foodsafetykorea.go.kr/api/${API_KEY}/I1200/json/${start}/${end}`;

  const params = [];
  if (keyword) params.push(`BSNS_SITE_NM=${encodeURIComponent(keyword)}`);
  if (city)    params.push(`SITE_ADDR_RD=${encodeURIComponent(city)}`);
  if (biz)     params.push(`BSNS_SITE_CLSFC_NM=${encodeURIComponent(biz)}`);
  if (pet)     params.push(`PET_MNGT_YN=${pet}`);
  if (params.length) url += "?" + params.join("&");

  try {
    const response = await fetch(url);
    const data = await response.json();
    const root = data?.I1200;

    if (!root) return res.status(502).json({ error: "API 응답 형식 오류" });
    if (root.RESULT?.CODE !== "INFO-000") {
      return res.status(400).json({ error: root.RESULT?.MESSAGE || "조회 실패" });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      total: parseInt(root.total_count) || 0,
      rows: root.row || [],
    });
  } catch (err) {
    res.status(500).json({ error: "서버 오류: " + err.message });
  }
}
