import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        background: "#f7f5ed",
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "60px",
            marginBottom: "15px",
          }}
        >
          🌱
        </div>

        <h1
          style={{
            color: "#123b2d",
            fontSize: "40px",
          }}
        >
          This field does not exist
        </h1>

        <p
          style={{
            color: "#708078",
            marginBottom: "25px",
          }}
        >
          Let&apos;s get you back to Fasal AI.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "#1f5b45",
            color: "white",
            padding: "13px 20px",
            borderRadius: "999px",
            textDecoration: "none",
          }}
        >
          Back to Fasal AI
        </Link>
      </div>
    </main>
  );
}