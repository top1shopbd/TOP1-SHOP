module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = String(req.query.uid || "").trim();

  if (!/^\d{6,15}$/.test(uid)) {
    return res.status(400).json({ error: "সঠিক UID দিন।" });
  }

  const apiKey = process.env.GAMESKINBO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key server-এ সেট করা হয়নি।"
    });
  }

  try {
    const response = await fetch(
      `https://api.gameskinbo.com/ff-info/get?uid=${encodeURIComponent(uid)}&region=BD`,
      {
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || "Player information পাওয়া যায়নি।"
      });
    }

    const name = data?.AccountInfo?.AccountName;

    if (!name) {
      return res.status(404).json({
        error: "Game Name পাওয়া যায়নি। UID ঠিক আছে কি না দেখুন।"
      });
    }

    return res.status(200).json({
      uid,
      name,
      region: data?.AccountInfo?.AccountRegion || "BD"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server থেকে API-তে যোগাযোগ করা যাচ্ছে না।"
    });
  }
};
