import { useState, useEffect, useRef } from "react";
import { BaseNode } from "./BaseNode";
import { Position } from "reactflow";
import { useStore } from "../store";
import { Editor, EditorState, CompositeDecorator, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";

const MIN_WIDTH = 250;
const MAX_WIDTH = 600;

// Decorator component to render the chip (Entities)
const VariableChip = (props) => {
  const { label } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <span
      className="variable-pill"
      style={{
        backgroundColor: "var(--pill-bg)",
        borderRadius: "6px",
        color: "var(--pill-color)",
        fontWeight: 600,
        padding: "2px 8px",
        margin: "0 2px",
        display: "inline-block",
        border: "1px solid var(--pill-border)",
        userSelect: "none",
      }}
      contentEditable={false}
    >
      {label}
    </span>
  );
};

const findVariableEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "VARIABLE"
    );
  }, callback);
};

const decorator = new CompositeDecorator([
  {
    strategy: findVariableEntities,
    component: VariableChip,
  },
]);

export const TextNode = ({ id, data }) => {
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      EditorState.createEmpty().getCurrentContent(),
      decorator,
    ),
  );
  const [dimensions, setDimensions] = useState({
    width: MIN_WIDTH,
    height: 80,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [filterText, setFilterText] = useState("");

  const editorRef = useRef(null);
  const rulerRef = useRef(null);
  const nodes = useStore((s) => s.nodes);
  const updateNodeField = useStore((s) => s.updateNodeField);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

  // Initialize store fields on mount
  useEffect(() => {
    const idNumber = id.split("_").pop();
    if (!node?.data?.name) {
      updateNodeField(id, "name", `text_${idNumber}`);
    }
    if (!node?.data?.outputs) {
      updateNodeField(id, "outputs", [`text${idNumber}_output`]);
    }
  }, [id, updateNodeField, node?.data?.name, node?.data?.outputs]);

  const currText = editorState.getCurrentContent().getPlainText();

  // Extract variables from entities for handles
  const variables = [];
  editorState
    .getCurrentContent()
    .getBlockMap()
    .forEach((block) => {
      block.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null &&
            editorState.getCurrentContent().getEntity(entityKey).getType() ===
            "VARIABLE"
          );
        },
        (start, end) => {
          const entityKey = block.getEntityAt(start);
          const { label } = editorState
            .getCurrentContent()
            .getEntity(entityKey)
            .getData();
          variables.push(label);
        },
      );
    });
  const uniqueVariables = [...new Set(variables)];

  // Auto-resize logic
  useEffect(() => {
    if (!rulerRef.current) return;
    const longestLine = currText
      .split("\n")
      .reduce((a, b) => (a.length >= b.length ? a : b), "");
    rulerRef.current.textContent = longestLine || "W";
    const textWidth = rulerRef.current.getBoundingClientRect().width;
    const newWidth = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, Math.ceil(textWidth) + 64),
    );
    setDimensions((prev) => ({ ...prev, width: newWidth }));
  }, [currText]);

  const updateDropdownPosition = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);

    const rect = range.getBoundingClientRect();

    const parentRect =
      editorRef.current?.editor?.getBoundingClientRect();

    if (!parentRect) return;

    setDropdownPos({
      top: rect.top - parentRect.top + 24,
      left: rect.left - parentRect.left,
    });
  };

  const onChange = (newEditorState) => {
    let finalEditorState = newEditorState;
    const content = finalEditorState.getCurrentContent();
    const selection = finalEditorState.getSelection();

    // 1. AUTO-CONVERT: Look for completed {{var}} patterns to turn into chips
    if (selection.isCollapsed()) {
      const anchorKey = selection.getAnchorKey();
      const currentBlock = content.getBlockForKey(anchorKey);
      const text = currentBlock.getText();
      const offset = selection.getAnchorOffset();

      const textBefore = text.slice(0, offset);
      const autoMatch = textBefore.match(/\{\{\s*([a-zA-Z0-9_$]+)\s*\}\}$/);

      if (autoMatch) {
        const varName = autoMatch[1];
        const matchLength = autoMatch[0].length;
        const start = offset - matchLength;

        // Create Entity
        const contentWithEntity = content.createEntity("VARIABLE", "IMMUTABLE", {
          label: varName,
        });
        const entityKey = contentWithEntity.getLastCreatedEntityKey();

        // Replace the {{var}} text with the entity chip
        const replacedContent = Modifier.replaceText(
          contentWithEntity,
          selection.merge({ anchorOffset: start, focusOffset: offset }),
          varName,
          null,
          entityKey,
        );

        // Add a space after for better typing flow
        const withSpace = Modifier.insertText(
          replacedContent,
          replacedContent.getSelectionAfter(),
          " ",
        );

        const stateWithChip = EditorState.push(
          finalEditorState,
          withSpace,
          "insert-characters",
        );
        finalEditorState = EditorState.forceSelection(
          stateWithChip,
          withSpace.getSelectionAfter(),
        );
      }
    }

    setEditorState(finalEditorState);

    // =========================
    // 🔁 SYNC VARIABLES (Extract handles)
    // =========================
    const updatedContent = finalEditorState.getCurrentContent();
    const newVariables = [];

    updatedContent.getBlockMap().forEach((block) => {
      // Extract from Entities (Both dropdown and auto-converted)
      block.findEntityRanges(
        (char) => {
          const key = char.getEntity();
          return (
            key !== null && updatedContent.getEntity(key).getType() === "VARIABLE"
          );
        },
        (start) => {
          const key = block.getEntityAt(start);
          const { label } = updatedContent.getEntity(key).getData();
          newVariables.push(label);
        },
      );
    });

    // Extract from remaining manual braces (if any are being typed)
    const plainText = updatedContent.getPlainText();
    const manualMatches = plainText.matchAll(/\{\{\s*([a-zA-Z0-9_$]+)\s*\}\}/g);
    for (const match of manualMatches) {
      newVariables.push(match[1]);
    }

    const uniqueVars = [...new Set(newVariables)];

    // Update global store
    const nodes = useStore.getState().nodes;
    const nodeIndex = nodes.findIndex((n) => n.id === id);
    if (nodeIndex !== -1) {
      const updatedNodes = [...nodes];
      updatedNodes[nodeIndex] = {
        ...updatedNodes[nodeIndex],
        data: {
          ...updatedNodes[nodeIndex].data,
          text: plainText,
          variables: uniqueVars,
        },
      };
      useStore.setState({ nodes: updatedNodes });
    }

    // =========================
    // ✨ AUTOCOMPLETE DETECTION (Dropdown trigger)
    // =========================
    const finalSelection = finalEditorState.getSelection();
    if (!finalSelection.isCollapsed()) {
      setShowDropdown(false);
      return;
    }

    const finalBlock = updatedContent.getBlockForKey(finalSelection.getAnchorKey());
    const finalText = finalBlock.getText();
    const finalOffset = finalSelection.getAnchorOffset();
    const textTillCursor = finalText.slice(0, finalOffset);

    const dropdownMatch = textTillCursor.match(/\{\{\s*([a-zA-Z0-9_$]*)$/);

    if (dropdownMatch) {
      setShowDropdown(true);
      setFilterText(dropdownMatch[1]);
      setTimeout(updateDropdownPosition, 0);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();

    const blockKey = selection.getAnchorKey();
    const block = content.getBlockForKey(blockKey);
    const text = block.getText();

    const offset = selection.getAnchorOffset();
    const textBefore = text.slice(0, offset);

    const start = textBefore.lastIndexOf("{{");

    if (start === -1 || start >= offset) return;

    const targetRange = selection.merge({
      anchorOffset: start,
      focusOffset: offset,
    });

    // create entity
    const contentWithEntity = content.createEntity(
      "VARIABLE",
      "IMMUTABLE",
      { label: suggestion },
    );

    const entityKey = contentWithEntity.getLastCreatedEntityKey();

    // replace {{... with entity
    let newContent = Modifier.replaceText(
      contentWithEntity,
      targetRange,
      suggestion,
      null,
      entityKey,
    );

    // add extra space after (to prevent consecutive overlap)
    newContent = Modifier.insertText(
      newContent,
      newContent.getSelectionAfter(),
      " ",
    );

    const newState = EditorState.push(
      editorState,
      newContent,
      "insert-fragment",
    );

    // ⚡ DOUBLE-SNAP: Force selection immediately AND after a micro-timeout
    // This forces the browser to repaint the "leaf" and clears ghost characters.
    const snapState = EditorState.forceSelection(
      newState,
      newContent.getSelectionAfter(),
    );

    setEditorState(snapState);

    setShowDropdown(false);

    // Final DOM sync to kill lazy-repaint ghosts
    setTimeout(() => {
      setEditorState(
        EditorState.forceSelection(snapState, snapState.getSelection()),
      );
      editorRef.current.focus();
    }, 20);
  };

  const suggestions = nodes
    .filter((n) => n.id !== id && n.type !== "customOutput")
    .flatMap((n) => {
      if (n.data?.outputs) return n.data.outputs;
      // Fallback matching BaseNode's logic
      const idNumber = n.id.split("_").pop();
      const title = n.type
        .replace("custom", "")
        .replace("Node", "")
        .toLowerCase();
      return [`${title}${idNumber}_output`];
    })
    .filter((name) => name.toLowerCase().includes(filterText.toLowerCase()));

  const uniqueSuggestions = [...new Set(suggestions)];

  const handles = [
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
  ];

  return (
    <BaseNode id={id} title="Text" handles={handles}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: `${dimensions.width}px`,
          minHeight: "100px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
            CONTENT
          </label>
          <span
            ref={rulerRef}
            style={{
              position: "fixed",
              top: -9999,
              visibility: "hidden",
              whiteSpace: "pre",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "13px",
            }}
          />
        </div>

        <div
          className="nodrag"
          onClick={() => editorRef.current.focus()}
          style={{
            background: "var(--surface-hover)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "12px",
            cursor: "text",
            minHeight: "60px",
            color: "var(--text-primary)",
            fontSize: "13px",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            position: "relative",
          }}
        >
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={onChange}
            placeholder="Type '{{' to add variables..."
          />

          {showDropdown && uniqueSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: `${dropdownPos.top}px`,
                left: `${dropdownPos.left}px`,
                backgroundColor: "var(--surface-color)",
                border: "1px solid var(--primary-color)",
                borderRadius: "8px",
                zIndex: 1000,
                boxShadow: "0 4px 12px var(--shadow-color)",
                minWidth: "140px",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {uniqueSuggestions.map((s, idx) => (
                <div
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    borderBottom:
                      idx === uniqueSuggestions.length - 1
                        ? "none"
                        : "1px solid var(--border-color)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--surface-hover)";
                    e.target.style.color = "var(--primary-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "var(--text-primary)";
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );
};
