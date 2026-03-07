import React, { useState, ChangeEvent, useEffect, KeyboardEvent } from "react";
import "./AddWarehouse.css";
import axios from "axios";
import type {
  INVENTLOCATION,
  Vendor,
  Warehouse,
  WarehouseAddress,
} from "../Interface";
import Toolbar from "../Toobar/Toolbar";
import type { SITE } from "../../../../src/interfaces/common";

const API_URL = import.meta.env.VITE_API_URL;

const initialAddress: WarehouseAddress = {
  NAME: "",
  ADDRESS: "",
  PURPOSE: "",
  PRIMARY_FLAG: false,
  CITY: "",
};

const initialWarehouse: Warehouse = {
  WAREHOUSE: "",
  NAME: "",
  SITE: "",
  TYPE: "",
  QUARANTINE_WAREHOUSE: "",
  TRANSIT_WAREHOUSE: "",
  VENDOR_ACCOUNT: "",
  DEFAULT_RETURN_LOCATION: "",
  DEFAULT_LOCATION: "",
  MAIN_WAREHOUSE: "",
  ADDRESSES: [],
};

// Reusable FormField component with support for object options
interface FormFieldProps<T> {
  field: string;
  label: string;
  options?: T[];
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  valueKey?: keyof T;
  displayKey?: keyof T;
  disabled?: boolean;
}

const FormField = <T extends string | { [key: string]: any }>({
  field,
  label,
  options,
  value,
  onChange,
  valueKey,
  displayKey,
  disabled,
}: FormFieldProps<T>) => (
  <div className="form-field">
    <label htmlFor={field} className="field-label">
      {label}
    </label>
    {options ? (
      <select
        id={field}
        name={field}
        value={value}
        onChange={onChange}
        className="field-input"
        disabled={disabled}
      >
        <option value="">-- Select {label} --</option>
        {options.map((opt, index) => (
          <option
            key={index}
            value={typeof opt === "string" ? opt : opt[valueKey || "id"]}
          >
            {typeof opt === "string" ? opt : opt[displayKey || "name"]}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        id={field}
        name={field}
        value={value}
        onChange={onChange}
        className="field-input"
        disabled={disabled}
      />
    )}
  </div>
);

// ----------------- Component -----------------
const AddWarehouse: React.FC = () => {
  const [warehouseData, setWarehouseData] =
    useState<Warehouse>(initialWarehouse);
  const [getSite, setGetSite] = useState<SITE[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] =
    useState<WarehouseAddress>(initialAddress);
  const [vendorOptions, setVendorOptions] = useState<Vendor[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<Warehouse[]>([]);

  const [inventLocation, setInventLocation] = useState<INVENTLOCATION[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setIsLoading(true);
      try {
        const dataAreaId = localStorage.getItem("EntityId");

        const siteRes = await axios.get(`${API_URL}/api/getSite`, {
          headers: { "Content-Type": "application/json" },
          params: { dataAreaId },
        });

        setGetSite(Array.isArray(siteRes.data.data) ? siteRes.data.data : []);

        const inventLocation = await axios.get(
          `${API_URL}/api/getInventLocation`,
          {
            headers: { "Content-Type": "application/json" },
            params: { dataAreaId },
          }
        );

        setInventLocation(
          Array.isArray(inventLocation.data.data)
            ? inventLocation.data.data
            : []
        );

        const vendorsRes = await axios.get(`${API_URL}/api/getVendors`);
        setVendorOptions(
          Array.isArray(vendorsRes.data.data) ? vendorsRes.data.data : []
        );

        const warehousesRes = await axios.get(`${API_URL}/api/getWarehouse`);
        setWarehouseOptions(
          Array.isArray(warehousesRes.data.data) ? warehousesRes.data.data : []
        );
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDialogOpen(false);
    };
    if (isDialogOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isDialogOpen]);

  // Input change handler for warehouse fields
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name in warehouseData) {
      setWarehouseData((prev) => ({
        ...prev,
        [name as keyof Warehouse]: value,
      }));
    }
  };

  const handleNewAddressChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name in newAddress) {
      setNewAddress((prev) => ({
        ...prev,
        [name as keyof WarehouseAddress]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Add new address to warehouse
  const addAddress = () => {
    if (!newAddress.NAME || !newAddress.ADDRESS) {
      alert("Name and Address are required!");
      return;
    }
    setWarehouseData((prev) => ({
      ...prev,
      ADDRESSES: newAddress.PRIMARY_FLAG
        ? [
            ...prev.ADDRESSES.map((addr) => ({ ...addr, PRIMARY_FLAG: false })),
            newAddress,
          ]
        : [...prev.ADDRESSES, newAddress],
    }));
    setNewAddress(initialAddress);
    setIsDialogOpen(false);
  };

  // Remove address
  const removeAddress = (index: number) => {
    setWarehouseData((prev) => ({
      ...prev,
      ADDRESSES: prev.ADDRESSES.filter((_, i) => i !== index),
    }));
  };

  // Save warehouse
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!warehouseData.WAREHOUSE || !warehouseData.NAME) {
      alert("Warehouse and Name are required!");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/AddWarehouse`, warehouseData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Warehouse saved!");
      setWarehouseData(initialWarehouse);
    } catch (error) {
      console.error("Error saving warehouse:", error);
      alert("Error saving warehouse! Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h3>Add Warehouse</h3>
      <Toolbar
        onSave={handleSave}
        onDelete={() => setWarehouseData(initialWarehouse)}
      />

      <form className="entity-form" onSubmit={handleSave}>
        <div className="form-group">
          <h4 className="group-heading">Warehouse Details</h4>
          <div className="group-fields">
            {[
              { field: "WAREHOUSE", label: "Warehouse" },
              { field: "NAME", label: "Name" },

              {
                field: "SITE",
                label: "Site",
                options: getSite,
                valueKey: "SITEID",
                displayKey: "NAME",
              },

              { field: "TYPE", label: "Type" },
              {
                field: "QUARANTINE_WAREHOUSE",
                label: "Quarantine Warehouse",
                options: warehouseOptions,
                valueKey: "WAREHOUSE",
                displayKey: "NAME",
              },
              {
                field: "TRANSIT_WAREHOUSE",
                label: "Transit Warehouse",
                options: warehouseOptions,
                valueKey: "WAREHOUSE",
                displayKey: "NAME",
              },
              {
                field: "VENDOR_ACCOUNT",
                label: "Vendor Account",
                options: vendorOptions,
                valueKey: "NAME",
                displayKey: "NAME",
              },
              {
                field: "DEFAULT_RETURN_LOCATION",
                options: inventLocation,
                valueKey: "LOCATION",
                displayKey: "LOCATION",
                label: "Default Return Location",
              },
              {
                field: "DEFAULT_LOCATION",
                label: "Default Location",
                options: inventLocation,
                valueKey: "LOCATION",
                displayKey: "LOCATION",
              },
              {
                field: "MAIN_WAREHOUSE",
                label: "Main Warehouse",
                options: warehouseOptions,
                valueKey: "NAME",
                displayKey: "NAME",
              },
            ].map(({ field, label, options, valueKey, displayKey }) => (
              <FormField
                key={field}
                field={field}
                label={label}
                options={options}
                value={warehouseData[field as keyof Warehouse] || ""}
                onChange={handleChange}
                valueKey={valueKey}
                displayKey={displayKey}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <h4 className="group-heading">Addresses</h4>
          <div className="address-table">
            <div className="address-header">
              Addresses
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="add-address-button"
                disabled={isLoading}
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
                  <th>City</th>
                  <th>Primary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {warehouseData.ADDRESSES.map((addr, idx) => (
                  <tr key={idx}>
                    <td>{addr.NAME}</td>
                    <td>{addr.ADDRESS}</td>
                    <td>{addr.PURPOSE}</td>
                    <td>{addr.CITY}</td>
                    <td>{addr.PRIMARY_FLAG ? "Yes" : "No"}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeAddress(idx)}
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>

      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Add New Address</h4>
            <div className="modal-form">
              {["NAME", "ADDRESS", "PURPOSE", "CITY"].map((field) => (
                <label key={field}>
                  {field}
                  {field === "PURPOSE" ? (
                    <select
                      name={field}
                      value={newAddress[field as keyof WarehouseAddress]}
                      onChange={handleNewAddressChange}
                      disabled={isLoading}
                    >
                      <option value="">-- Select --</option>
                      <option value="Business">Business</option>
                      <option value="Storage">Storage</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={field}
                      value={newAddress[field as keyof WarehouseAddress] || ""}
                      onChange={handleNewAddressChange}
                      disabled={isLoading}
                    />
                  )}
                </label>
              ))}
              <label>
                Primary
                <input
                  type="checkbox"
                  name="PRIMARY_FLAG"
                  checked={newAddress.PRIMARY_FLAG}
                  onChange={handleNewAddressChange}
                  disabled={isLoading}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={addAddress} disabled={isLoading}>
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoading && <div className="loading-spinner">Loading...</div>}
    </>
  );
};

export default AddWarehouse;
