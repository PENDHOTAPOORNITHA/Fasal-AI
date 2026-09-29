import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function getRiskScore(risk: string) {
  const value = String(risk || "")
    .trim()
    .toLowerCase();

  if (value.includes("critical")) return 4;
  if (value.includes("high")) return 3;
  if (value.includes("moderate")) return 2;

  return 1;
}

export async function GET() {
  try {
    const signalsRef = collection(db, "signals");

    const q = query(
      signalsRef,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const now = Date.now();

    const recentSignals = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        const createdAt =
          data.createdAt?.toDate?.() || null;

        return {
          id: doc.id,
          crop: String(data.crop || ""),
          state: String(data.state || ""),
          district: String(
            data.district || ""
          ),
          issue: String(data.issue || ""),
          risk: String(
            data.risk || "Moderate"
          ),
          createdAt: createdAt
            ? createdAt.toISOString()
            : null,
          timestamp: createdAt
            ? createdAt.getTime()
            : 0,
        };
      })
      .filter((signal) => {
        if (!signal.timestamp) {
          return false;
        }

        const daysOld =
          (now - signal.timestamp) /
          (1000 * 60 * 60 * 24);

        return daysOld >= 0 && daysOld <= 30;
      });

    const districtMap = new Map<
      string,
      {
        district: string;
        state: string;
        count: number;
        riskScore: number;
        crops: string[];
        issues: string[];
      }
    >();

    recentSignals.forEach((signal) => {
      const key =
        `${signal.district}-${signal.state}`;

      const existing =
        districtMap.get(key);

      if (existing) {
        existing.count += 1;

        existing.riskScore += getRiskScore(
          signal.risk
        );

        if (
          signal.crop &&
          !existing.crops.includes(
            signal.crop
          )
        ) {
          existing.crops.push(
            signal.crop
          );
        }

        if (
          signal.issue &&
          !existing.issues.includes(
            signal.issue
          )
        ) {
          existing.issues.push(
            signal.issue
          );
        }
      } else {
        districtMap.set(key, {
          district: signal.district,
          state: signal.state,
          count: 1,
          riskScore:
            getRiskScore(signal.risk),
          crops: signal.crop
            ? [signal.crop]
            : [],
          issues: signal.issue
            ? [signal.issue]
            : [],
        });
      }
    });

    const hotspots = Array.from(
      districtMap.values()
    )
      .map((item) => {
        const averageRisk =
          item.riskScore /
          Math.max(item.count, 1);

        let level = "Low";

        if (
          item.count >= 6 ||
          averageRisk >= 3
        ) {
          level = "High";
        } else if (
          item.count >= 3 ||
          averageRisk >= 2
        ) {
          level = "Moderate";
        }

        return {
          ...item,
          level,
          averageRisk:
            Math.round(
              averageRisk * 100
            ) / 100,
          score:
            Math.round(
              (
                item.count * 12 +
                averageRisk * 20
              ) * 10
            ) / 10,
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score
      );

    return NextResponse.json({
      success: true,
      hotspots,
      totalSignals:
        recentSignals.length,
      totalDistricts:
        districtMap.size,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        hotspots: [],
        totalSignals: 0,
        totalDistricts: 0,
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate radar.",
      },
      { status: 500 }
    );
  }
}