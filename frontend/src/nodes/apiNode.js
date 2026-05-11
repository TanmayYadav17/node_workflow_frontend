import { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";

export const APINode = ({ id, data }) => {
  const [url, setUrl] = useState(data.url || "https://api.example.com");
  const [method, setMethod] = useState(data.method || "GET");
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  useEffect(() => {
    const idNumber = id.split("_").pop();
    if (!node?.data?.name) {
      updateNodeField(id, "name", `api_${idNumber}`);
    }
    if (!node?.data?.outputs) {
      updateNodeField(id, "outputs", [`api${idNumber}_output`]);
    }
  }, [id, updateNodeField, node?.data?.name, node?.data?.outputs]);

  return (
    <BaseNode
      id={id}
      title="API Request"
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
      <label>
        Method:
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>
      <label>
        URL:
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
    </BaseNode>
  );
};
