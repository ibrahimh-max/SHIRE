import Image from "next/image";

export default function HomePage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>SHIRE Hospitality Hiring Platform</h1>

      <p>
        Connect hospitality businesses with skilled workers quickly.
      </p>

      <div style={{ marginTop: "20px" }}>
        <a href="/jobs">
          <button style={{ marginRight: "10px" }}>
            Browse Jobs
          </button>
        </a>

        <a href="/signup">
          <button>
            Get Started
          </button>
        </a>
      </div>
    </main>
  );
}

