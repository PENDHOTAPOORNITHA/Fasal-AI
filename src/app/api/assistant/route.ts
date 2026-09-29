import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ConversationMessage = {
  role: "user" | "assistant";
  text: string;
};

function clean(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function extractSection(
  context: string,
  start: string,
  end?: string
): string {
  const startIndex = context.indexOf(start);

  if (startIndex === -1) return "";

  const contentStart =
    startIndex + start.length;

  if (!end) {
    return context.slice(contentStart).trim();
  }

  const endIndex = context.indexOf(
    end,
    contentStart
  );

  if (endIndex === -1) {
    return context
      .slice(contentStart)
      .trim();
  }

  return context
    .slice(contentStart, endIndex)
    .trim();
}

function getFarmData(
  farmContext: string
) {
  return {
    location: extractSection(
      farmContext,
      "CURRENT FARM LOCATION:",
      "MY FARM CROPS:"
    ),

    crops: extractSection(
      farmContext,
      "MY FARM CROPS:",
      "LATEST CROP SCAN:"
    ),

    scan: extractSection(
      farmContext,
      "LATEST CROP SCAN:",
      "CURRENT WEATHER:"
    ),

    weather: extractSection(
      farmContext,
      "CURRENT WEATHER:",
      "REGIONAL SIGNALS:"
    ),

    signals: extractSection(
      farmContext,
      "REGIONAL SIGNALS:",
      "FARM ALERTS:"
    ),

    alerts: extractSection(
      farmContext,
      "FARM ALERTS:"
    ),
  };
}

function detectCrop(
  message: string
) {
  const value = message.toLowerCase();

  if (
    value.includes("maize") ||
    value.includes("corn")
  )
    return "Maize";

  if (
    value.includes("paddy") ||
    value.includes("rice")
  )
    return "Paddy";

  if (value.includes("cotton"))
    return "Cotton";

  if (
    value.includes("chilli") ||
    value.includes("chili")
  )
    return "Chilli";

  if (value.includes("groundnut"))
    return "Groundnut";

  if (value.includes("tomato"))
    return "Tomato";

  return "";
}

function getCropsFromContext(
  cropsText: string
) {
  const matches = [
    ...cropsText.matchAll(
      /Crop:\s*([^\|\n]+)/gi
    ),
  ];

  return matches
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function getAreaFromContext(
  cropsText: string
) {
  const matches = [
    ...cropsText.matchAll(
      /Area:\s*([^\|\n]+)/gi
    ),
  ];

  let total = 0;

  for (const match of matches) {
    const value = Number(
      match[1].replace(/[^\d.]/g, "")
    );

    if (Number.isFinite(value)) {
      total += value;
    }
  }

  return total;
}

function getHarvests(
  cropsText: string
) {
  const lines = cropsText
    .split("\n")
    .filter(Boolean);

  return lines
    .map((line) => {
      const crop =
        line
          .match(
            /Crop:\s*([^|]+)/i
          )?.[1]
          ?.trim() || "";

      const harvest =
        line
          .match(
            /Harvest date:\s*([^|]+)/i
          )?.[1]
          ?.trim() || "";

      return {
        crop,
        harvest,
      };
    })
    .filter(
      (item) => item.crop && item.harvest
    );
}

function fallbackReply(
  message: string,
  farmContext: string
) {
  const lower = message.toLowerCase();
  const farm = getFarmData(
    farmContext
  );

  const crops = getCropsFromContext(
    farm.crops
  );

  const totalArea =
    getAreaFromContext(farm.crops);

  const harvests = getHarvests(
    farm.crops
  );

  /*
   * CROPS
   */
  if (
    lower.includes("what crops") ||
    lower.includes("which crops") ||
    lower.includes("my crops")
  ) {
    if (!crops.length) {
      return "I don't currently have any crops connected from My Farm.";
    }

    return (
      `You currently have ${crops.length} crops in My Farm:\n\n` +
      crops
        .map((crop) => `• ${crop}`)
        .join("\n")
    );
  }

  /*
   * AREA
   */
  if (
    lower.includes("how many acres") ||
    lower.includes("total farm area") ||
    lower.includes("farm area") ||
    lower.includes("acre")
  ) {
    if (!totalArea) {
      return "I don't currently have your farm area connected.";
    }

    return `Your connected My Farm records total approximately ${totalArea.toFixed(
      2
    )} acres.`;
  }

  /*
   * HARVEST
   */
  if (
    lower.includes("harvest") ||
    lower.includes("harvesting")
  ) {
    if (!harvests.length) {
      return "I don't currently have harvest dates connected for your crops.";
    }

    const requestedCrop =
      detectCrop(message);

    const matching =
      requestedCrop
        ? harvests.filter(
            (item) =>
              item.crop.toLowerCase() ===
              requestedCrop.toLowerCase()
          )
        : harvests;

    if (!matching.length) {
      return `I don't have a connected harvest date for ${requestedCrop}.`;
    }

    return matching
      .map(
        (item) =>
          `${item.crop}: expected harvest around ${item.harvest}.`
      )
      .join("\n");
  }

  /*
   * WEATHER
   */
  if (
    lower.includes("weather") ||
    lower.includes("temperature") ||
    lower.includes("rain") ||
    lower.includes("humidity")
  ) {
    if (
      !farm.weather ||
      farm.weather.includes(
        "not currently available"
      )
    ) {
      return `I don't currently have live weather data connected for your farm${
        farm.location
          ? ` in ${farm.location}`
          : ""
      }. You can open the Weather page for the latest connected forecast.`;
    }

    return (
      `Here is the connected weather context for ${
        farm.location || "your farm"
      }:\n\n${farm.weather}\n\n` +
      `Use rainfall and soil moisture together before making irrigation decisions.`
    );
  }

  /*
   * LATEST SCAN
   */
    /*
   * LATEST SCAN
   */
  if (
    lower.includes("latest scan") ||
    lower.includes("last scan") ||
    lower.includes("crop scan") ||
    lower.includes("scan about") ||
    lower.includes("what did the scan") ||
    lower.includes("what did my scan")
  ) {
    if (
      !farm.scan ||
      farm.scan.includes("No recent crop scan")
    ) {
      return "There is no recent crop scan connected yet. Open AI Crop Scan to create one.";
    }

    const scan = farm.scan;

    const getValue = (
      key: string
    ): string => {
      const regex = new RegExp(
        `"${key}"\\s*:\\s*"([^"]*)"`,
        "i"
      );

      const match = scan.match(regex);

      return match?.[1]?.trim() || "";
    };

    const scanCrop =
      getValue("crop") || "your crop";

    const issue =
      getValue("issue") ||
      "Possible crop stress";

    const confidence =
      getValue("confidence");

    const risk =
      getValue("risk");

    const explanation =
      getValue("explanation");

    const prevention =
      getValue("prevention");

    const getArray = (
      key: string
    ): string[] => {
      const regex = new RegExp(
        `"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`,
        "i"
      );

      const match = scan.match(regex);

      if (!match) return [];

      return [
        ...match[1].matchAll(
          /"([^"]+)"/g
        ),
      ]
        .map(
          (item) =>
            item[1].trim()
        )
        .filter(Boolean);
    };

    const actions =
      getArray("actions");

    const avoid =
      getArray("avoid");

    let reply =
      `Your latest crop scan was for ${scanCrop}.\n\n` +
      `What Fasal found:\n\n` +
      `• Issue: ${issue}\n`;

    if (confidence) {
      reply +=
        `• Confidence: ${confidence}\n`;
    }

    if (risk) {
      reply +=
        `• Risk: ${risk}\n`;
    }

    if (explanation) {
      reply +=
        `\nWhy this may be happening:\n\n` +
        `${explanation}\n`;
    }

    if (actions.length) {
      reply +=
        `\nWhat to do now:\n\n` +
        actions
          .map(
            (item) =>
              `• ${item}`
          )
          .join("\n") +
        "\n";
    }

    if (avoid.length) {
      reply +=
        `\nWhat to avoid:\n\n` +
        avoid
          .map(
            (item) =>
              `• ${item}`
          )
          .join("\n") +
        "\n";
    }

    if (prevention) {
      reply +=
        `\nPrevention:\n\n` +
        `${prevention}\n`;
    }

    reply +=
      `\nThis is an AI-assisted assessment, not a confirmed field diagnosis.`;

    return reply;
  }

  /*
   * MAIZE / CROP CARE
   */
  const crop =
    detectCrop(message);

  if (
    lower.includes("take care") ||
    lower.includes("care for") ||
    lower.includes("this week")
  ) {
    const cropName =
      crop || "your crop";

    return (
      `For ${cropName}, focus on these checks this week:\n\n` +
      `• Check soil moisture around the active root zone.\n` +
      `• Inspect several plants for pests, spots, yellowing or wilting.\n` +
      `• Keep the field free from unnecessary weed competition.\n` +
      `• Check whether recent rainfall changes your irrigation need.\n` +
      `• Follow the crop's current growth stage when planning fertilizer or other inputs.`
    );
  }

  /*
   * YELLOW LEAVES
   */
  if (
    lower.includes("yellow leaf") ||
    lower.includes("yellowing") ||
    lower.includes("yellow leaves")
  ) {
    return (
      `Yellowing leaves can have several causes, including nutrient deficiency, water stress, root problems or disease.\n\n` +
      `Start by checking:\n\n` +
      `• Soil moisture and drainage\n` +
      `• Whether yellowing affects old or new leaves\n` +
      `• Whether spots, lesions or insects are present\n` +
      `• Whether the same symptom is appearing across multiple plants\n\n` +
      `If the symptom is visible, use AI Crop Scan with a clear photo for a more specific assessment.`
    );
  }

  /*
   * PESTS
   */
  if (
    lower.includes("pest") ||
    lower.includes("insect") ||
    lower.includes("bug")
  ) {
    return (
      `If you notice pests, first inspect both sides of affected leaves and nearby plants.\n\n` +
      `Look for insects, eggs, feeding holes and fresh damage. Avoid applying multiple pesticides without identifying the cause.\n\n` +
      `If you can photograph the affected area, use AI Crop Scan so the observation can be assessed more specifically.`
    );
  }

  /*
   * IRRIGATION
   */
  if (
    lower.includes("water") ||
    lower.includes("irrigat")
  ) {
    return (
      `For irrigation, don't rely only on a fixed calendar schedule.\n\n` +
      `Check:\n\n` +
      `• Soil moisture in the active root zone\n` +
      `• Recent and expected rainfall\n` +
      `• Current crop growth stage\n` +
      `• Whether the field is already waterlogged\n\n` +
      `If the soil is already adequately moist, additional irrigation may not be necessary.`
    );
  }

  /*
   * GENERAL
   */
  return (
    `I can help with your connected farm data.\n\n` +
    `Try asking:\n\n` +
    `• What crops do I have?\n` +
    `• How many acres do I have?\n` +
    `• What is the weather at my farm?\n` +
    `• What was my latest crop scan about?\n` +
    `• What should I do if my maize leaves turn yellow?\n` +
    `• When will I harvest my chilli?`
  );
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const message =
      clean(body?.message);

    const farmContext =
      clean(body?.farmContext);

    const conversation: ConversationMessage[] =
      Array.isArray(
        body?.conversation
      )
        ? body.conversation
            .filter(
              (item: ConversationMessage) =>
                item &&
                (
                  item.role === "user" ||
                  item.role === "assistant"
                ) &&
                typeof item.text ===
                  "string"
            )
            .slice(-10)
        : [];

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Message is required.",
        },
        { status: 400 }
      );
    }

    const fallback = fallbackReply(
      message,
      farmContext
    );
    const lowerMessage = message.toLowerCase();

const isLatestScanQuestion =
  lowerMessage.includes("latest scan") ||
  lowerMessage.includes("last scan") ||
  lowerMessage.includes("scan about") ||
  lowerMessage.includes("what did the scan") ||
  lowerMessage.includes("what did my scan") ||
  lowerMessage.includes("crop scan about");

if (isLatestScanQuestion) {
  return NextResponse.json({
    success: true,
    reply: fallback,
    fallback: true,
  });
}

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {
      return NextResponse.json({
        success: true,
        reply: fallback,
        fallback: true,
      });
    }

    try {
      const genAI =
        new GoogleGenerativeAI(
          apiKey
        );

      const model =
        genAI.getGenerativeModel({
          model: "gemini-3.6-flash",
        });

      const prompt = `
You are Fasal AI, an agricultural assistant for Indian farmers.

Answer the farmer's question using the CONNECTED FARM DATA below.

Rules:
- Never invent farm facts.
- If the farmer asks about their crops, acreage, harvest dates, weather or latest scan, use the supplied data.
- If the data is unavailable, clearly say so.
- Use simple, practical English.
- Keep answers concise.
- Sound like a helpful human agricultural assistant, not a generic chatbot.
- Do not claim a disease with certainty.
- For crop problems, recommend observation and safe next steps.
- Do not recommend dangerous pesticide mixtures.

CONNECTED FARM DATA:
${farmContext}

RECENT CONVERSATION:
${conversation
  .map(
    (item) =>
      `${item.role}: ${item.text}`
  )
  .join("\n")}

CURRENT QUESTION:
${message}
`;

      const result =
        await model.generateContent(
          prompt
        );

      const reply =
        result.response
          .text()
          .trim();

      if (reply) {
        return NextResponse.json({
          success: true,
          reply,
          fallback: false,
        });
      }
    } catch (error) {
      console.error(
        "Assistant Gemini error:",
        error
      );
    }

    return NextResponse.json({
      success: true,
      reply: fallback,
      fallback: true,
    });
  } catch (error) {
    console.error(
      "Assistant route error:",
      error
    );

    return NextResponse.json({
      success: true,
      reply:
        "I couldn't connect to the AI service right now. Please try again.",
      fallback: true,
    });
  }
}