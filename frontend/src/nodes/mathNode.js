import { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";

export const MathNode = ({ id, data }) => {
  const [operation, setOperation] = useState(data.operation || "Add");
  const [value, setValue] = useState(data.value || "");  // Add this line
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  useEffect(() => {
    const idNumber = id.split("_").pop();
    if (!node?.data?.name) {
      updateNodeField(id, "name", `math_${idNumber}`);
    }
    if (!node?.data?.outputs) {
      updateNodeField(id, "outputs", [`math${idNumber}_output`]);
    }
  }, [id, updateNodeField, node?.data?.name, node?.data?.outputs]);

  return (
    <BaseNode
      id={id}
      title="Math"
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
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="Add">Add</option>
          <option value="Subtract">Subtract</option>
          <option value="Multiply">Multiply</option>
          <option value="Divide">Divide</option>
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