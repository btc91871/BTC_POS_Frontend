import React, { useState, ChangeEvent, useEffect } from "react";
import "./inventLocation.css";
import axios from "axios";
import Toolbar from "../../Toobar/Toolbar";
import type { InventLocation, LocationType, Warehouse } from "../../Interface";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const initialInventLocation: InventLocation = {
  WAREHOUSE: "",
  LOCATION: "",
  LOCATIONTYPE: "",
  CURRENTVOLUME: 0,
  CURRENTWEIGHT: 0,
  AVAILABLEVOLUME: 0,
  AVAILABLEWEIGHT: 0,
  MAXVOLUME: 0,
  MAXWEIGHT: 0,
  DATAAREAID: "",
};

const fieldGroups = [
  {
    title: "Warehouse Details",
    fields: [
      { label: "Warehouse", key: "WAREHOUSE", type: "dropdown" },
      { label: "Location", key: "LOCATION", type: "text" },
      { label: "Location Type", key: "LOCATIONTYPE", type: "dropdown" },
      { label: "Current Volume (m³)", key: "CURRENTVOLUME", type: "number" },
      { label: "Current Weight (kg)", key: "CURRENTWEIGHT", type: "number" },
      {
        label: "Available Volume (m³)",
        key: "AVAILABLEVOLUME",
        type: "number",
      },
      {
        label: "Available Weight (kg)",
        key: "AVAILABLEWEIGHT",
        type: "number",
      },
      { label: "Max Volume (m³)", key: "MAXVOLUME", type: "number" },
      { label: "Max Weight (kg)", key: "MAXWEIGHT", type: "number" },
    ],
  },
];

const AddInventLocation: React.FC = () => {
  const [warehouseData, setWarehouseData] = useState<InventLocation>(
    initialInventLocation
  );
  const [warehouseOptions, setWarehouseOptions] = useState<Warehouse[]>([]);
  const [locationTypeOptions, setLocationTypeOptions] = useState<
    LocationType[]
  >([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const warehouseRes = await fetch(`${API_URL}/api/getWareHouse`);
        const warehouseJson = await warehouseRes.json();
        setWarehouseOptions(warehouseJson.tables || warehouseJson.data || []);

        const locationTypeRes = await fetch(`${API_URL}/api/locationType`);
        const locationTypeJson = await locationTypeRes.json();
        setLocationTypeOptions(
          locationTypeJson.tables || locationTypeJson.data || []
        );
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setWarehouseData((prev) => ({
      ...prev,
      [name]:
        name.includes("VOLUME") || name.includes("WEIGHT")
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSave = async () => {
    try {
      const entityId = localStorage.getItem("EntityId");

      if (!warehouseData.WAREHOUSE) {
        alert("Warehouse  are required!");
        return;
      }

      if (!entityId) {
        alert("Please select Entity");
        return;
      }

      const payload = {
        ...warehouseData,
        DATAAREAID: entityId,
      };

      await axios.post(`${API_URL}/api/AddInventLocation`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Location created!");
      setWarehouseData(initialInventLocation);
    } catch (error) {
      console.error("Error saving warehouse:", error);
      alert("Error saving warehouse! Check console.");
    }
  };

  return (
    <>
      <h3>Add Invent Location</h3>
      <Toolbar
        onSave={handleSave}
        onDelete={() => setWarehouseData(initialInventLocation)}
      />

      <form className="entity-form">
        {fieldGroups.map((group) => (
          <div key={group.title} className="form-group">
            <h4 className="group-heading">{group.title}</h4>
            <div className="group-fields">
              {group.fields.map((field) => (
                <div key={field.key} className="form-field">
                  <label htmlFor={field.key} className="field-label">
                    {field.label}
                  </label>

                  {field.type === "dropdown" ? (
                    <select
                      id={field.key}
                      name={field.key}
                      value={warehouseData[field.key as keyof InventLocation]}
                      onChange={handleChange}
                      className="field-input"
                    >
                      <option value="">-- Select {field.label} --</option>
                      {field.key === "WAREHOUSE"
                        ? warehouseOptions.map((opt) => (
                            <option key={opt.WAREHOUSE} value={opt.WAREHOUSE}>
                              {opt.NAME}
                            </option>
                          ))
                        : locationTypeOptions.map((opt) => (
                            <option
                              key={opt.LOCATIONID}
                              value={opt.LOCATIONTYPE}
                            >
                              {opt.LOCATIONTYPE}
                            </option>
                          ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      id={field.key}
                      name={field.key}
                      value={warehouseData[field.key as keyof InventLocation]}
                      onChange={handleChange}
                      className="field-input"
                      min={field.type === "number" ? 0 : undefined}
                      step={field.type === "number" ? "0.01" : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
    </>
  );
};

export default AddInventLocation;
