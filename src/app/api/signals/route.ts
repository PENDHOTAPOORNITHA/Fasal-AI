import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function normalizeRisk(risk: string) {
  return String(risk || "Moderate").trim().toLowerCase();
}

function isHighRisk(risk: string) {
  const value = normalizeRisk(risk);

  return value === "high" || value === "critical";
}

export async function GET() {
  try {
    const signalsRef = collection(db, "signals");

    const signalsQuery = query(
      signalsRef,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(signalsQuery);

    const signals = snapshot.docs.map((doc) => {
      const data = doc.data();

      const createdAt = data.createdAt?.toDate?.() || null;

      return {
        id: doc.id,
        crop: String(data.crop || ""),
        state: String(data.state || ""),
        district: String(data.district || ""),
        description: String(data.description || ""),
        issue: String(data.issue || ""),
        risk: String(data.risk || "Moderate"),
        confidence: String(data.confidence || ""),
        language: String(data.language || "English"),
        createdAt: createdAt
          ? createdAt.toISOString()
          : null,
      };
    });

    const totalSignals = signals.length;

    const highRiskSignals = signals.filter((signal) =>
      isHighRisk(signal.risk)
    ).length;

    const districts = Array.from(
      new Set(
        signals
          .map((signal) => signal.district)
          .filter(Boolean)
      )
    );

    const crops = Array.from(
      new Set(
        signals
          .map((signal) => signal.crop)
          .filter(Boolean)
      )
    );

    return NextResponse.json({
      success: true,
      signals,
      stats: {
        totalSignals,
        highRiskSignals,
        districts: districts.length,
        crops: crops.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        signals: [],
        stats: {
          totalSignals: 0,
          highRiskSignals: 0,
          districts: 0,
          crops: 0,
        },
        error:
          error instanceof Error
            ? error.message
            : "Unable to load signals.",
      },
      { status: 500 }
    );
  }
}