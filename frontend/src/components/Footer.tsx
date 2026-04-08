function Footer() {
  return (
    <footer
      className="bg-light text-dark text-center py-5 mt-5"
      style={{
        borderTop: "1px solid #e1e1e1",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="container py-3 px-0">
        <div className="row align-items-center justify-content-between mb-3 mx-0">
          <div className="col-md-4 mb-3 mb-md-0 text-center text-md-start">
            <h5 className="mb-2" style={{ fontWeight: 600 }}>
              🍽 Restaurant Management System
            </h5>
            <p className="mb-1 text-muted" style={{ fontSize: "1rem" }}>
              © 2026 Restaurant Management System
            </p>
            <small className="text-muted">
              Built with React + Django
            </small>
          </div>
          <div className="col-md-4 mb-3 mb-md-0 text-center d-flex flex-column">
            <span className="fw-semibold mb-2">Quick Links</span>
            <div>
              <a href="#menu" className="mx-2 text-decoration-none text-dark">
                Menu
              </a>
              <a href="/login" className="mx-2 text-decoration-none text-dark">
                Staff Login
              </a>
              <a href="/" className="mx-2 text-decoration-none text-dark">
                Home
              </a>
            </div>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <span className="fw-semibold mb-2 d-block">Contact Us</span>
            <div className="d-flex justify-content-center justify-content-md-end gap-3 mb-1" style={{ fontSize: 22 }}>
              <a
                href="mailto:info@restaurant.com"
                className="text-dark"
                aria-label="Email"
                style={{ textDecoration: "none", fontSize: 22 }}
              >
                {/* Envelope icon using Unicode */}
                <span role="img" aria-label="email">✉️</span>
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark"
                aria-label="GitHub"
                style={{ textDecoration: "none", fontSize: 22 }}
              >
                {/* GitHub icon alternative (SVG inline) */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16" style={{ verticalAlign: "middle" }}>
                  <path d="M8 .198a8 8 0 00-2.528 15.59c.4.074.546-.176.546-.39 0-.19-.007-.693-.01-1.36-2.225.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.726-.497.055-.487.055-.487.803.057 1.225.824 1.225.824.714 1.223 1.872.87 2.329.665.073-.517.279-.87.507-1.07-1.777-.2-3.644-.888-3.644-3.95 0-.872.312-1.585.823-2.145-.083-.202-.357-1.018.077-2.122 0 0 .67-.215 2.2.82A7.655 7.655 0 018 4.868c.679.003 1.365.092 2.003.27 1.53-1.035 2.199-.82 2.199-.82.435 1.104.162 1.92.08 2.122.513.56.823 1.273.823 2.145 0 3.07-1.87 3.747-3.65 3.944.287.246.543.734.543 1.48 0 1.07-.009 1.93-.009 2.192 0 .216.145.467.55.39A8 8 0 008.001.196z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark"
                aria-label="LinkedIn"
                style={{ textDecoration: "none", fontSize: 22 }}
              >
                {/* LinkedIn icon alternative (SVG inline) */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16" style={{ verticalAlign: "middle" }}>
                  <path d="M1.146 1.146a.5.5 0 0 1 .708 0l12 12a.5.5 0 0 1-.708.708l-12-12a.5.5 0 0 1 0-.708z"/>
                  <path d="M15.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 .5 2h15zm-12.174 2.633c0 .51.416.924.925.924.509 0 .924-.415.924-.924 0-.51-.415-.925-.924-.925a.924.924 0 0 0-.925.925zm.049 2.255a.219.219 0 0 1 .219-.219h1.379a.219.219 0 0 1 .219.219v5.385a.219.219 0 0 1-.219.218H3.594a.219.219 0 0 1-.219-.218v-5.385zm3.327.21c.01-.069.025-.138.042-.205.165-.646.573-1.121 1.347-1.121.751 0 1.145.43 1.307 1.053.047.166.059.344.059.576v3.774a.22.22 0 0 1-.219.219H8.221a.219.219 0 0 1-.219-.219v-3.453c0-.384-.137-.646-.483-.646-.368 0-.522.271-.522.684v3.415a.219.219 0 0 1-.219.218H6.017a.219.219 0 0 1-.219-.218V6.834z"/>
                </svg>
              </a>
            </div>
            <small className="text-muted">info@restaurant.com</small>
          </div>
        </div>
        <hr className="my-3" style={{ opacity: 0.2 }} />
        <div className="text-center">
          <small className="text-muted">
            Made with ❤️ | All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;