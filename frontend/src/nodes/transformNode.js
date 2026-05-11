import { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";

export const TransformNode = ({ id, data }) => {
  const [transform, setTransform] = useState(data.transform || "Uppercase");
  const [value, setValue] = useState(data.value || "");  // Add this line
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  useEffect(() => {
    const idNumber = id.split("_").pop();
    if (!node?.data?.name) {
      updateNodeField(id, "name", `transform_${idNumber}`);
    }
    if (!node?.data?.outputs) {
      updateNodeField(id, "outputs", [`transform${idNumber}_output`]);
    }
  }, [id, updateNodeField, node?.data?.name, node?.data?.outputs]);

  return (
    <BaseNode
      id={id}
      title="Transform"
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
        Operation:
        <select
          value={transform}
          onChange={(e) => setTransform(e.target.value)}
        >
          <option value="Uppercase">Uppercase</option>
          <option value="Lowercase">Lowercase</option>
          <option value="Trim">Trim</option>
          <option value="Reverse">Reverse</option>
        </select>
      </label>
      <label>
        Value:
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
    </BaseNode>
  );
};