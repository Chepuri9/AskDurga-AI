import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className=" bg-[#FAFAF3] flex flex-col">
      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 text-center py-3">
        <p>© {new Date().getFullYear()} AskDurga AI — All Rights Reserved</p>
      </footer>
    </div>
  );
}
