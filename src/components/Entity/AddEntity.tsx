import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "./AddEntity.css";
import axios from "axios";
import Toolbar from "../Toobar/Toolbar";
import type { Address, FormData, GetAllBankDetails } from "../Interface";

const API_URL = import.meta.env.VITE_API_URL;

const initialAddress: Address = {
  NAME: "",
  FULLPRIMARYADDRESS: "",
  PURPOSE: "Business",
  ISPRIMARY: false,
  ADDRESSZIPCODE: "",
  ADDRESSCITY: "",
  ADDRESSTIMEZONE: "",
};

const initialFormData: FormData = {
  NAME: "",
  NAMEALIAS: "",
  SEARCHNAME: "",
  DESCRIPTION: "",
  PARTYNUMBER: "",
  BANKNAME: "",
  ACCOUNTNO: "",
  IFSC: "",
  PARTYTYPE: "",
  MODIFIEDBY: "",
  MODIFIEDDATETIME: "",
  ADDRESSES: [],
  PRIMARYCONTACTPHONE: "",
  PRIMARYCONTACTPHONEDESCRIPTION: "",
  DASHBOARDIMAGE: "",
  LOGO: "",
  TAXREGISTRATIONNO: "",
  PANNO: "",
  COUNTRY: "",
  CREATEDBY: "",
};

// ----------------- Field Groups -----------------
const fieldGroups = [
  {
    title: "Basic Information",
    fields: [
      { label: "Name", key: "NAME" },
      { label: "Name Alias", key: "NAMEALIAS" },
      { label: "Description", key: "DESCRIPTION" },
      { label: "Search Name", key: "SEARCHNAME" },
      { label: "Party Number", key: "PARTYNUMBER" },
      { label: "Legal Entity", key: "LEGALENTITYID" },
      { label: "Party type", key: "PARTYTYPE" },
    ],
  },
  { title: "Address", fields: [] },
  {
    title: "Contact",
    fields: [
      { label: "Primary Contact Phone", key: "PRIMARYCONTACTPHONE" },
      {
        label: "Primary Contact Phone Description",
        key: "PRIMARYCONTACTPHONEDESCRIPTION",
      },
    ],
  },
  {
    title: "Images",
    fields: [
      { label: "Dashboard Image", key: "DASHBOARDIMAGE" },
      { label: "Logo", key: "LOGO" },
    ],
  },
  {
    title: "Tax Information",
    fields: [
      { label: "Tax Registration No", key: "TAXREGISTRATIONNO" },
      { label: "PAN No", key: "PANNO" },
    ],
  },
  {
    title: "Metadata",
    fields: [
      { label: "Modified By", key: "MODIFIEDBY" },
      { label: "Modified Date Time", key: "MODIFIEDDATETIME" },
      { label: "Created By", key: "CREATEDBY" },
      { label: "Country", key: "COUNTRY" },
    ],
  },
];

// ----------------- Component -----------------
const AddEntity: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>(initialAddress);

  // Dropdown state
  const [dropdownOptions, setDropdownOptions] = useState<GetAllBankDetails[]>(
    []
  );
  const [selectedBank, setSelectedBank] = useState<string>("");

  // Fetch dropdown data from API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res1 = await fetch(`${API_URL}/api/GetBanks`);
        const data = await res1.json();
        setDropdownOptions(data.tables || data.data || []); // handle both shapes
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
      setFormData((prev) => {
        const newAddresses = [...prev.ADDRESSES];
        newAddresses[addressIndex] = {
          ...newAddresses[addressIndex],
          [name]: type === "checkbox" ? checked : value,
        };
        return { ...prev, ADDRESSES: newAddresses };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // New address change
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
        setFormData((prev) => ({
          ...prev,
          [fieldName]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addAddress = () => {
    if (newAddress.NAME && newAddress.FULLPRIMARYADDRESS) {
      setFormData((prev) => ({
        ...prev,
        ADDRESSES: [...prev.ADDRESSES, newAddress],
      }));
      setNewAddress(initialAddress);
      setIsDialogOpen(false);
    } else {
      alert("Name and Address are required!");
    }
  };

  const removeAddress = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ADDRESSES: prev.ADDRESSES.filter((_, i) => i !== index),
    }));
  };

  // Save with axios
  const handleSave = async () => {
    try {
      if (!formData.NAME) {
        alert("Name and Legal Entity ID are required!");
        return;
      }
      console.log(formData);
      await axios.post(`${API_URL}/api/AddEntity`, JSON.stringify(formData), {
        headers: { "Content-Type": "application/json" },
      });
      alert("Entity saved!");
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error saving entity:", error);
    }
  };

  return (
    <>
      <h3>Add Legal Entity</h3>
      <Toolbar
        onSave={handleSave}
        onDelete={() => setFormData(initialFormData)}
      />

      <div className="form-field">
        <label htmlFor="bankDropdown" className="field-label">
          Select Bank
        </label>
        <select
          id="bankDropdown"
          value={selectedBank}
          onChange={(e) => {
            setSelectedBank(e.target.value);
            setFormData((prev) => ({
              ...prev,
              BANKNAME: e.target.value, // optional: store in formData
            }));
          }}
          className="field-input"
        >
          <option value="">-- Select Bank --</option>
          {dropdownOptions.map((bank) => (
            <option key={bank.ACCOUNTNO} value={bank.ACCOUNTNO}>
              {bank.NAME} ({bank.IFSC})
            </option>
          ))}
        </select>
      </div>

      {formData.BANKNAME && (
        <div className="grid-container">
          <div className="form-field">
            <label htmlFor="ACCOUNTNO" className="field-label">
              Account No
            </label>
            <input
              type="text"
              id="ACCOUNTNO"
              name="ACCOUNTNO"
              value={formData.ACCOUNTNO}
              onChange={handleChange}
              className="field-input"
              placeholder="Enter Account No"
            />
          </div>

          <div className="form-field">
            <label htmlFor="IFSC" className="field-label">
              IFSC
            </label>
            <input
              type="text"
              id="IFSC"
              name="IFSC"
              value={formData.IFSC}
              onChange={handleChange}
              className="field-input"
              placeholder="Enter IFSC Code"
            />
          </div>
        </div>
      )}

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
                        <th>Name</th>
                        <th>Address</th>
                        <th>Purpose</th>
                        <th>Primary</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.ADDRESSES.map((address, index) => (
                        <tr key={index}>
                          <td>{address.NAME || `Address ${index + 1}`}</td>
                          <td>{address.FULLPRIMARYADDRESS}</td>
                          <td>{address.PURPOSE}</td>
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
                    {field.key === "DASHBOARDIMAGE" || field.key === "LOGO" ? (
                      <>
                        <input
                          type="file"
                          id={field.key}
                          accept="image/png, image/jpeg"
                          onChange={(e) =>
                            handleImageChange(e, field.key as keyof FormData)
                          }
                        />
                        {formData[field.key] && (
                          <img
                            src={formData[field.key] as string}
                            alt={`${field.label} preview`}
                            className="image-preview"
                          />
                        )}
                      </>
                    ) : field.key.toLowerCase().includes("address") ? (
                      <textarea
                        id={field.key}
                        name={field.key}
                        value={formData[field.key as keyof FormData] as string}
                        onChange={handleChange}
                        className="field-input field-textarea"
                      />
                    ) : (
                      <input
                        type="text"
                        id={field.key}
                        name={field.key}
                        value={formData[field.key as keyof FormData] as string}
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
                Name or Description
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
                  name="FULLPRIMARYADDRESS"
                  value={newAddress.FULLPRIMARYADDRESS}
                  onChange={handleNewAddressChange}
                />
              </label>
              <label>
                Zip Code
                <input
                  type="text"
                  name="ADDRESSZIPCODE"
                  value={newAddress.ADDRESSZIPCODE}
                  onChange={handleNewAddressChange}
                />
              </label>
              <label>
                City
                <input
                  type="text"
                  name="ADDRESSCITY"
                  value={newAddress.ADDRESSCITY}
                  onChange={handleNewAddressChange}
                />
              </label>
              <label>
                Timezone
                <input
                  type="text"
                  name="ADDRESSTIMEZONE"
                  value={newAddress.ADDRESSTIMEZONE}
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

export default AddEntity;
