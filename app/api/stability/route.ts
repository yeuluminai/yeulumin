import { NextRequest, NextResponse } from "next/server";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY;
  return NextResponse.json({ hasKey });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, apiKey: clientApiKey } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt is required." },
        { status: 400 }
      );
    }

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API key is missing. Please set GEMINI_API_KEY in your environment variables or provide your key in the customizer settings.",
        },
        { status: 400 }
      );
    }

    const errors: string[] = [];

    // 1. First attempt: Use the dedicated Imagen 3 model via :predict method
    try {
      const imagenUrl = `${GEMINI_BASE}/models/imagen-3.0-generate-002:predict?key=${apiKey.trim()}`;
      const imagenBody = {
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/png",
        },
      };

      const imagenResponse = await fetch(imagenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imagenBody),
      });

      if (imagenResponse.ok) {
        const imagenData = await imagenResponse.json();
        const predictions = imagenData?.predictions;
        if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
          const base64Data = predictions[0].bytesBase64Encoded;
          const mimeType = predictions[0].mimeType || "image/png";
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          return NextResponse.json({ success: true, image: dataUrl });
        } else {
          errors.push(`Imagen 3 returned success but no image data predictions.`);
        }
      } else {
        try {
          const errorJson = await imagenResponse.json();
          errors.push(
            `Imagen 3 (${imagenResponse.status}): ${
              errorJson?.error?.message || errorJson?.message || JSON.stringify(errorJson)
            }`
          );
        } catch {
          errors.push(`Imagen 3 HTTP error (${imagenResponse.status})`);
        }
      }
    } catch (err: any) {
      errors.push(`Imagen 3 request failed: ${err.message}`);
    }

    // 2. Fallback attempt: Try generating content via multimodal Gemini models (generateContent)
    const fallbackModels = [
      "gemini-2.5-flash-image",
      "gemini-2.0-flash-exp-image-generation",
      "gemini-2.5-flash-preview-image-generation",
      "gemini-2.0-flash-image-generation",
    ];

    const generateContentBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    for (const modelName of fallbackModels) {
      const url = `${GEMINI_BASE}/models/${modelName}:generateContent?key=${apiKey.trim()}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(generateContentBody),
        });

        if (!response.ok) {
          let errorMessage = "";
          try {
            const errorJson = await response.json();
            errorMessage =
              errorJson?.error?.message ||
              errorJson?.message ||
              JSON.stringify(errorJson).substring(0, 300);
          } catch {
            errorMessage = (await response.text()).substring(0, 300);
          }

          errors.push(`Model ${modelName} (${response.status}): ${errorMessage}`);
          continue;
        }

        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts;

        if (parts && parts.length > 0) {
          // Find inline image data
          for (const part of parts) {
            if (part.inlineData) {
              const mimeType = part.inlineData.mimeType || "image/png";
              const base64Data = part.inlineData.data;
              const dataUrl = `data:${mimeType};base64,${base64Data}`;
              return NextResponse.json({ success: true, image: dataUrl });
            }
          }
        }
        
        errors.push(`Model ${modelName} returned success but no image parts`);
      } catch (fetchErr: any) {
        errors.push(`Model ${modelName} request failed: ${fetchErr.message}`);
      }
    }

    // All models failed — return the full list of errors to help debug
    return NextResponse.json(
      {
        success: false,
        error: `All image generation options failed. Details:\n- ${errors.join("\n- ")}`,
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Gemini API Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
