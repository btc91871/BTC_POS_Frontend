import React, { useState } from "react";
import "./EnumForm.css";

interface EnumFormData {
  enumName: string;
  memberName: string;
  value: number;
}

const EnumForm: React.FC = () => {
  const [formData, setFormData] = useState<EnumFormData>({
    enumName: "",
    memberName: "",
    value: 0,
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "value" ? Number(value) : value,
    }));

    setError("");
  };

  const handleSave = () => {
    if (!formData.enumName.trim()) {
      setError("Enum name is required");
      return;
    }

    if (!formData.memberName.trim()) {
      setError("Member name is required");
      return;
    }

    console.log("Enum Data:", formData);
  };

  const handleCancel = () => {
    setFormData({
      enumName: "",
      memberName: "",
      value: 0,
    });
    setError("");
  };

  return (
    <div className="enumFormContainer">
      <h2 className="formTitle">Create Enum</h2>

      <div className="formRow">
        <label>ENUM NAME</label>
        <input
          type="text"
          name="enumName"
          value={formData.enumName}
          onChange={handleChange}
          placeholder="Enter Enum Name"
        />
      </div>

      <div className="formRow">
        <label>MEMBER NAME</label>
        <input
          type="text"
          name="memberName"
          value={formData.memberName}
          onChange={handleChange}
          placeholder="Enter Member Name"
        />
      </div>

      <div className="formRow">
        <label>VALUE</label>
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleChange}
        />
      </div>

      {error && <p className="formError">{error}</p>}

      <div className="formButtons">
        <button className="btnPrimary" onClick={handleSave}>
          Save
        </button>

        <button className="btnSecondary" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EnumForm;