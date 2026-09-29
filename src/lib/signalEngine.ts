import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type SignalInput = {
  crop: string;
  state: string;
  district: string;
  issue: string;
  risk: string;
  signalId?: string;
};

function getKeywords(issue: string) {
  return issue
    .toLowerCase()
    .replace(/[(),.!?-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          "likely",
          "possible",
          "condition",
          "problem",
          "issue",
          "stress",
          "deficiency",
          "plant",
          "crop",
          "affected",
          "damage",
          "disease",
        ].includes(word)
    );
}

function isSimilarIssue(issue1: string, issue2: string) {
  const words1 = getKeywords(issue1);
  const words2 = getKeywords(issue2);

  if (!words1.length || !words2.length) {
    return (
      issue1.trim().toLowerCase() ===
      issue2.trim().toLowerCase()
    );
  }

  const matches = words1.filter((word) =>
    words2.includes(word)
  );

  return matches.length >= 1;
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

export async function analyzeSignalCluster(
  signal: SignalInput
) {
  const signalsRef = collection(db, "signals");

  const q = query(
    signalsRef,
    where("crop", "==", signal.crop),
    where("state", "==", signal.state)
  );

  const snapshot = await getDocs(q);

  const currentTime = Date.now();

  const recentSignals = snapshot.docs.filter((doc) => {
    const data = doc.data();

    if (
      signal.signalId &&
      doc.id === signal.signalId
    ) {
      return false;
    }

    const createdAt = data.createdAt?.toDate?.();

    if (!createdAt) {
      return false;
    }

    const daysOld =
      (currentTime - createdAt.getTime()) /
      (1000 * 60 * 60 * 24);

    return daysOld >= 0 && daysOld <= 30;
  });

  const regionalSignals = recentSignals.filter(
    (doc) => {
      return isSimilarIssue(
        String(doc.data().issue || ""),
        signal.issue
      );
    }
  );

  const similarSignals = regionalSignals.filter(
    (doc) => {
      return (
        String(doc.data().district || "") ===
        signal.district
      );
    }
  );

  const affectedDistricts = Array.from(
    new Set(
      regionalSignals
        .map((doc) =>
          String(doc.data().district || "")
        )
        .filter(Boolean)
    )
  );

  if (
    signal.district &&
    !affectedDistricts.includes(signal.district)
  ) {
    affectedDistricts.push(signal.district);
  }

  const similarSignalCount =
    similarSignals.length;

  const regionalSignalCount =
    regionalSignals.length;

  const districtCount =
    affectedDistricts.length;

  const currentRisk = getRiskScore(
    signal.risk
  );

  const totalRisk =
    regionalSignals.reduce(
      (total, doc) =>
        total +
        getRiskScore(
          String(
            doc.data().risk || "Moderate"
          )
        ),
      currentRisk
    );

  const totalSignalCount =
    regionalSignalCount + 1;

  const averageRisk =
    totalRisk /
    Math.max(totalSignalCount, 1);

  let clusterLevel = "None";

  let clusterMessage =
    "No significant regional pattern has been detected yet.";

  if (
    regionalSignalCount >= 7 ||
    districtCount >= 4 ||
    averageRisk >= 2.7
  ) {
    clusterLevel = "High";

    clusterMessage =
      `A strong regional pattern has been detected across ${districtCount} districts. ${regionalSignalCount} similar observations were identified in the last 30 days. Farmers in surrounding areas should monitor crops closely.`;
  } else if (
    regionalSignalCount >= 4 ||
    districtCount >= 3
  ) {
    clusterLevel = "Moderate";

    clusterMessage =
      `An emerging regional agricultural pattern has been detected across ${districtCount} districts. ${regionalSignalCount} similar observations were reported recently.`;
  } else if (
    regionalSignalCount >= 2 ||
    districtCount >= 2
  ) {
    clusterLevel = "Low";

    clusterMessage =
      `A small regional pattern has been detected across ${districtCount} districts. Continued monitoring is recommended.`;
  }

  return {
    similarSignalCount,
    regionalSignalCount,
    affectedDistricts,
    districtCount,
    clusterLevel,
    clusterMessage,
    averageRisk,
  };
}