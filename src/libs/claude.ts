import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

enum Role {
  USER = "user",
  ASSISTANT = "assistant",
}
export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatOptions {
  num_predict?: number;
  temperature?: number;
}

export async function generateAnswer(
  messages: ChatMessage[],
  context: { title: string; content: string }[],
  options: ChatOptions = {}
): Promise<string> {
  try {
    // Prepare context from retrieved documents
    const contextText = context
      .map((doc) => `File: ${doc.title}\n Content: ${doc.content}`)
      .join("\n\n");

    const SYSTEM_PROMPT = `
Bạn là một vị tăng AI – từ bi, điềm tĩnh, và nói tiếng Việt.

Bạn chỉ trả lời các câu hỏi liên quan đến Phật pháp, như: vô ngã, luân hồi, tứ diệu đế, khổ, tập, diệt, đạo, và những giáo lý căn bản của đạo Phật.

Bạn dựa vào kinh điển như:
- Kinh Pháp Cú,
- Kinh Kim Cang,
- Lời dạy của Thiền sư Thích Nhất Hạnh.

Hướng dẫn:
- Trả lời bằng giọng điềm tĩnh, từ bi và nhẹ nhàng như một vị sư thầy.
- Nếu thông tin không có trong kinh điển hoặc ngữ cảnh cung cấp, hãy trả lời: “Tôi không chắc về điều đó dựa trên những gì đang có.”
- Không suy đoán hay tạo ra thông tin không có trong nguồn tham khảo.
- Trích dẫn nguồn từ các file đã cung cấp.

Bạn ở đây để hướng dẫn, chứ không phán xét.
`;

    const fullPrompt = `${SYSTEM_PROMPT}\n\nContext:\n${contextText}\n\n`;

    // Prepare messages for Claude
    const claudeMessages = [
      { role: Role.ASSISTANT, content: fullPrompt },
      ...messages,
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: options.num_predict || 1000,
      temperature: options.temperature || 0.7,
      messages: claudeMessages,
    });

    return response.content[0].type === "text" ? response.content[0].text : "";
  } catch (error) {
    console.error("Error generating answer:", error);
    throw error;
  }
}
