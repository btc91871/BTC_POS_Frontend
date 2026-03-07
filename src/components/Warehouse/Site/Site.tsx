import React, { useState, ChangeEvent } from "react";
import "./site.css";
import axios from "axios";
import Toolbar from "../../Toobar/Toolbar";
import type { SITE, SITEADDRESS } from "../../Interface";

const API_URL = import.meta.env.VITE_API_URL;

const initialAddress: SITEADDRESS = {
  DATAAREAID: "",
  NAME: "",
  ADDRESS: "",
  PURPOSE: "",
  PRIMARY: false,
};

const initialSiteData: SITE = {
  NAME: "",
  LEGALENTITYID: "",
  SITE: "",
  ADDRESS: [],
};

const fieldGroups = [
  { title: "Site Details", fields: [{ label: "Name", key: "NAME" }] },
  { title: "Address", fields: [] },
];

const AddSite: React.FC = () => {
  const [Site, setSiteData] = useState<SITE>(initialSiteData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<SITEADDRESS>(initialAddress);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    addressIndex?: number
  ) => {
    const checked = (e.target as HTMLInputElement).checked;
    const { name, value, type } = e.target;
    if (addressIndex !== undefined) {
      setSiteData((prev) => {
        const newAddresses = [...prev.ADDRESS];
        newAddresses[addressIndex] = {
          ...newAddresses[addressIndex],
          [name]: type === "checkbox" ? checked : value,
        };
        return { ...prev, ADDRESS: newAddresses }; // fixed typo
      });
    } else {
      setSiteData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleNewAddressChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const checked = (e.target as HTMLInputElement).checked;
    const { name, value, type } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addAddress = () => {
    if (!newAddress.NAME || !newAddress.ADDRESS) {
      alert("Name and Address are required!");
      return;
    }
    setSiteData((prev) => ({
      ...prev,
      ADDRESS: [...prev.ADDRESS, newAddress],
    }));
    setNewAddress(initialAddress);
    setIsDialogOpen(false);
  };

  const removeAddress = (index: number) => {
    setSiteData((prev) => ({
      ...prev,
      ADDRESS: prev.ADDRESS.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const entityId = localStorage.getItem("EntityId");
      if (!Site.NAME || !entityId) {
        alert("Something is missing!");
        return;
      }

      const payload = {
        ...Site,
        LEGALENTITYID: entityId,
      };
      console.log("Payload:", payload);
      await axios.post(`${API_URL}/api/AddSite`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Site saved!");
      setSiteData(initialSiteData);
    } catch (error) {
      console.error("Error saving site:", error);
      alert("Error saving entity! Check console.");
    }
  };

  return (
    <>
      <h3>Add Site</h3>
      <Toolbar
        onSave={handleSave}
        onDelete={() => setSiteData(initialSiteData)}
      />

      <form className="entity-form" onSubmit={(e) => e.preventDefault()}>
        {fieldGroups.map((group) => (
          <div key={group.title} className="form-group">
            <h4 className="group-heading">{group.title}</h4>
            <div className="group-fields">
              {group.title === "Address" ? (
                <div className="address-table">
                  <div className="address-header">
                    Addresses
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(true)}
                      className="add-address-button"
                    >
                      + Add
                    </button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Purpose</th>
                        <th>Primary</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Site.ADDRESS.map((address, index) => (
                        <tr key={index}>
                          <td>{address.NAME}</td>
                          <td>{address.ADDRESS}</td>
                          <td>{address.PURPOSE}</td>
                          <td>{address.PRIMARY ? "Yes" : "No"}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeAddress(index)}
                              className="remove-address-button"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                group.fields.map((field) => (
                  <div key={field.key} className="form-field">
                    <label htmlFor={field.key} className="field-label">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      id={field.key}
                      name={field.key}
                      value={Site[field.key as keyof SITE] as string}
                      onChange={handleChange}
                      className="field-input"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </form>

      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Add Site Address</h4>
            <div className="modal-form">
              <label>
                NAME
                <input
                  type="text"
                  name="NAME"
                  value={newAddress.NAME}
                  onChange={handleNewAddressChange}
                />
              </label>

              <label>
                Address
                <textarea
                  name="ADDRESS"
                  value={newAddress.ADDRESS}
                  onChange={handleNewAddressChange}
                />
              </label>

              <label>
                Purpose
                <select
                  name="PURPOSE"
                  value={newAddress.PURPOSE}
                  onChange={handleNewAddressChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Business">Business</option>
                  <option value="Home">Home</option>
                </select>
              </label>

              <label>
                Primary
                <input
                  type="checkbox"
                  name="ISPRIMARY"
                  checked={newAddress.PRIMARY}
                  onChange={handleNewAddressChange}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={addAddress}>
                Add
              </button>
              <button type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddSite;
