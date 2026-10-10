module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const uid = String(req.query.uid || "").trim();

  if (!/^\d{6,15}$/.test(uid)) {
    return res.status(400).json({
      error: "সঠিক Free Fire UID দিন।"
    });
  }

  const apiKey = process.env.GAMESKINBO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Server-এ API key সেট করা নেই।"
    });
  }

  try {
    const response = await fetch(
      `https://api.gameskinbo.com/ff-info/get?uid=${encodeURIComponent(uid)}&region=BD`,
      {
        headers: {
          "x-api-key": apiKey,
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(
        response.status === 401 ? 502 : response.status
      ).json({
        error:
          response.status === 429
            ? "API request limit শেষ হয়েছে। পরে চেষ্টা করুন।"
            : (data.message || "Player information পাওয়া যায়নি।")
      });
    }

    const name = data?.AccountInfo?.AccountName;

    if (!name) {
      return res.status(404).json({
        error: "Game Name পাওয়া যায়নি। UID পরীক্ষা করুন।"
      });
    }

    return res.status(200).json({
      uid,
      name,
      region: data?.AccountInfo?.AccountRegion || "BD"
    });

  } catch (error) {
    return res.status(502).json({
      error: "UID API-তে সংযোগ করা যাচ্ছে না।"
    });
  }
};
