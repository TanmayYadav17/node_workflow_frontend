import React, { useState } from "react";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [modalData, setModalData] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/pipelines/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setModalData(data);
    } catch (error) {
      alert(`Error submitting pipeline: ${error.message}`);
    }
  };

  const modalBackdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
  };

  const modalContentStyle = {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "24px",
    padding: "40px",
    width: "360px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    color: "#f1f5f9",
    textAlign: "center",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const statCardStyle = {
    background: "#0f172a",
    borderRadius: "16px",
    padding: "16px",
    width: "100%",
    margin: "8px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #1e293b",
  };

  const closeBtnStyle = {
    marginTop: "24px",
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(to right, #4f46e5, #9333ea)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 2000,
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            background: "linear-gradient(135deg, #4f46e5, #9333ea)",
            color: "white",
            border: "none",
            padding: "14px 40px",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(79, 70, 229, 0.4)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-4px) scale(1.02)";
            e.target.style.boxShadow = "0 15px 35px rgba(79, 70, 229, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 10px 30px rgba(79, 70, 229, 0.4)";
          }}
        >
          SUBMIT
        </button>
      </div>

      {modalData && (
        <div style={modalBackdropStyle} onClick={() => setModalData(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                border: "2px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <span style={{ fontSize: "32px" }}>📊</span>
            </div>

            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "22px",
                fontWeight: "800",
              }}
            >
              Pipeline Summary
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              Analysis results for your current flow
            </p>

            <div style={statCardStyle}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ opacity: 0.7 }}>📦</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#94a3b8",
                  }}
                >
                  NODES
                </span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                {modalData.num_nodes}
              </span>
            </div>

            <div style={statCardStyle}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ opacity: 0.7 }}>🔗</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#94a3b8",
                  }}
                >
                  EDGES
                </span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                {modalData.num_edges}
              </span>
            </div>

            <div
              style={{
                ...statCardStyle,
                border: `1px solid ${modalData.is_dag ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)"}`,
                background: modalData.is_dag
                  ? "rgba(74, 222, 128, 0.05)"
                  : "rgba(248, 113, 113, 0.05)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ opacity: 0.7 }}>
                  {modalData.is_dag ? "✅" : "❌"}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#94a3b8",
                  }}
                >
                  IS DAG
                </span>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  color: modalData.is_dag ? "#4ade80" : "#f87171",
                }}
              >
                {modalData.is_dag ? "YES" : "NO"}
              </span>
            </div>

            <button
              onClick={() => setModalData(null)}
              style={closeBtnStyle}
              onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
