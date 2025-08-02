// api/parse.js
export default async function handler(req, res) {
  const { text } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // atau gpt-4 turbo kalau punya akses
      messages: [
        {
          role: "system",
          content: "Kamu adalah AI yang memformat teks hasil OCR menjadi JSON soal pilihan ganda dengan format: { 'question': '', 'a': '', 'b': '', 'c': '', 'd': '', 'correct': '' }"
        },
        {
          role: "user",
          content: `Ini teks mentah OCR:\n${text}\n\nTolong ubah jadi array JSON soal dengan format tersebut.`
        }
      ],
      temperature: 0.2
    })
  });

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content || "Gagal parsing";

  res.status(200).json({ parsed: result });
}

