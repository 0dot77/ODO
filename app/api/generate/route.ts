import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const BASE_PROMPT =
  "Act as an expert frontend developer and web designer. Look at the provided wireframe/sketch image and generate a single, self-contained HTML file for a presentation slide. Include inline CSS and JS. Make it visually stunning, modern, and interactive. Return ONLY the raw HTML code, without any markdown formatting or explanations.";

function buildSystemPrompt(mood: string): string {
  return `${BASE_PROMPT}\n\nCRITICAL: The visual style, color palette, typography, and CSS animations MUST strictly follow the '${mood}' aesthetic. Ensure the CSS perfectly reflects this specific design language.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { imageBase64, mood = "Minimalist" } = (await req.json()) as {
    imageBase64: string;
    mood?: string;
  };
  if (!imageBase64) {
    return NextResponse.json(
      { error: "imageBase64 is required" },
      { status: 400 }
    );
  }

  // Strip data URL prefix if present (e.g. "data:image/png;base64,")
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: buildSystemPrompt(mood),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: "Generate the HTML slide based on this wireframe.",
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const html = textBlock ? textBlock.text : "";

    return NextResponse.json({ html });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Anthropic API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
