// /api/parse.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  const prompt = `
Kamu adalah AI pengubah teks hasil OCR menjadi array JSON soal pilihan ganda. 
Setiap soal punya:
- "question"
- opsi "a", "b", "c", "d"
- "correct" (jawaban benar berdasarkan pengetahuan umum)

Contoh format:
[
  {
    "question": "Apa itu gaya gravitasi?",
    "a": "Tarikan bumi terhadap benda",
    "b": "Tekanan udara",
    "c": "Listrik statis",
    "d": "Dorongan angin",
    "correct": "a"
  }
]

Sekarang ubah teks berikut jadi format seperti itu:

"""${text}"""
  `;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.apenapi}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await openaiRes.json();
    const answer = data.choices?.[0]?.message?.content?.trim();

    try {
      const json = JSON.parse(answer);
      return res.status(200).json(json);
    } catch (e) {
      return res.status(500).json({
        error: "❌ Gagal parse JSON dari OpenAI",
        raw: answer,
      });
    }
  } catch (e) {
    return res.status(500).json({ error: "❌ Gagal komunikasi dengan OpenAI", detail: e.message });
  }
}
