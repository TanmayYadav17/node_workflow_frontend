import { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";

export const OutputNode = ({ id, data }) => {
  const [outputType, setOutputType] = useState(data.outputType || "Text");
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  useEffect(() => {
    if (!node?.data?.name) {
      const idNumber = id.split("_").pop();
      updateNodeField(id, "name", `output_${idNumber}`);
    }
  }, [id, updateNodeField, node?.data?.name]);

  const handleTypeChange = (e) => setOutputType(e.target.value);

  return (
    <BaseNode
      id={id}
      title="Output"
      noOutputs={true}
      handles={[
        {
          type: "target",
          position: Position.Left,
          id: `${id}-value`,
          style: { top: "50%" },
        },
      ]}
    >
      <label>
        Type:
        <select value={outputType} onChange={handleTypeChange}>
          <option value="Text">Text</option>
          <option value="Image">Image</option>
        </select>
      </label>
    </BaseNode>
  );
};
