import React from "react";
import "./Toolbar.css";

interface ToolbarProps {
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onCancel,
  onDelete,
  onExport,
}) => {
  return (
    <div className="toolbar-container">
      <button className="toolbar-btn save" onClick={onSave}>
        Save
      </button>
      <button className="toolbar-btn cancel" onClick={onCancel}>
        Cancel
      </button>
      <button className="toolbar-btn delete" onClick={onDelete}>
        Delete
      </button>
      <button className="toolbar-btn export" onClick={onExport}>
        Export
      </button>
    </div>
  );
};

export default Toolbar;
