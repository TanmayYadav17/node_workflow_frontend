import { useState, useEffect } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";

export const ConditionNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data.condition || "Equals");
  const [value, setValue] = useState(data.value || "");
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  useEffect(() => {
    const idNumber = id.split("_").pop();
    if (!node?.data?.name) {
      updateNodeField(id, "name", `condition_${idNumber}`);
    }
    if (!node?.data?.outputs) {
      updateNodeField(id, "outputs", [`condition${idNumber}_output`]);
    }
  }, [id, updateNodeField, node?.data?.name, node?.data?.outputs]);

  return (
    <BaseNode
      id={id}
      title="Condition"
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
        Condition:
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="Equals">==</option>
          <option value="NotEquals">!=</option>
          <option value="GreaterThan">&gt;</option>
          <option value="LessThan">&lt;</option>
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
