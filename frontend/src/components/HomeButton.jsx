// Reusable "Home" button for auth pages
import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";

export default function HomeButton({ position = "fixed" }) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-900 hover:text-white shadow-sm transition"
            style={{ position, top: 16, left: 16, zIndex: 50 }}
            aria-label="Go to home"
        >
            <FiHome className="text-lg" />
            <span className="hidden sm:inline">Home</span>
        </button>
    );
}
