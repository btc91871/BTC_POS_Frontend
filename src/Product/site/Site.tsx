// import React, { useState, useEffect } from "react";
// import "./Site.css";


// interface SiteRecord {
//     siteGUID: string;
//     siteID: string;
//     siteName: string;
//     description: string;
//     dataAreaID: string;
//     createdBy: string;
//     modifiedBy: string;
// }



// const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
// const API_BASE_URL = "http://192.168.0.104";

// // const EMPTY_ADDRESS: Address = {
// //     partyType: 0,
// //     partyID: "",
// //     address: "",
// //     addressType: 0,
// //     city: "",
// //     state: "",
// //     country: "",
// //     postalCode: "",
// //     isActive: true,
// // };

// const EMPTY_SITE: SiteRecord = {
//     siteGUID: "",
//     siteID: "",
//     siteName: "",
//     description: "",
//     dataAreaID: "",
//     createdBy: LOGGED_IN_USER_ID,
//     modifiedBy: LOGGED_IN_USER_ID,
//     // addresses: [],
// };


// const Toggle: React.FC<{
//     value: boolean;
//     onChange?: () => void;
//     disabled?: boolean;
// }> = ({ value, onChange, disabled }) => (
//     <button
//         type="button"
//         className={`s-toggle ${value ? "s-toggle-on" : "s-toggle-off"}`}
//         onClick={!disabled ? onChange : undefined}
//         disabled={disabled}
//     >
//         <span className="s-toggle-thumb" />
//     </button>
// );

// // ──────────────────────────────────────────────
// // MAIN COMPONENT
// // ──────────────────────────────────────────────
// const SitesPage: React.FC = () => {

//     const [records, setRecords] = useState<SiteRecord[]>([]);
//     const [selected, setSelected] = useState<SiteRecord | null>(null);
//     const [selectedIdx, setSelectedIdx] = useState<number>(-1);
//     const [formData, setFormData] = useState<SiteRecord>({ ...EMPTY_SITE });
//     const [filterText, setFilterText] = useState<string>("");
//     const [isNew, setIsNew] = useState<boolean>(false);
//     const [isEditing, setIsEditing] = useState<boolean>(false);
//     const [successMsg, setSuccessMsg] = useState<string>("");
//     const [errorMsg, setErrorMsg] = useState<string>("");
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [pageLoading, setPageLoading] = useState<boolean>(true);

//     // Address modal state
//     const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
//     // const [addressForm, setAddressForm] = useState<Address>({ ...EMPTY_ADDRESS });
//     const [editAddressIdx, setEditAddressIdx] = useState<number>(-1); // -1 = new address

//     // Section collapse state
//     const [generalOpen, setGeneralOpen] = useState<boolean>(true);
//     const [addressesOpen, setAddressesOpen] = useState<boolean>(true);

//     // ── GET all sites on load ──
//     useEffect(() => {
//         const load = async () => {
//             try {
//                 setPageLoading(true);
//                 const res = await fetch(`${API_BASE_URL}/api/Site/GetByDataAreaID`, {
//                     headers: { "accept": "*/*" },
//                 });
//                 if (!res.ok) throw new Error("Failed to fetch sites.");
//                 const data: SiteRecord[] = await res.json();
//                 setRecords(data);
//                 if (data.length > 0) {
//                     setSelected(data[0]);
//                     setSelectedIdx(0);
//                     setFormData({ ...data[0] });
//                 }
//             } catch (err) {
//                 setErrorMsg("Could not load sites. Please refresh.");
//                 console.error(err);
//             } finally {
//                 setPageLoading(false);
//             }
//         };
//         load();
//     }, []);

//     // ── Select site from sidebar ──
//     const handleSelectSite = (site: SiteRecord, idx: number) => {
//         if (isNew || isEditing) return;
//         setSelected(site);
//         setSelectedIdx(idx);
//         // setFormData({ ...site, addresses: site.addresses ? [...site.addresses] : [] });
//         setErrorMsg("");
//     };

//     // ── Form field change ──
//     const handleChange = (field: keyof SiteRecord, value: string) => {
//         setFormData(prev => ({ ...prev, [field]: value }));
//     };

//     // ── + New ──
//     const handleNew = () => {
//         setIsNew(true);
//         setIsEditing(false);
//         setSelected(null);
//         setSelectedIdx(-1);
//         // setFormData({ ...EMPTY_SITE, addresses: [] });
//         setErrorMsg("");
//     };

//     // ── Edit ──
//     const handleEdit = () => {
//         if (!selected) return;
//         setIsEditing(true);
//         setIsNew(false);
//         setErrorMsg("");
//     };

//     // ── Cancel ──
//     const handleCancel = () => {
//         setIsNew(false);
//         setIsEditing(false);
//         // if (selected) setFormData({ ...selected, addresses: selected.addresses ? [...selected.addresses] : [] });
//         setErrorMsg("");
//     };

//     // ── Save (POST or PUT) ──
//     const handleSave = async () => {
//         if (!formData.siteID.trim()) { setErrorMsg("Site ID is required."); return; }
//         if (!formData.siteName.trim()) { setErrorMsg("Site Name is required."); return; }
//         setIsLoading(true);
//         setErrorMsg("");

//         try {
//             if (isNew) {
//                 // POST — create
//                 const payload: SiteRecord = {
//                     ...formData,
//                     createdBy: LOGGED_IN_USER_ID,
//                     modifiedBy: LOGGED_IN_USER_ID,
//                 };

//                 const res = await fetch(`${API_BASE_URL}/api/Site/create`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json", "accept": "*/*" },
//                     body: JSON.stringify(payload),
//                 });
//                 console.log("Payload:", payload);

//                 if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create."); }
//                 const updated = [...records, { ...formData }];
//                 setRecords(updated);
//                 setSelected({ ...formData });
//                 setSelectedIdx(updated.length - 1);
//                 showSuccess(`Site "${formData.siteID}" created.`);

//             } else if (isEditing && selected) {
//                 // PUT — update
//                 const payload: SiteRecord = {
//                     ...formData,
//                     modifiedBy: LOGGED_IN_USER_ID,
//                 };
//                 const res = await fetch(`${API_BASE_URL}/api/Site/updateSite`, {
//                     method: "PUT",
//                     headers: { "Content-Type": "application/json", "accept": "*/*" },
//                     body: JSON.stringify(payload),
//                 });
//                 if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update."); }
//                 const updated = records.map((r, i) => i === selectedIdx ? { ...formData } : r);
//                 setRecords(updated);
//                 setSelected({ ...formData });
//                 showSuccess(`Site "${formData.siteID}" updated.`);
//             }

//             setIsNew(false);
//             setIsEditing(false);

//         } catch (err) {
//             setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // ── Delete ──
//     const handleDelete = async () => {
//         if (!selected || isNew) return;
//         if (!window.confirm(`Delete site "${selected.siteID}"?`)) return;
//         setIsLoading(true);
//         try {
//             const res = await fetch(`${API_BASE_URL}/api/Site/deleteSite/${selected.siteGUID}`, {
//                 method: "DELETE",
//                 headers: { "accept": "*/*" },
//             });
//             if (!res.ok) throw new Error("Failed to delete.");
//             const updated = records.filter((_, i) => i !== selectedIdx);
//             setRecords(updated);
//             const next = updated[0] ?? null;
//             setSelected(next);
//             setSelectedIdx(next ? 0 : -1);
//             setFormData(next ? { ...next } : { ...EMPTY_SITE });
//             showSuccess("Site deleted.");
//         } catch (err) {
//             setErrorMsg(err instanceof Error ? err.message : "Failed to delete.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // ──────────────────────────────────────────
//     // ADDRESS MODAL handlers
//     // ──────────────────────────────────────────
//     const openAddAddress = () => {
//         setAddressForm({ ...EMPTY_ADDRESS });
//         setEditAddressIdx(-1);
//         setShowAddressModal(true);
//     };

//     const openEditAddress = (idx: number) => {
//         setAddressForm({ ...formData.addresses[idx] });
//         setEditAddressIdx(idx);
//         setShowAddressModal(true);
//     };

//     const handleAddressChange = (field: keyof Address, value: string | boolean | number) => {
//         setAddressForm(prev => ({ ...prev, [field]: value }));
//     };

//     const handleSaveAddress = () => {
//         if (!addressForm.address.trim()) { alert("Address is required."); return; }
//         const updatedAddresses = [...formData.addresses];
//         if (editAddressIdx === -1) {
//             updatedAddresses.push({ ...addressForm });
//         } else {
//             updatedAddresses[editAddressIdx] = { ...addressForm };
//         }
//         setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
//         setShowAddressModal(false);
//     };

//     const handleDeleteAddress = (idx: number) => {
//         const updatedAddresses = formData.addresses.filter((_, i) => i !== idx);
//         setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
//     };

//     const showSuccess = (msg: string) => {
//         setSuccessMsg(msg);
//         setTimeout(() => setSuccessMsg(""), 3000);
//     };

//     // const filteredRecords = records.filter(r =>
//     //     r.siteID.toLowerCase().includes(filterText.toLowerCase()) ||
//     //     r.siteName.toLowerCase().includes(filterText.toLowerCase())
//     // );

//     const editable = isNew || isEditing;

//     // ──────────────────────────────────────────
//     // JSX
//     // ──────────────────────────────────────────
//     return (
//         <div className="s-shell">

//             {/* ══ COMMAND BAR ══ */}
//             <div className="s-commandBar">
//                 <button className="s-cmd-icon-btn" title="Back">&#8592;</button>
//                 <button className="s-cmd-icon-btn s-cmd-hamburger">&#9776;</button>

//                 <div className="s-cmd-actions">
//                     <button className="s-cmd-btn s-cmd-save" onClick={handleSave} disabled={isLoading || (!isNew && !isEditing)}>
//                         <span>&#128190;</span> Save
//                     </button>
//                     <button className="s-cmd-btn" onClick={handleNew} disabled={isLoading}>
//                         <span>+</span> New
//                     </button>
//                     <button className="s-cmd-btn" onClick={handleDelete} disabled={isLoading || !selected || isNew}>
//                         <span>🗑</span> Delete
//                     </button>
//                 </div>

//                 <div className="s-cmd-divider" />
//                 <span className="s-cmd-tab s-cmd-tab-active">Options</span>
//                 <div className="s-cmd-right">
//                     <button className="s-cmd-icon-btn">&#128269;</button>
//                 </div>
//             </div>

//             {/* ══ BODY ══ */}
//             <div className="s-body">

//                 {/* ══ SIDEBAR ══ */}
//                 <div className="s-sidebar">
//                     <div className="s-sidebar-filter">
//                         <span className="s-filter-icon">&#128269;</span>
//                         <input
//                             type="text"
//                             placeholder="Filter"
//                             value={filterText}
//                             onChange={e => setFilterText(e.target.value)}
//                             className="s-filter-input"
//                         />
//                     </div>

//                     <div className="s-sidebar-list">
//                         {pageLoading && <p className="s-loading">Loading...</p>}

//                         {isNew && (
//                             <div className="s-sidebar-item s-sidebar-item-active">
//                                 <div className="s-item-code">{formData.siteID || "NEW"}</div>
//                                 <div className="s-item-desc">{formData.siteName || "New site"}</div>
//                             </div>
//                         )}

//                         {/* {filteredRecords.map((r, idx) => (
//                             // <div
//                             //     key={idx}
//                             //     className={`s-sidebar-item ${!isNew && selectedIdx === idx ? "s-sidebar-item-active" : ""}`}
//                             //     onClick={() => handleSelectSite(r, idx)}
//                             // >
//                             //     <div className="s-item-code">{r.siteID}</div>
//                             //     <div className="s-item-desc">{r.siteName}</div>
//                             // </div>
//                         )
//                         )
//                         } */}
//                     </div>
//                 </div>

//                 {/* ══ DETAIL PANEL ══ */}
//                 <div className="s-detail">

//                     <div className="s-std-view">Standard view &#8964;</div>
//                     <h1 className="s-detail-title">Sites</h1>

//                     {successMsg && <div className="s-successBar">✓ {successMsg}</div>}
//                     {errorMsg && <div className="s-errorBar">⚠ {errorMsg}</div>}

//                     {/* ── Header fields: Site, Name, Site Name In Arabic, Head Office, Cost Center ── */}
//                     <div className="s-header-card">
//                         <div className="s-header-fields">

//                             {/* Site ID */}
//                             <div className="s-field-group">
//                                 <label className="s-field-label">Site</label>
//                                 <input
//                                     className={`s-field-input s-field-short ${editable ? "s-active" : ""}`}
//                                     value={formData.siteID}
//                                     onChange={e => handleChange("siteID", e.target.value)}
//                                     disabled={!editable}
//                                     placeholder="Site ID"
//                                 />
//                             </div>

//                             {/* Site Name */}
//                             <div className="s-field-group">
//                                 <label className="s-field-label">Name</label>
//                                 <input
//                                     className={`s-field-input s-field-wide ${editable ? "s-active" : ""}`}
//                                     value={formData.siteName}
//                                     onChange={e => handleChange("siteName", e.target.value)}
//                                     disabled={!editable}
//                                     placeholder="Site name"
//                                 />
//                             </div>

//                         </div>

//                         {/* Edit / Cancel button */}
//                         <div className="s-header-actions">
//                             {!isNew && !isEditing && selected && (
//                                 <button className="s-btn-secondary" onClick={handleEdit}>✏ Edit</button>
//                             )}
//                             {(isNew || isEditing) && (
//                                 <button className="s-btn-secondary" onClick={handleCancel} disabled={isLoading}>Cancel</button>
//                             )}
//                         </div>
//                     </div>

//                 </div>
//             </div>

//             {/* ══ ADDRESS MODAL ══ */}
//             {showAddressModal && (
//                 <div className="s-modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddressModal(false)}>
//                     <div className="s-modal">
//                         <div className="s-modal-header">
//                             <span>{editAddressIdx === -1 ? "Add Address" : "Edit Address"}</span>
//                             <button className="s-modal-close" onClick={() => setShowAddressModal(false)}>×</button>
//                         </div>

//                         <div className="s-modal-body">
//                             <div className="s-modal-grid">

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">Address *</label>
//                                     <input className="s-field-input" value={addressForm.address} onChange={e => handleAddressChange("address", e.target.value)} placeholder="Full address" />
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">Party ID</label>
//                                     <input className="s-field-input" value={addressForm.partyID} onChange={e => handleAddressChange("partyID", e.target.value)} placeholder="Party ID" />
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">Party Type</label>
//                                     <select className="s-field-select" value={addressForm.partyType} onChange={e => handleAddressChange("partyType", Number(e.target.value))}>
//                                         {PARTY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//                                     </select>
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">Address Type</label>
//                                     <select className="s-field-select" value={addressForm.addressType} onChange={e => handleAddressChange("addressType", Number(e.target.value))}>
//                                         {ADDRESS_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//                                     </select>
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">City</label>
//                                     <input className="s-field-input" value={addressForm.city} onChange={e => handleAddressChange("city", e.target.value)} placeholder="City" />
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">State</label>
//                                     <input className="s-field-input" value={addressForm.state} onChange={e => handleAddressChange("state", e.target.value)} placeholder="State" />
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">Country</label>
//                                     <input className="s-field-input" value={addressForm.country} onChange={e => handleAddressChange("country", e.target.value)} placeholder="Country" />
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">Postal Code</label>
//                                     <input className="s-field-input" value={addressForm.postalCode} onChange={e => handleAddressChange("postalCode", e.target.value)} placeholder="Postal code" />
//                                 </div>

//                                 <div className="s-field-group">
//                                     <label className="s-field-label">Is Active</label>
//                                     <div className="s-toggle-row">
//                                         <Toggle
//                                             value={addressForm.isActive}
//                                             onChange={() => handleAddressChange("isActive", !addressForm.isActive)}
//                                         />
//                                         <span className="s-toggle-label">{addressForm.isActive ? "Yes" : "No"}</span>
//                                     </div>
//                                 </div>

//                             </div>
//                         </div>

//                         <div className="s-modal-footer">
//                             <button className="s-btn-secondary" onClick={() => setShowAddressModal(false)}>Cancel</button>
//                             <button className="s-btn-primary" onClick={handleSaveAddress}>
//                                 {editAddressIdx === -1 ? "Add" : "Update"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };

// export default SitesPage;









import React, { useState, useEffect } from "react";
import "./Site.css";


interface SiteRecord {
    SiteGUID: string;
    SiteID: string;
    SiteName: string;
    Description: string;
    DataAreaID: string;
    CreatedBy: string;
    ModifiedBy: string;
}



const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const API_BASE_URL = "http://192.168.0.106";

const EMPTY_SITE: SiteRecord = {
    SiteGUID: "",
    SiteID: "",
    SiteName: "",
    Description: "",
    DataAreaID: "",
    CreatedBy: LOGGED_IN_USER_ID,
    ModifiedBy: LOGGED_IN_USER_ID,
};


const Toggle: React.FC<{
    value: boolean;
    onChange?: () => void;
    disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
    <button
        type="button"
        className={`s-toggle ${value ? "s-toggle-on" : "s-toggle-off"}`}
        onClick={!disabled ? onChange : undefined}
        disabled={disabled}
    >
        <span className="s-toggle-thumb" />
    </button>
);

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
const SitesPage: React.FC = () => {

    const [records, setRecords] = useState<SiteRecord[]>([]);
    const [selected, setSelected] = useState<SiteRecord | null>(null);
    const [selectedIdx, setSelectedIdx] = useState<number>(-1);
    const [formData, setFormData] = useState<SiteRecord>({ ...EMPTY_SITE });
    const [filterText, setFilterText] = useState<string>("");
    const [isNew, setIsNew] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);

    // ── NEW: store the logged-in user's dataAreaID ──
    const [userDataAreaID, setUserDataAreaID] = useState<string>("");

    // Address modal state
    const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
    const [editAddressIdx, setEditAddressIdx] = useState<number>(-1);

    // Section collapse state
    const [generalOpen, setGeneralOpen] = useState<boolean>(true);
    const [addressesOpen, setAddressesOpen] = useState<boolean>(true);

    // ── NEW: fetch logged-in user's dataAreaID on mount ──
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/User/GetByID/${LOGGED_IN_USER_ID}`,
                    {
                        headers: { "accept": "*/*" },
                    });
                if (!res.ok) throw new Error("Failed to fetch user.");
                const user = await res.json();
                // Adjust "user.DataAreaID" to match the actual field name in your API response
                setUserDataAreaID(user.DataAreaID ?? "");
            } catch (err) {
                console.error("Could not load user DataAreaID:", err);
            }
        };
        loadUser();
    }, []);

    // ── GET all sites on load ──
    useEffect(() => {
        const load = async () => {
            try {
                setPageLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/Site/GetByDataAreaID`, {
                    headers: { "accept": "*/*" },
                });
                if (!res.ok) throw new Error("Failed to fetch sites.");
                const data: SiteRecord[] = await res.json();
                setRecords(data);
                if (data.length > 0) {
                    setSelected(data[0]);
                    setSelectedIdx(0);
                    setFormData({ ...data[0] });
                }
            } catch (err) {
                setErrorMsg("Could not load sites. Please refresh.");
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };
        load();
    }, []);

    // ── Select site from sidebar ──
    const handleSelectSite = (site: SiteRecord, idx: number) => {
        if (isNew || isEditing) return;
        setSelected(site);
        setSelectedIdx(idx);
        setErrorMsg("");
    };

    // ── Form field change ──
    const handleChange = (field: keyof SiteRecord, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ── + New ──
    const handleNew = () => {
        setIsNew(true);
        setIsEditing(false);
        setSelected(null);
        setSelectedIdx(-1);
        setErrorMsg("");
    };

    // ── Edit ──
    const handleEdit = () => {
        if (!selected) return;
        setIsEditing(true);
        setIsNew(false);
        setErrorMsg("");
    };

    // ── Cancel ──
    const handleCancel = () => {
        setIsNew(false);
        setIsEditing(false);
        setErrorMsg("");
    };


    const handleSave = async () => {
        if (!formData.SiteID.trim()) { setErrorMsg("Site ID is required."); return; }
        if (!formData.SiteName.trim()) { setErrorMsg("Site Name is required."); return; }

        // ── NEW: guard against missing dataAreaID ──
        if (!userDataAreaID) {
            setErrorMsg("User data area could not be determined. Please refresh and try again.");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            if (isNew) {
                // POST — create
                const payload: SiteRecord = {
                    ...formData,
                    DataAreaID: userDataAreaID,       // ← auto-filled from user context
                    CreatedBy: LOGGED_IN_USER_ID,
                    ModifiedBy: LOGGED_IN_USER_ID,
                };

                console.log("Payload:", payload);

                const res = await fetch(`${API_BASE_URL}/api/Site/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "accept": "*/*" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create."); }
                const updated = [...records, { ...formData, DataAreaID: userDataAreaID }];
                setRecords(updated);
                setSelected({ ...formData, DataAreaID: userDataAreaID });
                setSelectedIdx(updated.length - 1);
                showSuccess(`Site "${formData.SiteID}" created.`);

            } else if (isEditing && selected) {
                // PUT — update
                const payload: SiteRecord = {
                    ...formData,
                    ModifiedBy: LOGGED_IN_USER_ID,
                };
                const res = await fetch(`${API_BASE_URL}/api/Site/updateSite`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "accept": "*/*" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update."); }
                const updated = records.map((r, i) => i === selectedIdx ? { ...formData } : r);
                setRecords(updated);
                setSelected({ ...formData });
                showSuccess(`Site "${formData.SiteID}" updated.`);
            }

            setIsNew(false);
            setIsEditing(false);

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Delete ──
    const handleDelete = async () => {
        if (!selected || isNew) return;
        if (!window.confirm(`Delete site "${selected.SiteID}"?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/Site/deleteSite/${selected.SiteGUID}`, {
                method: "DELETE",
                headers: { "accept": "*/*" },
            });
            if (!res.ok) throw new Error("Failed to delete.");
            const updated = records.filter((_, i) => i !== selectedIdx);
            setRecords(updated);
            const next = updated[0] ?? null;
            setSelected(next);
            setSelectedIdx(next ? 0 : -1);
            setFormData(next ? { ...next } : { ...EMPTY_SITE });
            showSuccess("Site deleted.");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to delete.");
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const editable = isNew || isEditing;

    // ──────────────────────────────────────────
    // JSX
    // ──────────────────────────────────────────
    return (
        <div className="s-shell">

            {/* ══ COMMAND BAR ══ */}
            <div className="s-commandBar">
                <button className="s-cmd-icon-btn" title="Back">&#8592;</button>
                <button className="s-cmd-icon-btn s-cmd-hamburger">&#9776;</button>

                <div className="s-cmd-actions">
                    <button className="s-cmd-btn s-cmd-save" onClick={handleSave} disabled={isLoading || (!isNew && !isEditing)}>
                        <span>&#128190;</span> Save
                    </button>
                    <button className="s-cmd-btn" onClick={handleNew} disabled={isLoading}>
                        <span>+</span> New
                    </button>
                    <button className="s-cmd-btn" onClick={handleDelete} disabled={isLoading || !selected || isNew}>
                        <span>🗑</span> Delete
                    </button>
                </div>

                <div className="s-cmd-divider" />
                <span className="s-cmd-tab s-cmd-tab-active">Options</span>
                <div className="s-cmd-right">
                    <button className="s-cmd-icon-btn">&#128269;</button>
                </div>
            </div>

            {/* ══ BODY ══ */}
            <div className="s-body">

                {/* ══ SIDEBAR ══ */}
                <div className="s-sidebar">
                    <div className="s-sidebar-filter">
                        <span className="s-filter-icon">&#128269;</span>
                        <input
                            type="text"
                            placeholder="Filter"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            className="s-filter-input"
                        />
                    </div>

                    <div className="s-sidebar-list">
                        {pageLoading && <p className="s-loading">Loading...</p>}

                        {isNew && (
                            <div className="s-sidebar-item s-sidebar-item-active">
                                <div className="s-item-code">{formData.SiteID || "NEW"}</div>
                                <div className="s-item-desc">{formData.SiteName || "New site"}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══ DETAIL PANEL ══ */}
                <div className="s-detail">

                    <div className="s-std-view">Standard view &#8964;</div>
                    <h1 className="s-detail-title">Site</h1>

                    {successMsg && <div className="s-successBar">✓ {successMsg}</div>}
                    {errorMsg && <div className="s-errorBar">⚠ {errorMsg}</div>}

                    <div className="s-header-card">
                        <div className="s-header-fields">

                            {/* Site ID */}
                            <div className="s-field-group">
                                <label className="s-field-label">Site</label>
                                <input
                                    className={`s-field-input s-field-short ${editable ? "s-active" : ""}`}
                                    value={formData.SiteID}
                                    onChange={e => handleChange("SiteID", e.target.value)}
                                    disabled={!editable}
                                    placeholder="Site ID"
                                />
                            </div>

                            {/* Site Name */}
                            <div className="s-field-group">
                                <label className="s-field-label">Name</label>
                                <input
                                    className={`s-field-input s-field-wide ${editable ? "s-active" : ""}`}
                                    value={formData.SiteName}
                                    onChange={e => handleChange("SiteName", e.target.value)}
                                    disabled={!editable}
                                    placeholder="Site name"
                                />
                            </div>

                        </div>

                        {/* Edit / Cancel button */}
                        <div className="s-header-actions">
                            {!isNew && !isEditing && selected && (
                                <button className="s-btn-secondary" onClick={handleEdit}>✏ Edit</button>
                            )}
                            {(isNew || isEditing) && (
                                <button className="s-btn-secondary" onClick={handleCancel} disabled={isLoading}>Cancel</button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ══ ADDRESS MODAL ══ */}
            {showAddressModal && (
                <div className="s-modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddressModal(false)}>
                    <div className="s-modal">
                        <div className="s-modal-header">
                            <span>{editAddressIdx === -1 ? "Add Address" : "Edit Address"}</span>
                            <button className="s-modal-close" onClick={() => setShowAddressModal(false)}>×</button>
                        </div>
                        <div className="s-modal-footer">
                            <button className="s-btn-secondary" onClick={() => setShowAddressModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SitesPage;