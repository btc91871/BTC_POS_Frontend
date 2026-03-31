import React, { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import "./ProductMaster.css";
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaCog,
  FaArrowLeft,
  FaBars,
  FaSearch,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

interface ProductMasterForm {
  PRODUCTID: string;
  PRODUCTNAME: string;
  PRODUCTSEARCHNAME: string;
  PRODUCTDESCRIPTION: string;
  PRODUCTTYPE: number;
  PRODUCTSUBTYPE: number;
  STORAGEDIMGROUP: string;
  PRODUCTDIMGROUP: string;
  TRACKINGDIMGROUP: string;
  COLORGROUP: string;
  STYLEGROUP: string;
  SIZEGROUP: string;
  ISVARIANTNUMBERNOMENCLATUREALLOWED: number;
  VARIANTNUMBERNOMENCLATURE: string;
  ISVARIANTNAMENOMENCLATUREALLOWED: number;
  VARIANTNAMENOMENCLATURE: string;
  ISCATCHWEIGHTPRODUCT: number;
  CREATEDBY: string;
  MODIFIEDBY: string;
}

const initialProductForm: ProductMasterForm = {
  PRODUCTID: "",
  PRODUCTNAME: "",
  PRODUCTSEARCHNAME: "",
  PRODUCTDESCRIPTION: "",
  PRODUCTTYPE: 0,
  PRODUCTSUBTYPE: 0,
  STORAGEDIMGROUP: "",
  PRODUCTDIMGROUP: "",
  TRACKINGDIMGROUP: "",
  COLORGROUP: "",
  STYLEGROUP: "",
  SIZEGROUP: "",
  ISVARIANTNUMBERNOMENCLATUREALLOWED: 0,
  VARIANTNUMBERNOMENCLATURE: "",
  ISVARIANTNAMENOMENCLATUREALLOWED: 0,
  VARIANTNAMENOMENCLATURE: "",
  ISCATCHWEIGHTPRODUCT: 0,
  CREATEDBY: "",
  MODIFIEDBY: "",
};

const ProductMaster: React.FC = () => {
  const [formData, setFormData] = useState<ProductMasterForm>(initialProductForm);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
      return;
    }

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const createdBy =
      formData.CREATEDBY ||
      localStorage.getItem("UserId") ||
      localStorage.getItem("userId") ||
      "";
    const modifiedBy = formData.MODIFIEDBY || createdBy;

    if (!formData.PRODUCTID || !formData.PRODUCTNAME || !createdBy) {
      alert("Product ID, Product Name, and Created By are required.");
      return;
    }

    const payload = {
      productID: formData.PRODUCTID,
      productName: formData.PRODUCTNAME,
      productSearchName: formData.PRODUCTSEARCHNAME,
      productDescription: formData.PRODUCTDESCRIPTION,
      productType: formData.PRODUCTTYPE,
      productSubType: formData.PRODUCTSUBTYPE,
      storageDimGroup: formData.STORAGEDIMGROUP || undefined,
      productionDimGroup: formData.PRODUCTDIMGROUP || undefined,
      trackingDimGroup: formData.TRACKINGDIMGROUP || undefined,
      colorGroup: formData.COLORGROUP || undefined,
      styleGroup: formData.STYLEGROUP || undefined,
      sizeGroup: formData.SIZEGROUP || undefined,
      isCatchWeightProduct: formData.ISCATCHWEIGHTPRODUCT,
      createdBy,
      modifiedBy,
    };

    try {
      await axios.post(`${API_URL}/api/v1/product/create-product`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Product saved successfully.");
      setFormData(initialProductForm);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Check console for details.");
    }
  };

  return (
    <>
      <div className="product-ribbon">
        <div className="ribbon-top">
          <div className="ribbon-left">
            <button type="button" className="ribbon-icon-btn">
              <FaArrowLeft />
            </button>
            <button type="button" className="ribbon-icon-btn">
              <FaBars />
            </button>

            <button type="button" className="ribbon-btn" onClick={handleSave}>
              <FaSave /> Save
            </button>
            <button
              type="button"
              className="ribbon-btn"
              onClick={() => setFormData(initialProductForm)}
            >
              <FaPlus /> New
            </button>
            <button
              type="button"
              className="ribbon-btn"
              onClick={() => setFormData(initialProductForm)}
            >
              <FaTrash /> Delete
            </button>

            <button type="button" className="ribbon-tab is-active">
              Transfer order
            </button>
            <button type="button" className="ribbon-tab">
              Ship
            </button>
            <button type="button" className="ribbon-tab">
              Receive
            </button>
            <button type="button" className="ribbon-tab">
              Options
            </button>
            <button type="button" className="ribbon-icon-btn">
              <FaSearch />
            </button>
          </div>
          <div className="ribbon-right">
            <button type="button" className="ribbon-icon-btn">
              <FaCog />
            </button>
          </div>
        </div>

        <div className="ribbon-band">
          <div className="ribbon-group">
            <h6>Print</h6>
            <button type="button" className="ribbon-chip is-primary">
              Transfer overview
            </button>
          </div>
          <div className="ribbon-group">
            <h6>View</h6>
            <button type="button" className="ribbon-link is-disabled">
              Transfer order history
            </button>
          </div>
          <div className="ribbon-group">
            <h6>Landed cost</h6>
            <button type="button" className="ribbon-link">
              Costs inquiry
            </button>
          </div>
          <div className="ribbon-group">
            <h6>Clean up</h6>
            <button type="button" className="ribbon-link">
              Transfer order manual correction
            </button>
          </div>
        </div>
      </div>

      <div className="page-title-wrap">
        <p className="page-breadcrumb">Product details | Standard view</p>
        <h3 className="page-title">Product Master</h3>
      </div>

      <form className="entity-form" onSubmit={(e) => e.preventDefault()}>
        <div className="section-card">
          <h4 className="section-title">General</h4>

          <div className="general-grid">
            <div className="column-block">
              <h5 className="column-title">Identification</h5>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="PRODUCTID" className="field-label">Product number</label>
                  <input id="PRODUCTID" name="PRODUCTID" type="text" maxLength={20} value={formData.PRODUCTID} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="PRODUCTNAME" className="field-label">Product name</label>
                  <input id="PRODUCTNAME" name="PRODUCTNAME" type="text" maxLength={70} value={formData.PRODUCTNAME} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="PRODUCTSEARCHNAME" className="field-label">Search name</label>
                  <input id="PRODUCTSEARCHNAME" name="PRODUCTSEARCHNAME" type="text" maxLength={30} value={formData.PRODUCTSEARCHNAME} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field wide">
                  <label htmlFor="PRODUCTDESCRIPTION" className="field-label">Description</label>
                  <textarea id="PRODUCTDESCRIPTION" name="PRODUCTDESCRIPTION" value={formData.PRODUCTDESCRIPTION} onChange={handleChange} className="field-input line-input field-textarea" />
                </div>
              </div>
            </div>

            <div className="column-block">
              <h5 className="column-title">Administration</h5>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="PRODUCTDIMGROUP" className="field-label">Product dimension group</label>
                  <input id="PRODUCTDIMGROUP" name="PRODUCTDIMGROUP" type="text" value={formData.PRODUCTDIMGROUP} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="STORAGEDIMGROUP" className="field-label">Storage dimension group</label>
                  <input id="STORAGEDIMGROUP" name="STORAGEDIMGROUP" type="text" value={formData.STORAGEDIMGROUP} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="TRACKINGDIMGROUP" className="field-label">Tracking dimension group</label>
                  <input id="TRACKINGDIMGROUP" name="TRACKINGDIMGROUP" type="text" value={formData.TRACKINGDIMGROUP} onChange={handleChange} className="field-input line-input" />
                </div>
              </div>
              <h5 className="column-title sub-title">Variants</h5>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="COLORGROUP" className="field-label">Color group</label>
                  <input id="COLORGROUP" name="COLORGROUP" type="text" value={formData.COLORGROUP} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="STYLEGROUP" className="field-label">Style group</label>
                  <input id="STYLEGROUP" name="STYLEGROUP" type="text" value={formData.STYLEGROUP} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="SIZEGROUP" className="field-label">Size group</label>
                  <input id="SIZEGROUP" name="SIZEGROUP" type="text" value={formData.SIZEGROUP} onChange={handleChange} className="field-input line-input" />
                </div>
              </div>
            </div>

            <div className="column-block">
              <h5 className="column-title">Product variants</h5>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="PRODUCTTYPE" className="field-label">Product type</label>
                  <input id="PRODUCTTYPE" name="PRODUCTTYPE" type="number" value={formData.PRODUCTTYPE} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="PRODUCTSUBTYPE" className="field-label">Product subtype</label>
                  <input id="PRODUCTSUBTYPE" name="PRODUCTSUBTYPE" type="number" value={formData.PRODUCTSUBTYPE} onChange={handleChange} className="field-input line-input" />
                </div>

                <div className="toggle-field">
                  <label htmlFor="ISVARIANTNUMBERNOMENCLATUREALLOWED" className="field-label">Use number nomenclature</label>
                  <div className="toggle-wrap">
                    <label className="switch">
                      <input id="ISVARIANTNUMBERNOMENCLATUREALLOWED" name="ISVARIANTNUMBERNOMENCLATUREALLOWED" type="checkbox" checked={formData.ISVARIANTNUMBERNOMENCLATUREALLOWED === 1} onChange={handleChange} />
                      <span className="slider" />
                    </label>
                    <span className="toggle-text">{formData.ISVARIANTNUMBERNOMENCLATUREALLOWED === 1 ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="VARIANTNUMBERNOMENCLATURE" className="field-label">Product variant number nomenclature</label>
                  <input id="VARIANTNUMBERNOMENCLATURE" name="VARIANTNUMBERNOMENCLATURE" type="text" value={formData.VARIANTNUMBERNOMENCLATURE} onChange={handleChange} className="field-input line-input" />
                </div>

                <div className="toggle-field">
                  <label htmlFor="ISVARIANTNAMENOMENCLATUREALLOWED" className="field-label">Use name nomenclature</label>
                  <div className="toggle-wrap">
                    <label className="switch">
                      <input id="ISVARIANTNAMENOMENCLATUREALLOWED" name="ISVARIANTNAMENOMENCLATUREALLOWED" type="checkbox" checked={formData.ISVARIANTNAMENOMENCLATUREALLOWED === 1} onChange={handleChange} />
                      <span className="slider" />
                    </label>
                    <span className="toggle-text">{formData.ISVARIANTNAMENOMENCLATUREALLOWED === 1 ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="VARIANTNAMENOMENCLATURE" className="field-label">Product variant name nomenclature</label>
                  <input id="VARIANTNAMENOMENCLATURE" name="VARIANTNAMENOMENCLATURE" type="text" value={formData.VARIANTNAMENOMENCLATURE} onChange={handleChange} className="field-input line-input" />
                </div>
              </div>
            </div>

            <div className="column-block">
              <h5 className="column-title">Product brands</h5>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="CREATEDBY" className="field-label">Created by</label>
                  <input id="CREATEDBY" name="CREATEDBY" type="text" value={formData.CREATEDBY} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="form-field">
                  <label htmlFor="MODIFIEDBY" className="field-label">Modified by</label>
                  <input id="MODIFIEDBY" name="MODIFIEDBY" type="text" value={formData.MODIFIEDBY} onChange={handleChange} className="field-input line-input" />
                </div>
                <div className="toggle-field">
                  <label htmlFor="ISCATCHWEIGHTPRODUCT" className="field-label">MSKU</label>
                  <div className="toggle-wrap">
                    <label className="switch">
                      <input id="ISCATCHWEIGHTPRODUCT" name="ISCATCHWEIGHTPRODUCT" type="checkbox" checked={formData.ISCATCHWEIGHTPRODUCT === 1} onChange={handleChange} />
                      <span className="slider" />
                    </label>
                    <span className="toggle-text">{formData.ISCATCHWEIGHTPRODUCT === 1 ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default ProductMaster;