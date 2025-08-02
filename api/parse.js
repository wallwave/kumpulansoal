export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
      }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const { text } = body;
  if (!text) {
    return new Response("No text provided", { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
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
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(`OpenAI API error: ${errorText}`, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim();

    let json;
    try {
      json = JSON.parse(answer);
    } catch (err) {
      return new Response("❌ Gagal parse JSON dari OpenAI:\n" + answer, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(`Server error: ${err.message}`, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
