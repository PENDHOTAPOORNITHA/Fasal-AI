"use client";

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}) {
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
        <div style={{ fontSize: "55px" }}>
          ⚠️
        </div>

        <h1
          style={{
            color: "#123b2d",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: "#708078",
          }}
        >
          Fasal AI could not complete this request.
        </p>

        <button
          onClick={() => reset()}
          style={{
            border: "none",
            background: "#1f5b45",
            color: "white",
            padding: "13px 20px",
            borderRadius: "999px",
            marginTop: "15px",
          }}
        >
          Try again
        </button>
      </div>
    </main>
  );
}