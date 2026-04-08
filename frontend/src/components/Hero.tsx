import restaurantBg from "../../assets/restuarentbg.mp4";

function Hero() {
  return (
    <div
      className="hero-section position-relative text-center d-flex align-items-center justify-content-center"
      style={{
        minHeight: "75vh",
        height: "100dvh",
        width: "100vw", // Force full viewport width to prevent whitespace
        position: "relative",
        left: 0,
        right: 0,
        overflow: "hidden",
        overflowX: "hidden", // Ensure horizontal overflow is clipped
        margin: 0,
        padding: 0,
      }}
    >
      {/* Background video */}
      <video
        className="hero-bg-video position-absolute top-0 start-0 w-100 h-100"
        src={restaurantBg}
        autoPlay
        loop
        muted
        playsInline
        style={{
          objectFit: "cover",
          zIndex: 0,
          inset: 0,
          display: "block",
          width: "100vw", // Ensure the video covers the viewport width
          minWidth: "100vw",
          height: "100%",
          left: 0,
          top: 0,
        }}
      />
      {/* Content overlay */}
      <div
        className="container px-3 position-relative"
        style={{ zIndex: 1, color: "#fff" }}
      >
        <h1
          className="display-2 mb-4"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,.8)", fontWeight: 900 }}
        >
          Welcome to Our Restaurant
        </h1>

        <p
          className="lead mb-4 fs-3"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.8)" }}
        >
          Fresh food. Fast service. Order directly from your table.
        </p>

        <a
          href="#menu"
          className="btn btn-outline-light btn-lg px-5 py-3 fs-4"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,.7)" }}
        >
          View Menu
        </a>
      </div>
      {/* Overlay to dim video for text readability */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: "rgba(0,0,0,0.38)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default Hero;