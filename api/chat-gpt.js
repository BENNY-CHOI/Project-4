const fetch = require("node-fetch");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { keywords } = req.body;

    // 키워드가 모두 영어인지 확인
    const isEnglish = keywords.every((keyword) =>
      /^[A-Za-z\s]+$/.test(keyword)
    );

    // 프롬프트 생성
    const prompt = isEnglish
      ? `This child possesses the traits of ${keywords.join(
          ", "
        )}. Using Santa Claus's warm and encouraging tone, craft a message that praises the child's achievements and efforts throughout the year. 
        Additionally, include an encouraging note for the upcoming year. Limit the message to approximately 400 characters.`
      : `이 어린이는 ${keywords.join(
          ", "
        )}의 특성을 가진 아이입니다. 산타할아버지처럼 따뜻하고 격려하는 말투로, 이 아이가 올해 이룬 업적과 노력을 칭찬해주세요. 
        또한, 다가오는 해를 위한 격려의 메시지를 포함해주세요. 메시지는 약 400자 내외로 작성해 주세요.`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // text-davinci-003모델 지원 중단
            messages: [
              { role: "system", content: "You are Santa Claus." },
              { role: "user", content: prompt },
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (!data || !data.choices || data.choices.length === 0) {
        throw new Error("Invalid response from OpenAI API");
      }

      const message = data.choices[0].message.content.trim();
      res.status(200).json({ message });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to fetch OpenAI API response." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
