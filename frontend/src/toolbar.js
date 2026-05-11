// toolbar.js
import { useState, useEffect } from "react";
import { DraggableNode } from "./draggableNode";
import { useStore } from "./store";

export const PipelineToolbar = () => {
  const save = useStore((s) => s.save);
  const reset = useStore((s) => s.reset);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const theme = useStore((s) => s.theme);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const historyIndex = useStore((s) => s.historyIndex);
  const history = useStore((s) => s.history);
  
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleSave = () => {
    save();
    setShowSaveModal(true);
  };

  const handleReset = () => {
    reset();
    setShowResetModal(true);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const categories = {
    General: [
      { type: "customInput", label: "Input" },
      { type: "customOutput", label: "Output" },
      { type: "llm", label: "LLM" },
    ],
    Logic: [
      { type: "math", label: "Math" },
      { type: "condition", label: "Condition" },
      { type: "transform", label: "Transform" },
    ],
    Utility: [
      { type: "text", label: "Text" },
      { type: "api", label: "API" },
    ],
  };

  const containerStyle = {
    padding: "12px 24px",
    background: "var(--bg-color)",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 4px 15px var(--shadow-color)",
  };

  const navStyle = {
    display: "flex",
    background: "var(--surface-color)",
    borderRadius: "10px",
    padding: "4px",
    gap: "4px",
    border: "1px solid var(--border-color)",
  };

  const getTabStyle = (category) => ({
    padding: "6px 16px",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color:
      selectedCategory === category
        ? "#fff"
        : "var(--text-secondary)",
    background:
      selectedCategory === category ? "var(--primary-color)" : "transparent",
    border: "none",
  });

  // Smaller button style for undo/redo
  const smallButtonStyle = {
    background: "var(--surface-color)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  // Smaller button style for Reset and Save
  const actionButtonStyle = {
    padding: "6px 16px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textTransform: "uppercase",
    letterSpacing: "1px",
    border: "none",
  };

  return (
    <div style={containerStyle}>
      <h2
        style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: "800",
          color: "var(--text-primary)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Nodes
      </h2>

      <div style={navStyle}>
        {Object.keys(categories).map((cat) => (
          <button
            key={cat}
            style={getTabStyle(cat)}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flex: 1,
          overflowX: "auto",
          padding: "4px 0",
        }}
      >
        {categories[selectedCategory].map((node) => (
          <DraggableNode key={node.type} type={node.type} label={node.label} />
        ))}
      </div>

      {/* Undo/Redo buttons */}
      <div style={{ display: "flex", gap: "6px", marginRight: "12px" }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          style={{
            ...smallButtonStyle,
            opacity: canUndo ? 1 : 0.5,
            cursor: canUndo ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(e) => {
            if (canUndo) {
              e.target.style.background = "var(--surface-hover)";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--surface-color)";
            e.target.style.transform = "translateY(0)";
          }}
          title="Undo (Ctrl+Z)"
        >
          ↩️ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          style={{
            ...smallButtonStyle,
            opacity: canRedo ? 1 : 0.5,
            cursor: canRedo ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(e) => {
            if (canRedo) {
              e.target.style.background = "var(--surface-hover)";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--surface-color)";
            e.target.style.transform = "translateY(0)";
          }}
          title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        >
          ↪️ Redo
        </button>
      </div>

      {/* Reset button - now before Save */}
      <button
        onClick={handleReset}
        style={{
          ...actionButtonStyle,
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          color: "white",
          boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
          marginRight: "8px",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.3)";
        }}
        title="Clear all nodes and reset the pipeline"
      >
        Reset
      </button>

      {/* Save button */}
      <button
        onClick={handleSave}
        style={{
          ...actionButtonStyle,
          background: "var(--primary-gradient)",
          color: "white",
          boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)",
          marginRight: "12px",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 15px rgba(79, 70, 229, 0.3)";
        }}
      >
        Save
      </button>

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        style={{
          background: "var(--surface-color)",
          border: "1px solid var(--border-color)",
          color: "var(--text-primary)",
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "18px",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 5px var(--shadow-color)",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "var(--surface-hover)";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "var(--surface-color)";
          e.target.style.transform = "scale(1)";
        }}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </button>

      {showSaveModal && (
        <div
          style={{
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
          }}
          onClick={() => setShowSaveModal(false)}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "24px",
              padding: "40px",
              width: "300px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              color: "#f1f5f9",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "rgba(74, 222, 128, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                border: "2px solid rgba(74, 222, 128, 0.2)",
              }}
            >
              <span style={{ fontSize: "32px" }}>💾</span>
            </div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "20px",
                fontWeight: "800",
              }}
            >
              Saved!
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              Your pipeline has been successfully persisted.
            </p>
            <button
              onClick={() => setShowSaveModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(to right, #4f46e5, #9333ea)",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                textTransform: "uppercase",
              }}
            >
              Great
            </button>
          </div>
        </div>
      )}

      {showResetModal && (
        <div
          style={{
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
          }}
          onClick={() => setShowResetModal(false)}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "24px",
              padding: "40px",
              width: "320px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              color: "#f1f5f9",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                border: "2px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <span style={{ fontSize: "32px" }}>🔄</span>
            </div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "20px",
                fontWeight: "800",
              }}
            >
              Pipeline Reset
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              All nodes and connections have been cleared. Your pipeline is ready for a fresh start.
            </p>
            <button
              onClick={() => setShowResetModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(to right, #ef4444, #dc2626)",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                textTransform: "uppercase",
              }}
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}
    </div>
  );
};