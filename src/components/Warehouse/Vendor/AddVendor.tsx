import React, { useState, useEffect, ChangeEvent } from "react";
import "./AddVendor.css";
import axios from "axios";
import Toolbar from "../../Toobar/Toolbar";
import type { CURRENCY, VENDOR, VENDORGROUPCATEGORY } from "../../Interface";

const API_URL = import.meta.env.VITE_API_URL;

const initialVendorData: VENDOR = {
  NAME: "",
  VENDORHOLD: "",
  PHONE: "",
  PRIMARYCONTACT: "",
  VENDORGROUP: "",
  CURRENCY: "",
};

const fieldGroups = [
  {
    title: "Vendor Details",
    fields: [
      { label: "Name", key: "NAME", type: "text" },
      { label: "Vendor Hold", key: "VENDORHOLD", type: "select" },
      { label: "Phone", key: "PHONE", type: "text" },
      { label: "Primary Contact", key: "PRIMARYCONTACT", type: "text" },
      { label: "Vendor Group", key: "VENDORGROUP", type: "select" },
      { label: "Currency", key: "CURRENCY", type: "select" },
    ],
  },
];

const AddVendor: React.FC = () => {
  const [vendor, setVendorData] = useState<VENDOR>(initialVendorData);
  const [vendorGroups, setVendorGroups] = useState<VENDORGROUPCATEGORY[]>([]);
  const [currency, setCurrency] = useState<CURRENCY[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setIsLoading(true);
      try {
        const dataAreaId = localStorage.getItem("EntityId");

        // Fetch vendor groups
        const vendorGroupsRes = await axios.get(
          `${API_URL}/api/getVendorGroup`,
          {
            headers: { "Content-Type": "application/json" },
            params: { dataAreaId },
          }
        );
        const groups = Array.isArray(vendorGroupsRes.data.data)
          ? vendorGroupsRes.data.data
          : [];
        console.log("Vendor groups fetched:", groups); // Debugging
        setVendorGroups(groups);

        // Fetch currencies
        const currencyRes = await axios.get(`${API_URL}/api/getCurrency`, {
          headers: { "Content-Type": "application/json" },
          params: { dataAreaId }, // Add dataAreaId if required by API
        });
        const currencies = Array.isArray(currencyRes.data.data)
          ? currencyRes.data.data
          : [];
        console.log("Currencies fetched:", currencies); // Debugging
        setCurrency(currencies);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        alert("Failed to load dropdown data!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const entityId = localStorage.getItem("EntityId");
      if (
        !vendor.NAME ||
        !vendor.VENDORGROUP ||
        !vendor.CURRENCY ||
        !entityId
      ) {
        alert("Name, Vendor Group, Currency, and Entity ID are required!");
        return;
      }

      const payload = {
        ...vendor,
        LEGALENTITYID: entityId,
      };
      console.log("Payload:", payload);
      await axios.post(`${API_URL}/api/addVendor`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Vendor saved!");
      setVendorData(initialVendorData);
    } catch (error) {
      console.error("Error saving vendor:", error);
      alert("Error saving vendor! Check console.");
    }
  };

  return (
    <>
      <h3>Add Vendor</h3>
      <Toolbar
        onSave={handleSave}
        onDelete={() => setVendorData(initialVendorData)}
      />

      <form className="entity-form" onSubmit={(e) => e.preventDefault()}>
        {fieldGroups.map((group) => (
          <div key={group.title} className="form-group">
            <h4 className="group-heading">{group.title}</h4>
            <div className="group-fields">
              {group.fields.map((field) => (
                <div key={field.key} className="form-field">
                  <label htmlFor={field.key} className="field-label">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={field.key}
                      name={field.key}
                      value={vendor[field.key as keyof VENDOR] || ""}
                      onChange={handleChange}
                      className="field-input"
                      disabled={isLoading}
                    >
                      <option value="">-- Select --</option>
                      {field.key === "VENDORHOLD" ? (
                        <>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </>
                      ) : field.key === "VENDORGROUP" ? (
                        vendorGroups && Array.isArray(vendorGroups) ? (
                          vendorGroups.map((group, index) => (
                            <option key={index} value={group.ID}>
                              {group.NAME}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No vendor groups available
                          </option>
                        )
                      ) : field.key === "CURRENCY" ? (
                        currency && Array.isArray(currency) ? (
                          currency.map((currenc, index) => (
                            <option key={index} value={currenc.CODE}>
                              {currenc.NAME}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No currencies available
                          </option>
                        )
                      ) : null}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id={field.key}
                      name={field.key}
                      value={vendor[field.key as keyof VENDOR] || ""}
                      onChange={handleChange}
                      className="field-input"
                      disabled={isLoading}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
      {isLoading && <div className="loading-spinner">Loading...</div>}
    </>
  );
};

export default AddVendor;
