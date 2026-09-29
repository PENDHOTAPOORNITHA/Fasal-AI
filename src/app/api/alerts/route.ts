import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function normalizeIssue(issue: string) {
  return String(issue || "")
    .trim()
    .toLowerCase()
    .replace(/[(),.!?;:'"-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
          createdAt,
        };
      })
      .filter((signal) => {
        if (!signal.createdAt) {
          return false;
        }

        const days =
          (now -
            signal.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);

        return days >= 0 && days <= 30;
      });

    /*
     * Alerts intentionally use normalized exact
     * issue grouping rather than fuzzy matching.
     *
     * This prevents unrelated agricultural problems
     * from being merged into one alert merely because
     * they share a common keyword.
     */
    const groups = new Map<
      string,
      typeof recentSignals
    >();

    recentSignals.forEach((signal) => {
      const normalizedIssue =
        normalizeIssue(signal.issue);

      const key =
        `${signal.crop.toLowerCase()}-${signal.state.toLowerCase()}-${normalizedIssue}`;

      const existing =
        groups.get(key) || [];

      existing.push(signal);

      groups.set(key, existing);
    });

    const alerts = Array.from(
      groups.values()
    )
      .filter(
        (group) => group.length >= 3
      )
      .map((group) => {
        const first = group[0];

        const districts =
          Array.from(
            new Set(
              group
                .map(
                  (item) =>
                    item.district
                )
                .filter(Boolean)
            )
          );

        const highRisk =
          group.filter((item) => {
            const score =
              getRiskScore(item.risk);

            return score >= 3;
          }).length;

        const criticalRisk =
          group.filter((item) => {
            return (
              getRiskScore(
                item.risk
              ) >= 4
            );
          }).length;

        let severity = "Moderate";

        if (
          group.length >= 7 ||
          districts.length >= 4 ||
          criticalRisk >= 2 ||
          highRisk >= 3
        ) {
          severity = "High";
        }

        /*
         * Use the newest actual signal timestamp
         * instead of the time this API request happened.
         */
        const latestCreatedAt =
          group.reduce<Date | null>(
            (latest, item) => {
              if (!item.createdAt) {
                return latest;
              }

              if (
                !latest ||
                item.createdAt.getTime() >
                  latest.getTime()
              ) {
                return item.createdAt;
              }

              return latest;
            },
            null
          );

        const normalizedId =
          `${first.crop}-${first.state}-${normalizeIssue(
            first.issue
          )}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(
              /^-+|-+$/g,
              ""
            );

        return {
          id: normalizedId,
          crop: first.crop,
          state: first.state,
          issue: first.issue,
          severity,
          signalCount: group.length,
          districts,
          createdAt:
            latestCreatedAt
              ? latestCreatedAt.toISOString()
              : null,
          message:
            `${group.length} similar observations involving ${first.crop} and ${first.issue} have been detected across ${districts.length} districts.`,
        };
      })
      .sort(
        (a, b) =>
          b.signalCount -
          a.signalCount
      );

    return NextResponse.json({
      success: true,
      alerts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        alerts: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to load alerts.",
      },
      { status: 500 }
    );
  }
}