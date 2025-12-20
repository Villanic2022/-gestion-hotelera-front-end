// src/components/Layout.jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
            <Navbar />
            <main style={{ padding: "20px" }}>{children}</main>
        </div>
    );
}
