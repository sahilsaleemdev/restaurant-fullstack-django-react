import { Link } from "react-router-dom";

type Props = {
  title: string;
  onLogout: () => void;
  homeHref?: string;
};

export default function DashboardHeader({ title, onLogout, homeHref = "/" }: Props) {
  return (
    <header className="bg-white text-dark py-3 mb-4 border-bottom">
      <div className="container d-flex justify-content-between align-items-center">
        <h2 className="mb-0">{title}</h2>
        <div className="d-flex align-items-center gap-2">
          <Link to={homeHref} className="btn btn-outline-dark d-flex align-items-center" style={{ height: "38px" }}>
            <span className="me-2" role="img" aria-label="home">
              🏠
            </span>
            Home
          </Link>
          <button className="btn btn-outline-dark" style={{ height: "38px" }} onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

