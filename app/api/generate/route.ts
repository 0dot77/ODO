import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const BASE_PROMPT = `Act as an expert frontend developer and web designer. Look at the provided wireframe/sketch image and generate a single, self-contained HTML file for a presentation slide. Include inline CSS and JS. Make it visually stunning, modern, and interactive. Return ONLY the raw HTML code, without any markdown formatting or explanations.

GUARANTEE NATIVE RESPONSIVENESS: The visual elements and layout you generate MUST be designed to be fully responsive within any 16:9 aspect-ratio container. Even if you use absolute positioning, do NOT use hardcoded pixel values. Instead, use relative units like percentages (%) or viewport-based units (vw, vh) so the design scales naturally. Ensure no elements break or overlap at different sizes.`;

function buildSystemPrompt(mood: string, designSystemContext?: string): string {
  let prompt = `${BASE_PROMPT}\n\nCRITICAL: The visual style, color palette, typography, and CSS animations MUST strictly follow the '${mood}' aesthetic. Ensure the CSS perfectly reflects this specific design language.`;

  if (designSystemContext) {
    prompt += `\n\nCRITICAL MASTER STYLE INSTRUCTION: You are generating a slide for an existing presentation with an established visual identity. You MUST adopt the exact CSS variables, color palette, font-families, and animation properties from the Master Style below.

---
${designSystemContext}
---

RULE 1: REUSE the exact CSS custom properties (--variables), font-families, and color values from the Master Style above.
RULE 2: DO NOT copy the HTML structure or layout — generate layout STRICTLY from the sketch.
RULE 3: You may introduce minor stylistic variations (e.g., accent gradients, subtle shadows) that complement the Master Style without contradicting it.`;
  }

  return prompt;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const {
    imageBase64,
    mood = "Minimalist",
    designSystemContext,
  } = (await req.json()) as {
    imageBase64: string;
    mood?: string;
    designSystemContext?: string;
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
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: buildSystemPrompt(mood, designSystemContext),
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
    let html = textBlock ? textBlock.text : "";

    // Strip markdown code fences if the model wraps the response
    html = html.replace(/^```(?:html)?\s*\n?/i, "").replace(/\n?```\s*$/, "");

    return NextResponse.json({ html });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Anthropic API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
