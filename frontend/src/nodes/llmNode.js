import { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";

// Available LLM models
const LLM_MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "llama-2-70b", label: "Llama 2 70B" },
  { value: "llama-2-13b", label: "Llama 2 13B" },
  { value: "mistral-large", label: "Mistral Large" },
  { value: "mistral-medium", label: "Mistral Medium" },
  { value: "gemini-pro", label: "Gemini Pro" },
];

export const LLMNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));
  
  const [selectedModel, setSelectedModel] = useState(data.selectedModel || "gpt-4");
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || "");

  useEffect(() => {
    const idNumber = id.split("_").pop();
    if (!node?.data?.name) {
      updateNodeField(id, "name", `llm_${idNumber}`);
    }
    if (!node?.data?.outputs) {
      updateNodeField(id, "outputs", [`llm${idNumber}_output`]);
    }
  }, [id, updateNodeField, node?.data?.name, node?.data?.outputs]);

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    updateNodeField(id, "selectedModel", model);
  };

  const handlePromptChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    updateNodeField(id, "prompt", value);
  };

  const handleSystemPromptChange = (e) => {
    const value = e.target.value;
    setSystemPrompt(value);
    updateNodeField(id, "systemPrompt", value);
  };

  return (
    <BaseNode
      id={id}
      title="LLM"
      handles={[
        {
          type: "target",
          position: Position.Left,
          id: `${id}-input`,
          style: { top: "50%" },
        },
        {
          type: "source",
          position: Position.Right,
          id: `${id}-output`,
          style: { top: "50%" },
        },
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label>
          Model:
          <select value={selectedModel} onChange={handleModelChange}>
            {LLM_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          System Prompt (optional):
          <textarea
            value={systemPrompt}
            onChange={handleSystemPromptChange}
            style={{ minHeight: "60px", resize: "vertical" }}
            placeholder="You are a helpful assistant..."
          />
        </label>

        <label>
          Prompt:
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            style={{ minHeight: "80px", resize: "vertical" }}
            placeholder="Enter your prompt here..."
          />
        </label>

        {prompt && (
          <div style={{ 
            fontSize: "11px", 
            color: "var(--text-secondary)",
            padding: "8px",
            background: "var(--surface-hover)",
            borderRadius: "6px",
            marginTop: "4px"
          }}>
            <strong>Prompt Preview:</strong> {prompt.substring(0, 100)}
            {prompt.length > 100 && "..."}
          </div>
        )}
      </div>
    </BaseNode>
  );
};