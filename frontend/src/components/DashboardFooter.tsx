export default function DashboardFooter() {
  return (
    <footer className="bg-light py-3 mt-5 border-top">
      <div className="container text-center text-muted">
        &copy; {new Date().getFullYear()} Restaurant App &mdash; All rights reserved
      </div>
    </footer>
  );
}

