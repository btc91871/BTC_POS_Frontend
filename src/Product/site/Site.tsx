import React, { useState, useEffect } from "react";
import "./Site.css";

// ─── Site record (matches GET Data array items) ────────────────────────────
interface SiteRecord {
    Guid: string;
    SITEID: string;
    SITENAME: string;
    DESCRIPTION: string;
    DATAAREAID: string;
}

// ─── API wrapper (every response has this shape) ───────────────────────────
interface ApiResponse<T> {
    Success: boolean;
    Message: string;
    Data: T;
    Errors: string[] | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────
const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const API_BASE_URL = "http://192.168.0.104";
const DATA_AREA_ID = "IND";

const EMPTY_SITE: SiteRecord = {
    Guid: "",
    SITEID: "",
    SITENAME: "",
    DESCRIPTION: "",
    DATAAREAID: DATA_AREA_ID,
};

// ─── Main Component ─────────────────────────────────────────────────────────
const SitesPage: React.FC = () => {

    const [sites, setSites] = useState<SiteRecord[]>([]);
    const [selectedSite, setSelectedSite] = useState<SiteRecord | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [form, setForm] = useState<SiteRecord>({ ...EMPTY_SITE });
    const [filterText, setFilterText] = useState<string>("");
    const [isNew, setIsNew] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);

    // ── GET: Load all sites on mount ────────────────────────────────────────
    useEffect(() => {
        const fetchSites = async () => {
            try {
                setPageLoading(true);

                const res = await fetch(
                    `${API_BASE_URL}/api/Site/GetByDataAreaID?dataAreaId=${DATA_AREA_ID}`,
                    { headers: { "accept": "*/*" } }
                );

                if (!res.ok) throw new Error(`GET failed: ${res.status}`);

                const json: ApiResponse<SiteRecord[]> = await res.json();
                if (!json.Success) throw new Error(json.Message || "Failed to load sites.");

                const data = json.Data;
                setSites(data);

                if (data.length > 0) {
                    setSelectedSite(data[0]);
                    setSelectedIndex(0);
                    setForm({ ...data[0] });
                }

            } catch (err) {
                setErrorMsg(err instanceof Error ? err.message : "Could not load sites.");
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };

        fetchSites();
    }, []);

    // ── Form field change ───────────────────────────────────────────────────
    const handleFormChange = (field: keyof SiteRecord, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // ── Select site from sidebar ────────────────────────────────────────────
    const handleSelectSite = (site: SiteRecord, index: number) => {
        if (isNew || isEditing) return;
        setSelectedSite(site);
        setSelectedIndex(index);
        setForm({ ...site });
        setErrorMsg("");
    };

    // ── New button ──────────────────────────────────────────────────────────
    const handleNew = () => {
        setIsNew(true);
        setIsEditing(false);
        setSelectedSite(null);
        setSelectedIndex(-1);
        setForm({ ...EMPTY_SITE });
        setErrorMsg("");
    };

    // ── Edit button ─────────────────────────────────────────────────────────
    const handleEdit = () => {
        if (!selectedSite) return;
        setIsEditing(true);
        setIsNew(false);
        setErrorMsg("");
    };

    // ── Cancel button ───────────────────────────────────────────────────────
    const handleCancel = () => {
        setIsNew(false);
        setIsEditing(false);
        setErrorMsg("");
        if (selectedSite) setForm({ ...selectedSite });
    };

    // ── POST: Create new site ───────────────────────────────────────────────
    const handleCreate = async () => {
        if (!form.SITEID.trim()) { setErrorMsg("Site ID is required."); return; }
        if (!form.SITENAME.trim()) { setErrorMsg("Site Name is required."); return; }

        setIsLoading(true);
        setErrorMsg("");

        try {
            const postBody = {
                SiteGUID: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                SiteID: form.SITEID,
                SiteName: form.SITENAME,
                Description: form.DESCRIPTION,
                DataAreaID: DATA_AREA_ID,
                CreatedBy: LOGGED_IN_USER_ID,
                ModifiedBy: LOGGED_IN_USER_ID,
            };

            const res = await fetch(`${API_BASE_URL}/api/Site/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "accept": "*/*" },
                body: JSON.stringify(postBody),
            });

            if (!res.ok) throw new Error(`POST failed: ${res.status}`);

            const json: ApiResponse<{ SiteGUID: string; SiteID: string; SiteName: string }> = await res.json();
            if (!json.Success) throw new Error(json.Message || "Failed to create site.");

            const newRecord: SiteRecord = {
                Guid: json.Data.SiteGUID,
                SITEID: json.Data.SiteID,
                SITENAME: json.Data.SiteName,
                DESCRIPTION: form.DESCRIPTION,
                DATAAREAID: DATA_AREA_ID,
            };

            const updatedSites = [...sites, newRecord];
            setSites(updatedSites);
            setSelectedSite(newRecord);
            setSelectedIndex(updatedSites.length - 1);
            setIsNew(false);
            showSuccess(json.Message || `Site "${form.SITEID}" created.`);

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── PUT: Update existing site ───────────────────────────────────────────
    const handleUpdate = async () => {
        if (!form.SITEID.trim()) { setErrorMsg("Site ID is required."); return; }
        if (!form.SITENAME.trim()) { setErrorMsg("Site Name is required."); return; }
        if (!selectedSite) return;

        // Log so we can see exactly what GUID is being sent
        console.log("Updating site with GUID:", selectedSite.Guid);

        setIsLoading(true);
        setErrorMsg("");

        try {
            // PUT body — GUID comes from the selectedSite loaded from GET, not hardcoded
            const putBody = {
                SiteGUID: selectedSite.Guid,   // 🔥 FIXED
                SiteID: form.SITEID,
                SiteName: form.SITENAME,
                Description: form.DESCRIPTION,
                DataAreaID: form.DATAAREAID,
                ModifiedBy: LOGGED_IN_USER_ID, // 🔥 often required
            };

            console.log("PUT body:", putBody);
            console.log("GUID being sent:", selectedSite.Guid);

            const res = await fetch(`${API_BASE_URL}/api/Site/updateSiteById`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "accept": "*/*" },
                body: JSON.stringify(putBody),
            });

            if (!res.ok) throw new Error(`PUT failed: ${res.status}`);

            const json: ApiResponse<unknown> = await res.json();

            // Show API error details if it fails
            if (!json.Success) {
                const detail = json.Errors ? json.Errors[0] : json.Message;
                throw new Error(detail || "Failed to update site.");
            }

            // Update the site in local list
            const updatedRecord: SiteRecord = { ...form, Guid: selectedSite.Guid };
            const updatedSites = sites.map((s, i) => i === selectedIndex ? updatedRecord : s);
            setSites(updatedSites);
            setSelectedSite(updatedRecord);
            setIsEditing(false);
            showSuccess(json.Message || `Site "${form.SITEID}" updated.`);

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── DELETE: Delete selected site ────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedSite) return;
        if (!window.confirm(`Delete site "${selectedSite.SITEID}"?`)) return;

        console.log("Deleting site with GUID:", selectedSite.Guid);

        setIsLoading(true);
        setErrorMsg("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/Site/DeleteSiteById`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "accept": "*/*" },
                body: JSON.stringify({ SiteGUID: selectedSite.Guid }),
            });

            if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);

            const json: ApiResponse<unknown> = await res.json();

            if (!json.Success) {
                const detail = json.Errors ? json.Errors[0] : json.Message;
                throw new Error(detail || "Failed to delete site.");
            }

            const updatedSites = sites.filter((_, i) => i !== selectedIndex);
            setSites(updatedSites);

            const next = updatedSites[0] ?? null;
            setSelectedSite(next);
            setSelectedIndex(next ? 0 : -1);
            setForm(next ? { ...next } : { ...EMPTY_SITE });

            showSuccess(json.Message || "Site deleted.");

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to delete.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Save — routes to create or update ──────────────────────────────────
    const handleSave = () => {
        if (isNew) handleCreate();
        else if (isEditing) handleUpdate();
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const formIsEditable = isNew || isEditing;

    const filteredSites = sites.filter(site =>
        site.SITEID.toLowerCase().includes(filterText.toLowerCase()) ||
        site.SITENAME.toLowerCase().includes(filterText.toLowerCase())
    );

    // ─── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="s-shell">

            {/* Command bar */}
            <div className="s-commandBar">
                <button className="s-cmd-icon-btn" title="Back">&#8592;</button>
                <button className="s-cmd-icon-btn s-cmd-hamburger">&#9776;</button>

                <div className="s-cmd-actions">
                    <button
                        className="s-cmd-btn s-cmd-save"
                        onClick={handleSave}
                        disabled={isLoading || (!isNew && !isEditing)}
                    >
                        <span>&#128190;</span> Save
                    </button>
                    <button
                        className="s-cmd-btn"
                        onClick={handleNew}
                        disabled={isLoading || isNew || isEditing}
                    >
                        <span>+</span> New
                    </button>
                    <button
                        className="s-cmd-btn"
                        onClick={handleDelete}
                        disabled={isLoading || !selectedSite || isNew || isEditing}
                    >
                        <span>🗑</span> Delete
                    </button>
                </div>

                <div className="s-cmd-divider" />
                <span className="s-cmd-tab s-cmd-tab-active">Options</span>
            </div>

            {/* Body */}
            <div className="s-body">

                {/* Sidebar */}
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
                                <div className="s-item-code">{form.SITEID || "NEW"}</div>
                                <div className="s-item-desc">{form.SITENAME || "New site"}</div>
                            </div>
                        )}

                        {filteredSites.map((site, index) => (
                            <div
                                key={site.Guid || index}
                                className={`s-sidebar-item ${selectedIndex === index && !isNew ? "s-sidebar-item-active" : ""}`}
                                onClick={() => handleSelectSite(site, index)}
                            >
                                <div className="s-item-code">{site.SITEID}</div>
                                <div className="s-item-desc">{site.SITENAME}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="s-detail">
                    <div className="s-std-view">Standard view &#8964;</div>
                    <h1 className="s-detail-title">Site</h1>

                    {successMsg && <div className="s-successBar">✓ {successMsg}</div>}
                    {errorMsg && <div className="s-errorBar">⚠ {errorMsg}</div>}

                    <div className="s-header-card">
                        <div className="s-header-fields">

                            <div className="s-field-group">
                                <label className="s-field-label">Site ID</label>
                                <input
                                    className={`s-field-input s-field-short ${formIsEditable ? "s-active" : ""}`}
                                    value={form.SITEID}
                                    onChange={e => handleFormChange("SITEID", e.target.value)}
                                    disabled={!formIsEditable}
                                    placeholder="Site ID"
                                />
                            </div>

                            <div className="s-field-group">
                                <label className="s-field-label">Name</label>
                                <input
                                    className={`s-field-input s-field-wide ${formIsEditable ? "s-active" : ""}`}
                                    value={form.SITENAME}
                                    onChange={e => handleFormChange("SITENAME", e.target.value)}
                                    disabled={!formIsEditable}
                                    placeholder="Site name"
                                />
                            </div>

                            <div className="s-field-group">
                                <label className="s-field-label">Description</label>
                                <input
                                    className={`s-field-input s-field-wide ${formIsEditable ? "s-active" : ""}`}
                                    value={form.DESCRIPTION}
                                    onChange={e => handleFormChange("DESCRIPTION", e.target.value)}
                                    disabled={!formIsEditable}
                                    placeholder="Description"
                                />
                            </div>

                        </div>

                        <div className="s-header-actions">
                            {!isNew && !isEditing && selectedSite && (
                                <button className="s-btn-secondary" onClick={handleEdit} disabled={isLoading}>
                                    ✏ Edit
                                </button>
                            )}
                            {(isNew || isEditing) && (
                                <button className="s-btn-secondary" onClick={handleCancel} disabled={isLoading}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default SitesPage;











// import React, { useState, useEffect } from "react";
// import "./Site.css";

// // ─── Site record (matches GET Data array items) ────────────────────────────
// interface SiteRecord {
//     Guid: string;
//     SITEID: string;
//     SITENAME: string;
//     DESCRIPTION: string;
//     DATAAREAID: string;
// }

// // ─── API wrapper (every response has this shape) ───────────────────────────
// interface ApiResponse<T> {
//     Success: boolean;
//     Message: string;
//     Data: T;
//     Errors: string | null;
// }

// // ─── Constants ─────────────────────────────────────────────────────────────
// const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
// const API_BASE_URL = "http://192.168.0.105";
// const DATA_AREA_ID = "IND";

// const EMPTY_SITE: SiteRecord = {
//     Guid: "",
//     SITEID: "",
//     SITENAME: "",
//     DESCRIPTION: "",
//     DATAAREAID: DATA_AREA_ID,
// };

// // ─── Main Component ─────────────────────────────────────────────────────────
// const SitesPage: React.FC = () => {

//     const [sites, setSites] = useState<SiteRecord[]>([]);
//     const [selectedSite, setSelectedSite] = useState<SiteRecord | null>(null);
//     const [selectedIndex, setSelectedIndex] = useState<number>(-1);
//     const [form, setForm] = useState<SiteRecord>({ ...EMPTY_SITE });
//     const [filterText, setFilterText] = useState<string>("");
//     const [isNew, setIsNew] = useState<boolean>(false);
//     const [isEditing, setIsEditing] = useState<boolean>(false);
//     const [successMsg, setSuccessMsg] = useState<string>("");
//     const [errorMsg, setErrorMsg] = useState<string>("");
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [pageLoading, setPageLoading] = useState<boolean>(true);

//     // ── GET: Load all sites on mount ────────────────────────────────────────
//     useEffect(() => {
//         const fetchSites = async () => {
//             try {
//                 setPageLoading(true);

//                 const res = await fetch(
//                     `${API_BASE_URL}/api/Site/GetByDataAreaID?dataAreaId=${DATA_AREA_ID}`,
//                     { headers: { "accept": "*/*" } }
//                 );

//                 if (!res.ok) throw new Error(`GET failed: ${res.status}`);

//                 const json: ApiResponse<SiteRecord[]> = await res.json();

//                 if (!json.Success) throw new Error(json.Message || "Failed to load sites.");

//                 const data = json.Data;
//                 setSites(data);

//                 if (data.length > 0) {
//                     setSelectedSite(data[0]);
//                     setSelectedIndex(0);
//                     setForm({ ...data[0] });
//                 }

//             } catch (err) {
//                 setErrorMsg(err instanceof Error ? err.message : "Could not load sites.");
//                 console.error(err);
//             } finally {
//                 setPageLoading(false);
//             }
//         };

//         fetchSites();
//     }, []);

//     // ── Form field change ───────────────────────────────────────────────────
//     const handleFormChange = (field: keyof SiteRecord, value: string) => {
//         setForm(prev => ({ ...prev, [field]: value }));
//     };

//     // ── Select site from sidebar ────────────────────────────────────────────
//     const handleSelectSite = (site: SiteRecord, index: number) => {
//         if (isNew || isEditing) return;
//         setSelectedSite(site);
//         setSelectedIndex(index);
//         setForm({ ...site });
//         setErrorMsg("");
//     };

//     // ── New button ──────────────────────────────────────────────────────────
//     const handleNew = () => {
//         setIsNew(true);
//         setIsEditing(false);
//         setSelectedSite(null);
//         setSelectedIndex(-1);
//         setForm({ ...EMPTY_SITE });
//         setErrorMsg("");
//     };

//     // ── Edit button ─────────────────────────────────────────────────────────
//     const handleEdit = () => {
//         if (!selectedSite) return;
//         setIsEditing(true);
//         setIsNew(false);
//         setErrorMsg("");
//     };

//     // ── Cancel button ───────────────────────────────────────────────────────
//     const handleCancel = () => {
//         setIsNew(false);
//         setIsEditing(false);
//         setErrorMsg("");
//         if (selectedSite) setForm({ ...selectedSite });
//     };

//     // ── POST: Create new site ───────────────────────────────────────────────
//     const handleCreate = async () => {
//         if (!form.SITEID.trim()) { setErrorMsg("Site ID is required."); return; }
//         if (!form.SITENAME.trim()) { setErrorMsg("Site Name is required."); return; }

//         setIsLoading(true);
//         setErrorMsg("");

//         try {
//             const postBody = {
//                 SiteGUID: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//                 SiteID: form.SITEID,
//                 SiteName: form.SITENAME,
//                 Description: form.DESCRIPTION,
//                 DataAreaID: DATA_AREA_ID,
//                 CreatedBy: LOGGED_IN_USER_ID,
//                 ModifiedBy: LOGGED_IN_USER_ID,
//             };

//             const res = await fetch(`${API_BASE_URL}/api/Site/create`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json", "accept": "*/*" },
//                 body: JSON.stringify(postBody),
//             });

//             if (!res.ok) throw new Error(`POST failed: ${res.status}`);

//             const json: ApiResponse<{ SiteGUID: string; SiteID: string; SiteName: string }> = await res.json();

//             if (!json.Success) throw new Error(json.Message || "Failed to create site.");

//             const newRecord: SiteRecord = {
//                 Guid: json.Data.SiteGUID,
//                 SITEID: json.Data.SiteID,
//                 SITENAME: json.Data.SiteName,
//                 DESCRIPTION: form.DESCRIPTION,
//                 DATAAREAID: DATA_AREA_ID,
//             };

//             const updatedSites = [...sites, newRecord];
//             setSites(updatedSites);
//             setSelectedSite(newRecord);
//             setSelectedIndex(updatedSites.length - 1);
//             setIsNew(false);
//             showSuccess(json.Message || `Site "${form.SITEID}" created.`);

//         } catch (err) {
//             setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // ── PUT: Update existing site ───────────────────────────────────────────
//     const handleUpdate = async () => {
//         if (!form.SITEID.trim()) { setErrorMsg("Site ID is required."); return; }
//         if (!form.SITENAME.trim()) { setErrorMsg("Site Name is required."); return; }
//         if (!selectedSite) return;

//         setIsLoading(true);
//         setErrorMsg("");

//         try {
//             // PUT body schema: { GUID, SITEID, SITENAME, DESCRIPTION, DATAAREAID }
//             const putBody = {
//                 GUID: selectedSite.Guid,
//                 SITEID: form.SITEID,
//                 SITENAME: form.SITENAME,
//                 DESCRIPTION: form.DESCRIPTION,
//                 DATAAREAID: form.DATAAREAID,
//             };

//             const res = await fetch(`${API_BASE_URL}/api/Site/updateSiteById`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json", "accept": "*/*" },
//                 body: JSON.stringify(putBody),
//             });

//             if (!res.ok) throw new Error(`PUT failed: ${res.status}`);

//             const json: ApiResponse<unknown> = await res.json();

//             if (!json.Success) throw new Error(json.Message || "Failed to update site.");

//             // Update the site in the local list
//             const updatedRecord: SiteRecord = { ...form, Guid: selectedSite.Guid };
//             const updatedSites = sites.map((s, i) => i === selectedIndex ? updatedRecord : s);
//             setSites(updatedSites);
//             setSelectedSite(updatedRecord);
//             setIsEditing(false);
//             showSuccess(json.Message || `Site "${form.SITEID}" updated.`);

//         } catch (err) {
//             setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // ── DELETE: Delete selected site ────────────────────────────────────────
//     const handleDelete = async () => {
//         if (!selectedSite) return;
//         if (!window.confirm(`Delete site "${selectedSite.SITEID}"?`)) return;

//         setIsLoading(true);
//         setErrorMsg("");

//         try {
//             // DELETE body schema: { Guid }
//             const res = await fetch(`${API_BASE_URL}/api/Site/DeleteSiteById`, {
//                 method: "DELETE",
//                 headers: { "Content-Type": "application/json", "accept": "*/*" },
//                 body: JSON.stringify({ Guid: selectedSite.Guid }),
//             });

//             if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);

//             const json: ApiResponse<unknown> = await res.json();

//             if (!json.Success) throw new Error(json.Message || "Failed to delete site.");

//             // Remove from local list and select the first remaining site
//             const updatedSites = sites.filter((_, i) => i !== selectedIndex);
//             setSites(updatedSites);

//             const next = updatedSites[0] ?? null;
//             setSelectedSite(next);
//             setSelectedIndex(next ? 0 : -1);
//             setForm(next ? { ...next } : { ...EMPTY_SITE });

//             showSuccess(json.Message || `Site deleted.`);

//         } catch (err) {
//             setErrorMsg(err instanceof Error ? err.message : "Failed to delete.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // ── Save button — decides create or update ──────────────────────────────
//     const handleSave = () => {
//         if (isNew) handleCreate();
//         else if (isEditing) handleUpdate();
//     };

//     const showSuccess = (msg: string) => {
//         setSuccessMsg(msg);
//         setTimeout(() => setSuccessMsg(""), 3000);
//     };

//     const formIsEditable = isNew || isEditing;

//     const filteredSites = sites.filter(site =>
//         site.SITEID.toLowerCase().includes(filterText.toLowerCase()) ||
//         site.SITENAME.toLowerCase().includes(filterText.toLowerCase())
//     );

//     // ─── Render ─────────────────────────────────────────────────────────────
//     return (
//         <div className="s-shell">

//             {/* Command bar */}
//             <div className="s-commandBar">
//                 <button className="s-cmd-icon-btn" title="Back">&#8592;</button>
//                 <button className="s-cmd-icon-btn s-cmd-hamburger">&#9776;</button>

//                 <div className="s-cmd-actions">
//                     <button
//                         className="s-cmd-btn s-cmd-save"
//                         onClick={handleSave}
//                         disabled={isLoading || (!isNew && !isEditing)}
//                     >
//                         <span>&#128190;</span> Save
//                     </button>
//                     <button
//                         className="s-cmd-btn"
//                         onClick={handleNew}
//                         disabled={isLoading || isNew || isEditing}
//                     >
//                         <span>+</span> New
//                     </button>
//                     <button
//                         className="s-cmd-btn"
//                         onClick={handleDelete}
//                         disabled={isLoading || !selectedSite || isNew || isEditing}
//                     >
//                         <span>🗑</span> Delete
//                     </button>
//                 </div>

//                 <div className="s-cmd-divider" />
//                 <span className="s-cmd-tab s-cmd-tab-active">Options</span>
//             </div>

//             {/* Body */}
//             <div className="s-body">

//                 {/* Sidebar */}
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

//                         {/* New unsaved site shown at top */}
//                         {isNew && (
//                             <div className="s-sidebar-item s-sidebar-item-active">
//                                 <div className="s-item-code">{form.SITEID || "NEW"}</div>
//                                 <div className="s-item-desc">{form.SITENAME || "New site"}</div>
//                             </div>
//                         )}

//                         {/* Existing sites */}
//                         {filteredSites.map((site, index) => (
//                             <div
//                                 key={site.Guid || index}
//                                 className={`s-sidebar-item ${selectedIndex === index && !isNew ? "s-sidebar-item-active" : ""}`}
//                                 onClick={() => handleSelectSite(site, index)}
//                             >
//                                 <div className="s-item-code">{site.SITEID}</div>
//                                 <div className="s-item-desc">{site.SITENAME}</div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Detail panel */}
//                 <div className="s-detail">
//                     <div className="s-std-view">Standard view &#8964;</div>
//                     <h1 className="s-detail-title">Site</h1>

//                     {successMsg && <div className="s-successBar">✓ {successMsg}</div>}
//                     {errorMsg && <div className="s-errorBar">⚠ {errorMsg}</div>}

//                     <div className="s-header-card">
//                         <div className="s-header-fields">

//                             <div className="s-field-group">
//                                 <label className="s-field-label">Site ID</label>
//                                 <input
//                                     className={`s-field-input s-field-short ${formIsEditable ? "s-active" : ""}`}
//                                     value={form.SITEID}
//                                     onChange={e => handleFormChange("SITEID", e.target.value)}
//                                     disabled={!formIsEditable}
//                                     placeholder="Site ID"
//                                 />
//                             </div>

//                             <div className="s-field-group">
//                                 <label className="s-field-label">Name</label>
//                                 <input
//                                     className={`s-field-input s-field-wide ${formIsEditable ? "s-active" : ""}`}
//                                     value={form.SITENAME}
//                                     onChange={e => handleFormChange("SITENAME", e.target.value)}
//                                     disabled={!formIsEditable}
//                                     placeholder="Site name"
//                                 />
//                             </div>

//                             <div className="s-field-group">
//                                 <label className="s-field-label">Description</label>
//                                 <input
//                                     className={`s-field-input s-field-wide ${formIsEditable ? "s-active" : ""}`}
//                                     value={form.DESCRIPTION}
//                                     onChange={e => handleFormChange("DESCRIPTION", e.target.value)}
//                                     disabled={!formIsEditable}
//                                     placeholder="Description"
//                                 />
//                             </div>

//                         </div>

//                         {/* Edit / Cancel buttons */}
//                         <div className="s-header-actions">
//                             {!isNew && !isEditing && selectedSite && (
//                                 <button className="s-btn-secondary" onClick={handleEdit} disabled={isLoading}>
//                                     ✏ Edit
//                                 </button>
//                             )}
//                             {(isNew || isEditing) && (
//                                 <button className="s-btn-secondary" onClick={handleCancel} disabled={isLoading}>
//                                     Cancel
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                 </div>
//             </div>

//         </div>
//     );
// };

// export default SitesPage;











