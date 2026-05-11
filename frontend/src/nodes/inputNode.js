import { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";

export const InputNode = ({ id, data }) => {
  const idNumber = id.split("_").pop();
  const defaultNodeName = `input_${idNumber}`;
  const defaultOutputName = `input${idNumber}_output`;

  const [inputType, setInputType] = useState(data.inputType || "Text");
  const [inputValue, setInputValue] = useState("");
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  // Initialize store fields on mount
  useEffect(() => {
    if (!node?.data?.name) {
      updateNodeField(id, "name", defaultNodeName);
    }
    if (!node?.data?.outputs) {
      updateNodeField(id, "outputs", [defaultOutputName]);
    }
  }, [
    id,
    updateNodeField,
    node?.data?.name,
    node?.data?.outputs,
    defaultNodeName,
    defaultOutputName,
  ]);

  const handleTypeChange = (e) => {
    setInputType(e.target.value);
    setInputValue("");
  };

  return (
    <BaseNode id={id} title="Input">
      <label>
        Type:
        <select value={inputType} onChange={handleTypeChange}>
          <option value="Text">Text</option>
          <option value="File">File</option>
        </select>
      </label>

      {/* ── Give them a place to put the actual Text or File! ── */}
      {inputType === "Text" ? (
        <label>
          Default Text:
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ minHeight: "60px", resize: "vertical" }}
            placeholder="Enter text..."
          />
        </label>
      ) : (
        <label>
          Upload File:
          <input
            type="file"
            onChange={(e) => setInputValue(e.target.value)}
            style={{ fontSize: "11px", padding: "6px" }}
          />
        </label>
      )}
    </BaseNode>
  );
};
