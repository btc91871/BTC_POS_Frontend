import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "./AddCustomer.css";
import axios from "axios";
import Toolbar from "../Toobar/Toolbar";
import type { Gender } from "../../../../src/interfaces/common";
import type { USER, USERADDRESS } from "../Interface";

const API_URL = import.meta.env.VITE_API_URL;

const initialAddress: USERADDRESS = {
  STATE: "",
  COUNTRY: "",
  PURPOSE: "",
  ISPRIMARY: false,
  ADDRESS: "",
  CUSTOMERID: "",
};

const initialUserData: USER = {
  NAME: "",
  PHONE: "",
  EMAIL: "",
  GENDER: "",
  ADDRESS: [],
  LEGALENTITYID: "",
  ID: "",
  PASSWORD: "",
  IMAGE: "",
};

// ----------------- Field Groups -----------------
const fieldGroups = [
  {
    title: "Customer Details",
    fields: [
      { label: "Name", key: "NAME" },
      { label: "Phone", key: "PHONE" },
      { label: "Email", key: "EMAIL" },
      { label: "Password", key: "PASSWORD" },
      { label: "Gender", key: "GENDER" },
      { label: "Image", key: "IMAGE" },
    ],
  },
  { title: "Address", fields: [] },
];

// ----------------- Component -----------------
const AddCustomer: React.FC = () => {
  const [userData, setUserData] = useState<USER>(initialUserData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [newAddress, setNewAddress] = useState<USERADDRESS>(initialAddress);

  // Dropdown state
  const [dropdownOptions, setDropdownOptions] = useState<Gender[]>([]);

  // Fetch dropdown data from API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res1 = await fetch(`${API_URL}/api/getGender`);
        const data = await res1.json();
        setDropdownOptions(data.tables || data.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  // Input change handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    addressIndex?: number
  ) => {
    const checked = (e.target as HTMLInputElement).checked;
    const { name, value, type } = e.target;
    if (addressIndex !== undefined) {
      setUserData((prev) => {
        const newAddresses = [...prev.ADDRESS];
        newAddresses[addressIndex] = {
          ...newAddresses[addressIndex],
          [name]: type === "checkbox" ? checked : value,
        };
        return { ...prev, ADDRESSES: newAddresses };
      });
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // New address change
  const handleNewAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const checked = (e.target as HTMLInputElement).checked;
    const { name, value, type } = e.target;

    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Image upload handler
  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof FormData
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        alert("Only PNG or JPEG files are allowed!");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({
          ...prev,
          [fieldName]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Fix addAddress (ADDRESS not ADDRESSES)
  const addAddress = () => {
    if (newAddress.COUNTRY && newAddress.ADDRESS) {
      setUserData((prev) => ({
        ...prev,
        ADDRESS: [...prev.ADDRESS, newAddress],
      }));
      setNewAddress(initialAddress);
      setIsDialogOpen(false);
    } else {
      alert("Country and Address are required!");
    }
  };

  const removeAddress = (index: number) => {
    setUserData((prev) => ({
      ...prev,
      ADDRESS: prev.ADDRESS.filter((_, i) => i !== index),
    }));
  };

  // Save with axios
  const handleSave = async () => {
    try {
      const entityId = localStorage.getItem("EntityId");

      if (!userData.NAME || !entityId) {
        alert("Something is missing!");
        return;
      }

      const payload = {
        ...userData,
        LEGALENTITYID: entityId,
      };
      await axios.post(`${API_URL}/api/AddUser`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Entity saved!");
      setUserData(initialUserData);
    } catch (error) {
      console.error("Error saving entity:", error);
      alert("Error saving entity! Check console.");
    }
  };

  return (
    <>
      <h3>Add Customer</h3>
      <Toolbar
        onSave={handleSave}
        onDelete={() => setUserData(initialUserData)}
      />

      <div className="form-field">
        <label htmlFor="bankDropdown" className="field-label">
          Select Bank
        </label>
        <select
          id="bankDropdown"
          value={selectedGender}
          onChange={(e) => {
            setSelectedGender(e.target.value);
            setUserData((prev) => ({
              ...prev,
              GENDER: e.target.value,
            }));
          }}
          className="field-input"
        >
          <option value="">-- Select Gender --</option>
          {dropdownOptions.map((gender) => (
            <option key={gender.GENDER} value={gender.GENDER}>
              {gender.GENDER}
            </option>
          ))}
        </select>
      </div>

      <form className="entity-form">
        {fieldGroups.map((group) => (
          <div key={group.title} className="form-group">
            <h4 className="group-heading">{group.title}</h4>
            <div className="group-fields">
              {/* existing rendering code remains same */}
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
                        <th>State</th>
                        <th>Country</th>
                        <th>Pupose</th>
                        <th>Address</th>
                        <th>Primary</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.ADDRESS.map((address, index) => (
                        <tr key={index}>
                          <td>{address.STATE}</td>
                          <td>{address.COUNTRY || `Address ${index + 1}`}</td>
                          <td>{address.PURPOSE}</td>
                          <td>{address.ADDRESS}</td>
                          <td>{address.ISPRIMARY ? "Yes" : "No"}</td>
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
                    {field.key === "IMAGE" ? (
                      <>
                        <input
                          type="file"
                          id={field.key}
                          accept="image/png, image/jpeg"
                          onChange={(e) =>
                            handleImageChange(e, field.key as keyof USER)
                          }
                        />
                        {userData[field.key as keyof USER] && (
                          <img
                            src={userData[field.key] as string}
                            alt={`${field.label} preview`}
                            className="image-preview"
                          />
                        )}
                      </>
                    ) : field.key.toLowerCase().includes("address") ? (
                      <textarea
                        id={field.key}
                        name={field.key}
                        value={userData[field.key as keyof USER] as string}
                        onChange={handleChange}
                        className="field-input field-textarea"
                      />
                    ) : (
                      <input
                        type="text"
                        id={field.key}
                        name={field.key}
                        value={userData[field.key as keyof USER] as string}
                        onChange={handleChange}
                        className="field-input"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </form>

      {/* Modal for address */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Add New Address</h4>
            <div className="modal-form">
              <label>
                State
                <input
                  type="text"
                  name="STATE"
                  value={newAddress.STATE}
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
                Country
                <input
                  type="text"
                  name="COUNTRY"
                  value={newAddress.COUNTRY}
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
                  checked={newAddress.ISPRIMARY}
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

export default AddCustomer;
