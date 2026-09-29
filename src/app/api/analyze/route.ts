import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { analyzeSignalCluster } from "@/lib/signalEngine";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

type AnalysisResult = {
  issue: string;
  confidence: string;
  risk: string;
  explanation: string;
  actions: string[];
  avoid: string[];
  prevention: string;
  local_context: string;
  language: string;
};

type GeminiTextPart = {
  text: string;
};

type GeminiImagePart = {
  inlineData: {
    data: string;
    mimeType: string;
  };
};

type GeminiPart =
  | GeminiTextPart
  | GeminiImagePart;

function getLocalizedDemoAnalysis(
  crop: string,
  state: string,
  district: string,
  description: string,
  language: string
): AnalysisResult {
  const text = description.toLowerCase();

  let issue = "";
  let risk = "";
  let confidence = "";
  let explanation = "";
  let actions: string[] = [];
  let avoid: string[] = [];
  let prevention = "";
  let localContext = "";

  if (language === "Telugu") {
    issue =
      "పంటలో ఒత్తిడి కనిపించే అవకాశం ఉంది";

    risk = "మధ్యస్థ";
    confidence = "82%";

    explanation =
      `${crop} పంటలో ఒత్తిడి లక్షణాలు కనిపించే అవకాశం ఉంది. ఖచ్చితమైన కారణాన్ని నిర్ధారించడానికి పొలంలో మరింత పరిశీలన చేయండి.`;

    actions = [
      "లక్షణాలు ఎన్ని మొక్కలకు వ్యాపించాయో పరిశీలించండి.",
      "నేలలో తేమ మరియు నీటి పారుదలను తనిఖీ చేయండి.",
      "తదుపరి కొన్ని రోజులు ప్రభావిత ప్రాంతాన్ని గమనించండి.",
    ];

    avoid = [
      "కారణం తెలియకుండా అనేక పురుగుమందులను కలిపి ఉపయోగించవద్దు.",
      "అధికంగా నీరు పెట్టడం లేదా నీరు నిల్వ ఉండే పరిస్థితిని నివారించండి.",
    ];

    prevention =
      "పంటను క్రమం తప్పకుండా పరిశీలించండి. సమతుల్య పోషకాలను అందించండి మరియు నీరు నిల్వ ఉండకుండా చూడండి.";

    localContext =
      `${district || state || "ఎంచుకున్న ప్రాంతం"} ప్రాంతంలోని ${crop} పంటను దృష్టిలో ఉంచుకుని ఈ ప్రాథమిక అంచనా ఇవ్వబడింది. వాతావరణం, నీటిపారుదల మరియు కాలానుగుణ పంట ఒత్తిడి లక్షణాలను ప్రభావితం చేయవచ్చు.`;

    if (
      text.includes("yellow") ||
      text.includes("పసుపు") ||
      text.includes("yellowing")
    ) {
      issue =
        crop.toLowerCase().includes("maize")
          ? "మొక్కజొన్నలో పోషకాలు లేదా నీటి ఒత్తిడి ఉండే అవకాశం"
          : "పోషకాల లోపం లేదా పంట ఒత్తిడి ఉండే అవకాశం";

      confidence = "87%";

      explanation =
        `${crop} ఆకులు పసుపు రంగులోకి మారడం పోషకాల లోపం, నీటి అసమతుల్యత, వేర్ల ఒత్తిడి లేదా ప్రారంభ దశలోని వ్యాధి కారణంగా ఉండవచ్చు.`;

      actions = [
        "ప్రభావిత మొక్కల చుట్టూ నేల తేమ మరియు నీటి పారుదలను తనిఖీ చేయండి.",
        "పాత ఆకులు మరియు కొత్త ఆకులను పోల్చి పసుపు రంగు ఎక్కడ మొదలవుతుందో చూడండి.",
        "చికిత్స చేయడానికి ముందు అనేక మొక్కలను పరిశీలించండి.",
      ];
    } else if (
      text.includes("spot") ||
      text.includes("spots") ||
      text.includes("brown") ||
      text.includes("black") ||
      text.includes("మచ్చలు")
    ) {
      issue =
        crop.toLowerCase().includes("tomato")
          ? "టమాటాలో ఫంగస్ వల్ల ఆకు మచ్చలు లేదా ప్రారంభ దశ వ్యాధి ఉండే అవకాశం"
          : crop.toLowerCase().includes("chilli")
          ? "మిరపలో ఆకు మచ్చలు లేదా ఫంగస్ వ్యాధి ఒత్తిడి ఉండే అవకాశం"
          : "ఫంగస్ వల్ల ఆకు మచ్చలు లేదా వ్యాధి ఒత్తిడి ఉండే అవకాశం";

      risk = "అధిక";
      confidence = "89%";

      explanation =
        `${crop}లో కనిపిస్తున్న మచ్చలు లేదా రంగు మార్పులు వ్యాధి ఒత్తిడి లేదా ఇతర పంట సమస్యను సూచించవచ్చు. సమస్య ఎంతవరకు వ్యాపించిందో తెలుసుకోవడానికి అనేక మొక్కలను పరిశీలించండి.`;

      actions = [
        "ఆరోగ్యకరమైన మరియు ప్రభావిత ఆకులను అనేక మొక్కల్లో పరిశీలించండి.",
        "ఆకులపై తేమ ఎక్కువసేపు ఉండకుండా గాలి ప్రసరణ మెరుగుపరచండి.",
        "తేమ లేదా వర్షం తర్వాత కొత్త మచ్చలు ఏర్పడుతున్నాయో గమనించండి.",
      ];
    } else if (
      text.includes("wilt") ||
      text.includes("wilting") ||
      text.includes("వాడిపో") ||
      text.includes("వాడటం")
    ) {
      issue =
        "పంట వాడిపోవడం లేదా నీటి సంబంధిత ఒత్తిడి ఉండే అవకాశం";

      risk = "అధిక";
      confidence = "85%";

      explanation =
        `${crop}లో వాడిపోవడం నీటి కొరత, వేర్ల సమస్య లేదా వ్యాధి కారణంగా ఉండవచ్చు. నేల తేమ, నీటి పారుదల మరియు ప్రభావిత మొక్కలను జాగ్రత్తగా పరిశీలించండి.`;

      actions = [
        "వేర్ల స్థాయిలో నేల తేమను తనిఖీ చేయండి.",
        "సమస్య వ్యాపిస్తుంటే వేర్లు మరియు కాండాన్ని పరిశీలించండి.",
        "ప్రభావిత మొక్కలు పొలంలోని ఒకే ప్రాంతంలో ఉన్నాయో చూడండి.",
      ];
    } else if (
      text.includes("hole") ||
      text.includes("holes") ||
      text.includes("insect") ||
      text.includes("pest") ||
      text.includes("worm") ||
      text.includes("damage") ||
      text.includes("పురుగు")
    ) {
      issue =
        "పురుగుల వల్ల ఆకులు లేదా మొక్కకు నష్టం కలిగే అవకాశం";

      risk = "మధ్యస్థ";
      confidence = "86%";

      explanation =
        `${crop} పంటలో కనిపిస్తున్న నష్టం పురుగుల కార్యకలాపాలను సూచించవచ్చు. ఆకుల రెండు వైపులా పురుగులు, గుడ్లు లేదా తినివేసిన గుర్తులను పరిశీలించండి.`;

      actions = [
        "ప్రభావిత ఆకుల రెండు వైపులా పరిశీలించండి.",
        "పురుగులు, గుడ్లు లేదా కొత్తగా ఏర్పడిన నష్టాన్ని చూడండి.",
        "సమీపంలోని అనేక మొక్కలను పరిశీలించి సమస్య ఎంతవరకు వ్యాపించిందో అంచనా వేయండి.",
      ];
    }
  } else if (language === "Hindi") {
    issue =
      "फसल में तनाव के संकेत दिखाई देने की संभावना है";

    risk = "मध्यम";
    confidence = "82%";

    explanation =
      `${crop} की फसल में तनाव के लक्षण दिखाई दे सकते हैं। सही कारण की पुष्टि करने के लिए खेत में आगे निरीक्षण करें।`;

    actions = [
      "जांच करें कि लक्षण कितने पौधों में फैले हैं।",
      "मिट्टी की नमी और जल निकासी की जांच करें।",
      "अगले कुछ दिनों तक प्रभावित क्षेत्र की निगरानी करें।",
    ];

    avoid = [
      "कारण की पहचान किए बिना कई कीटनाशकों को एक साथ इस्तेमाल न करें।",
      "अधिक सिंचाई या खेत में पानी जमा होने से बचें।",
    ];

    prevention =
      "फसल की नियमित निगरानी करें, संतुलित पोषण दें और खेत में पानी जमा न होने दें।";

    localContext =
      `${district || state || "चयनित क्षेत्र"} के ${crop} को ध्यान में रखते हुए यह प्रारंभिक आकलन दिया गया है। मौसम, सिंचाई और मौसमी फसल दबाव लक्षणों को प्रभावित कर सकते हैं।`;

    if (
      text.includes("yellow") ||
      text.includes("yellowing") ||
      text.includes("पीला")
    ) {
      issue =
        crop.toLowerCase().includes("maize")
          ? "मक्का में पोषक तत्व या पानी के तनाव की संभावना"
          : "पोषक तत्वों की कमी या फसल तनाव की संभावना";

      confidence = "87%";

      explanation =
        `${crop} की पत्तियों का पीला होना पोषक तत्वों की कमी, पानी के असंतुलन, जड़ों के तनाव या शुरुआती बीमारी के कारण हो सकता है।`;

      actions = [
        "प्रभावित पौधों के आसपास मिट्टी की नमी और जल निकासी की जांच करें।",
        "पुरानी और नई पत्तियों की तुलना करके देखें कि पीलापन कहां से शुरू हो रहा है।",
        "उपचार करने से पहले कई पौधों का निरीक्षण करें।",
      ];
    } else if (
      text.includes("spot") ||
      text.includes("spots") ||
      text.includes("brown") ||
      text.includes("black") ||
      text.includes("दाग")
    ) {
      issue =
        crop.toLowerCase().includes("tomato")
          ? "टमाटर में फंगल लीफ स्पॉट या शुरुआती बीमारी की संभावना"
          : crop.toLowerCase().includes("chilli")
          ? "मिर्च में पत्ती के दाग या फंगल बीमारी का दबाव हो सकता है"
          : "फंगल लीफ स्पॉट या बीमारी के तनाव की संभावना";

      risk = "उच्च";
      confidence = "89%";

      explanation =
        `${crop} में दिखाई देने वाले दाग या रंग में बदलाव बीमारी के दबाव या अन्य फसल समस्या का संकेत हो सकते हैं। समस्या कितनी फैली है यह जानने के लिए कई पौधों का निरीक्षण करें।`;

      actions = [
        "स्वस्थ और प्रभावित पत्तियों को कई पौधों में जांचें।",
        "पत्तियों पर नमी लंबे समय तक न रहे इसके लिए हवा का प्रवाह बेहतर करें।",
        "नमी या बारिश के बाद नए दाग दिखाई देते हैं या नहीं देखें।",
      ];
    } else if (
      text.includes("wilt") ||
      text.includes("wilting") ||
      text.includes("मुरझा")
    ) {
      issue =
        "फसल के मुरझाने या पानी से संबंधित तनाव की संभावना";

      risk = "उच्च";
      confidence = "85%";

      explanation =
        `${crop} में मुरझाना पानी की कमी, जड़ों की समस्या या बीमारी के कारण हो सकता है। मिट्टी की नमी, जल निकासी और प्रभावित पौधों की सावधानी से जांच करें।`;

      actions = [
        "जड़ों के स्तर पर मिट्टी की नमी जांचें।",
        "समस्या बढ़ रही हो तो जड़ों और निचले तने की जांच करें।",
        "देखें कि प्रभावित पौधे खेत के किसी एक हिस्से में अधिक हैं या नहीं।",
      ];
    } else if (
      text.includes("hole") ||
      text.includes("holes") ||
      text.includes("insect") ||
      text.includes("pest") ||
      text.includes("worm") ||
      text.includes("damage") ||
      text.includes("कीड़ा")
    ) {
      issue =
        "कीटों से पत्तियों या पौधे को नुकसान होने की संभावना";

      risk = "मध्यम";
      confidence = "86%";

      explanation =
        `${crop} में दिखाई देने वाला नुकसान कीट गतिविधि का संकेत हो सकता है। पत्तियों के दोनों तरफ कीट, अंडे या खाने के निशान देखें।`;

      actions = [
        "प्रभावित पत्तियों के दोनों तरफ जांच करें।",
        "कीट, अंडे या नया नुकसान दिखाई देता है या नहीं देखें।",
        "पास के कई पौधों को देखकर समस्या कितनी फैली है इसका अनुमान लगाएं।",
      ];
    }
  } else {
    issue = "Possible crop stress";

    risk = "Moderate";
    confidence = "82%";

    explanation =
      `The observation suggests possible stress affecting the ${crop} crop. Further field inspection is recommended before confirming the exact cause.`;

    actions = [
      "Inspect several plants to check how widely the symptoms have spread.",
      "Check soil moisture, drainage and recent weather.",
      "Monitor the affected area again over the next few days.",
    ];

    avoid = [
      "Avoid applying multiple pesticides without identifying the cause.",
      "Avoid overwatering or prolonged waterlogging.",
    ];

    prevention =
      "Monitor the crop regularly, maintain balanced nutrition, avoid unnecessary waterlogging and inspect new symptoms early.";

    localContext =
      `This assessment considers ${crop} observations from ${
        district ||
        state ||
        "the selected region"
      }. Local weather, irrigation and seasonal crop pressure can influence symptoms.`;

    if (
      text.includes("yellow") ||
      text.includes("yellowing")
    ) {
      issue =
        crop.toLowerCase().includes("maize")
          ? "Possible nutrient or water stress in maize"
          : "Possible nutrient deficiency or crop stress";

      confidence = "87%";

      explanation =
        `Yellowing symptoms in ${crop} can be associated with nutrient deficiency, water imbalance, root stress or early disease pressure.`;

      actions = [
        "Check soil moisture and drainage around affected plants.",
        "Compare older and newer leaves to see where yellowing begins.",
        "Inspect several plants before applying any treatment.",
      ];
    } else if (
      text.includes("spot") ||
      text.includes("spots") ||
      text.includes("brown") ||
      text.includes("black") ||
      text.includes("lesion")
    ) {
      issue =
        crop.toLowerCase().includes("tomato")
          ? "Possible fungal leaf spot or early blight-like stress"
          : crop.toLowerCase().includes("chilli")
          ? "Possible leaf spot or fungal disease pressure"
          : "Possible fungal leaf spot or disease stress";

      risk = "High";
      confidence = "89%";

      explanation =
        `The described spots or discoloration on ${crop} may indicate disease pressure or another crop stress condition. Inspect multiple plants to understand how widely the symptoms have spread.`;

      actions = [
        "Inspect both healthy and affected leaves on several plants.",
        "Improve airflow where dense foliage is keeping leaves wet.",
        "Monitor whether new spots appear after humid or rainy conditions.",
      ];
    } else if (
      text.includes("wilt") ||
      text.includes("wilting")
    ) {
      issue =
        "Possible wilting or water-related stress";

      risk = "High";
      confidence = "85%";

      explanation =
        `Wilting in ${crop} can be associated with water stress, root problems or disease. Check soil moisture, drainage and affected plants carefully.`;

      actions = [
        "Check soil moisture at root level.",
        "Inspect roots and lower stems if the problem is spreading.",
        "Check whether affected plants are concentrated in one field area.",
      ];
    } else if (
      text.includes("hole") ||
      text.includes("holes") ||
      text.includes("insect") ||
      text.includes("pest") ||
      text.includes("worm") ||
      text.includes("damage")
    ) {
      issue =
        "Possible pest feeding damage";

      risk = "Moderate";
      confidence = "86%";

      explanation =
        `The described damage may indicate pest activity affecting the ${crop} crop. Inspect both sides of leaves and nearby plants for insects, eggs or feeding damage.`;

      actions = [
        "Inspect both sides of affected leaves.",
        "Look for insects, eggs or fresh feeding damage.",
        "Check several nearby plants to estimate how widely the damage has spread.",
      ];
    }
  }

  return {
    issue,
    confidence,
    risk,
    explanation,
    actions,
    avoid,
    prevention,
    local_context: localContext,
    language,
  };
}

async function getGeminiAnalysis(
  crop: string,
  state: string,
  district: string,
  description: string,
  language: string,
  image: File | null
): Promise<AnalysisResult> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const model =
    genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

  const prompt = `
You are Fasal AI, an agricultural early-intelligence assistant for Indian farmers.

Analyze the crop observation carefully.

Crop: ${crop}
State: ${state || "Not provided"}
District: ${district || "Not provided"}

Farmer description:
${description || "No description provided"}

The farmer selected this response language:
${language}

IMPORTANT LANGUAGE RULE:

EVERY HUMAN-READABLE VALUE in the JSON response MUST be written in ${language}.

This includes:
- issue
- confidence wording if any
- risk
- explanation
- every action
- every avoid item
- prevention
- local_context

Do NOT return English text when the selected language is Telugu or Hindi.

If the selected language is Telugu, write the response naturally in Telugu script.

If the selected language is Hindi, write the response naturally in Devanagari script.

If the selected language is English, write natural simple English.

If an image is provided, examine visible symptoms such as:
- leaf colour
- spots
- lesions
- holes
- wilting
- pest damage
- fruit abnormalities
- stem abnormalities

Return ONLY valid JSON:

{
  "issue": "likely crop issue or condition",
  "confidence": "percentage such as 85%",
  "risk": "Low, Moderate, High, or Critical",
  "explanation": "simple explanation",
  "actions": [
    "first action",
    "second action",
    "third action"
  ],
  "avoid": [
    "thing to avoid",
    "another thing to avoid"
  ],
  "prevention": "simple prevention advice",
  "local_context": "relevant local context"
}

Rules:
- Do not claim certainty.
- This is an AI-assisted assessment, not a laboratory diagnosis.
- Do not recommend dangerous pesticide combinations.
- Prefer safe integrated pest management.
- If the image is unclear, say so.
- Keep advice practical for an Indian farmer.
- Use simple natural language.
- Return ALL text in ${language}.
`;

  const parts: GeminiPart[] = [
    { text: prompt },
  ];

  if (image) {
    const bytes =
      await image.arrayBuffer();

    const base64 =
      Buffer.from(bytes).toString(
        "base64"
      );

    parts.push({
      inlineData: {
        data: base64,
        mimeType:
          image.type ||
          "image/jpeg",
      },
    });
  }

  const result =
    await model.generateContent(parts);

  const text =
    result.response.text();

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed =
      JSON.parse(cleaned) as Partial<AnalysisResult>;

    return {
      issue:
        typeof parsed.issue === "string"
          ? parsed.issue
          : "Unable to determine",

      confidence:
        typeof parsed.confidence === "string"
          ? parsed.confidence
          : "Low",

      risk:
        typeof parsed.risk === "string"
          ? parsed.risk
          : "Moderate",

      explanation:
        typeof parsed.explanation === "string"
          ? parsed.explanation
          : "",

      actions: Array.isArray(parsed.actions)
        ? parsed.actions.filter(
            (item): item is string =>
              typeof item === "string"
          )
        : [],

      avoid: Array.isArray(parsed.avoid)
        ? parsed.avoid.filter(
            (item): item is string =>
              typeof item === "string"
          )
        : [],

      prevention:
        typeof parsed.prevention === "string"
          ? parsed.prevention
          : "",

      local_context:
        typeof parsed.local_context === "string"
          ? parsed.local_context
          : "",

      language,
    };
  } catch {
    return {
      issue:
        language === "Telugu"
          ? "అంచనా వేయడం సాధ్యం కాలేదు"
          : language === "Hindi"
          ? "स्थिति का निर्धारण नहीं हो सका"
          : "Unable to determine",

      confidence:
        language === "Telugu"
          ? "తక్కువ"
          : language === "Hindi"
          ? "कम"
          : "Low",

      risk:
        language === "Telugu"
          ? "మధ్యస్థ"
          : language === "Hindi"
          ? "मध्यम"
          : "Moderate",

      explanation: text,
      actions: [],
      avoid: [],
      prevention: "",
      local_context: "",
      language,
    };
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const formData =
      await request.formData();

    const crop =
      formData
        .get("crop")
        ?.toString() || "";

    const state =
      formData
        .get("state")
        ?.toString() || "";

    const district =
      formData
        .get("district")
        ?.toString() || "";

    const description =
      formData
        .get("description")
        ?.toString() || "";

    const language =
      formData
        .get("language")
        ?.toString() ||
      "English";

    const image =
      formData.get("image") as File | null;

    if (!crop) {
      return NextResponse.json(
        {
          error:
            "Crop is required.",
        },
        { status: 400 }
      );
    }

    if (
      !image &&
      !description.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide an image or describe the crop problem.",
        },
        { status: 400 }
      );
    }

    const demoMode =
      process.env.DEMO_MODE?.trim() ===
      "true";

    let analysis: AnalysisResult;

    if (demoMode) {
      analysis =
        getLocalizedDemoAnalysis(
          crop,
          state,
          district,
          description,
          language
        );
    } else {
      try {
        analysis =
          await getGeminiAnalysis(
            crop,
            state,
            district,
            description,
            language,
            image
          );
      } catch (error) {
        console.error(
          "Gemini failed:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Gemini analysis failed.",
            geminiFailed: true,
            demoMode: false,
            usedDemoFallback: false,
          },
          { status: 502 }
        );
      }
    }

    const signalRef =
      await addDoc(
        collection(db, "signals"),
        {
          crop,

          state:
            state ||
            "Not provided",

          district:
            district ||
            "Not provided",

          description:
            description || "",

          language,

          issue:
            analysis.issue ||
            "Unable to determine",

          confidence:
            analysis.confidence ||
            "Low",

          risk:
            analysis.risk ||
            "Moderate",

          explanation:
            analysis.explanation ||
            "",

          actions:
            analysis.actions ||
            [],

          avoid:
            analysis.avoid ||
            [],

          prevention:
            analysis.prevention ||
            "",

          local_context:
            analysis.local_context ||
            "",

          createdAt:
            serverTimestamp(),
        }
      );

    const cluster =
      await analyzeSignalCluster({
        crop,

        state:
          state ||
          "Not provided",

        district:
          district ||
          "Not provided",

        issue:
          analysis.issue ||
          "Unable to determine",

        risk:
          analysis.risk ||
          "Moderate",

        signalId:
          signalRef.id,
      });

    return NextResponse.json({
      success: true,

      ...analysis,

      signalId:
        signalRef.id,

      similarSignalCount:
        cluster.similarSignalCount,

      clusterLevel:
        cluster.clusterLevel,

      clusterMessage:
        cluster.clusterMessage,

      regionalSignalCount:
        cluster.regionalSignalCount,

      affectedDistricts:
        cluster.affectedDistricts,

      districtCount:
        cluster.districtCount,

      demoMode,

      usedDemoFallback: false,
    });
  } catch (error) {
    console.error(
      "ANALYZE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze the crop right now. Please try again.",
      },
      { status: 500 }
    );
  }
}