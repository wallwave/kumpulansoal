export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { text } = await req.json();

  if (!text) {
    return new Response("No text provided", { status: 400 });
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

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.apenapi}`, // ✅ pakai nama variabel sesuai
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  }),
});


  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content?.trim();

  try {
    const json = JSON.parse(answer);
    return new Response(JSON.stringify(json), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response("❌ Gagal parse JSON dari OpenAI:\n" + answer, {
      status: 500,
    });
  }
}