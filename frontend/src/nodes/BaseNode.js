import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { useStore } from "../store";
import "./BaseNode.css";

export const BaseNode = ({
  id,
  title,
  children,
  handles,
  nodeRef,
  noOutputs,
}) => {
  const deleteNode = useStore((s) => s.deleteNode);
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  const idNumber = id.split("_").pop();
  const defaultOutputName = `${title.toLowerCase()}${idNumber}_output`;
  const outputs = node?.data?.outputs || [defaultOutputName];
  const name = node?.data?.name || id;

  const handleOutputChange = (index, val) => {
    const newOutputs = [...outputs];
    newOutputs[index] = val;
    updateNodeField(id, "outputs", newOutputs);
  };

  const handleNameChange = (e) => {
    updateNodeField(id, "name", e.target.value);
  };

  const addOutput = () => {
    updateNodeField(id, "outputs", [
      ...outputs,
      `output_${outputs.length + 1}`,
    ]);
  };

  const removeOutput = (index) => {
    updateNodeField(
      id,
      "outputs",
      outputs.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="base-node" ref={nodeRef}>
      <div className="base-node-header">
        <span>{title}</span>
        <button
          className="delete-node-btn"
          onClick={() => deleteNode(id)}
          title="Delete Node"
        >
          ×
        </button>
      </div>
      <div className="base-node-content">
        <label>
          Name:
          <input type="text" value={name} onChange={handleNameChange} />
        </label>
        {children}

        {/* Dynamic Outputs Section — hidden for terminal nodes like Output */}
        {!noOutputs && (
          <div
            className="node-outputs-section"
            style={{
              marginTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <label style={{ margin: 0 }}>Outputs:</label>
              <button
                onClick={addOutput}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a78bfa",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                +
              </button>
            </div>
            {outputs.map((out, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: "4px", marginBottom: "4px" }}
              >
                <input
                  type="text"
                  value={out}
                  onChange={(e) => handleOutputChange(i, e.target.value)}
                  style={{ flex: 1, padding: "4px 6px", fontSize: "11px" }}
                />
                <button
                  onClick={() => removeOutput(i)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Render ALL child-provided handles */}
      {handles &&
        handles.map((h, i) => (
          <Handle
            key={`${id}-child-handle-${i}`}
            type={h.type}
            position={h.position}
            id={h.id}
            style={h.style}
          />
        ))}

      {/* Render the dynamic output handles (only when outputs section is active and child didn't provide source handles) */}
      {!noOutputs &&
        !(handles && handles.some((h) => h.type === "source")) &&
        outputs.length > 0 && (
          <Handle
            key={`${id}-out-single`}
            type="source"
            position={Position.Right}
            id={`${id}-${outputs[0]}`}
            style={{ top: "50%" }}
          />
        )}
    </div>
  );
};
