import React, { useState, useEffect } from "react";
import "./storage.css";


interface StorageDimGroupRecord {
    storagedimgroupname: string;
    storagedimgroupdescription: string;
    createdby: string;
    modifiedby: string;
}

// ──────────────────────────────────────────────
// AUTH — auto from login
// ──────────────────────────────────────────────
const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const API_BASE_URL = "http://192.168.0.104";

const EMPTY: StorageDimGroupRecord = {
    storagedimgroupname: "",
    storagedimgroupdescription: "",
    createdby: LOGGED_IN_USER_ID,
    modifiedby: LOGGED_IN_USER_ID,
};


const StorageDimGroupPage: React.FC = () => {

    const [records, setRecords] = useState<StorageDimGroupRecord[]>([]);
    const [selected, setSelected] = useState<StorageDimGroupRecord | null>(null);
    const [selectedIdx, setSelectedIdx] = useState<number>(-1);
    const [formData, setFormData] = useState<StorageDimGroupRecord>({ ...EMPTY });
    const [filterText, setFilterText] = useState<string>("");
    const [isNew, setIsNew] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);


    useEffect(() => {
        const load = async () => {
            try {
                setPageLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/StorageDimension/getAllStorageDimensionGroups`, {
                    headers: { "accept": "*/*" },
                });
                if (!res.ok) throw new Error("Failed to fetch.");
                const data: StorageDimGroupRecord[] = await res.json();
                setRecords(data);
                if (data.length > 0) {
                    setSelected(data[0]);
                    setSelectedIdx(0);
                    setFormData({ ...data[0] });
                }
            } catch (err) {
                setErrorMsg("Could not load records. Please refresh.");
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };
        load();
    }, []);



    const handleSelect = (item: StorageDimGroupRecord, idx: number) => {
        if (isNew || isEditing) return;
        setSelected(item);
        setSelectedIdx(idx);
        setFormData({ ...item });
        setErrorMsg("");
    };

    const handleChange = (field: keyof StorageDimGroupRecord, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ── + New ──
    const handleNew = () => {
        setIsNew(true);
        setIsEditing(false);
        setSelected(null);
        setSelectedIdx(-1);
        setFormData({ ...EMPTY });
        setErrorMsg("");
    };

    // ── Cancel ──
    const handleCancel = () => {
        setIsNew(false);
        setIsEditing(false);
        if (selected) setFormData({ ...selected });
        setErrorMsg("");
    };

    // ── Save (POST or PUT) ──
    const handleSave = async () => {
        if (!formData.storagedimgroupname.trim()) {
            setErrorMsg("Name is required.");
            return;
        }
        setIsLoading(true);
        setErrorMsg("");

        try {
            if (isNew) {
                const payload: StorageDimGroupRecord = {
                    ...formData,
                    createdby: LOGGED_IN_USER_ID,
                    modifiedby: LOGGED_IN_USER_ID,
                };
                const res = await fetch(`${API_BASE_URL}/api/TrackingDimension/createTrackingDimen`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "accept": "*/*" },
                    body: JSON.stringify(payload),
                })



                console.log("API RESPONSE:", payload);

                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create."); }
                const updated = [...records, { ...formData }];
                setRecords(updated);
                setSelected({ ...formData });
                setSelectedIdx(updated.length - 1);
                showSuccess(`"${formData.storagedimgroupname}" created.`);

            } else if (isEditing && selected) {
                const payload: StorageDimGroupRecord = {
                    ...formData,
                    modifiedby: LOGGED_IN_USER_ID,  // ✅ auto from login
                };
                const res = await fetch(`${API_BASE_URL}/api/StorageDimGroup/update`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "accept": "*/*" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update."); }
                const updated = records.map((r, i) => i === selectedIdx ? { ...formData } : r);
                setRecords(updated);
                setSelected({ ...formData });
                showSuccess(`"${formData.storagedimgroupname}" updated.`);
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
        if (!window.confirm(`Delete "${selected.storagedimgroupname}"?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/StorageDimension/DeleteStorageDimensionById/${encodeURIComponent(selected.storagedimgroupname)}`, {
                method: "DELETE",
                headers: { "accept": "*/*" },
            });
            if (!res.ok) throw new Error("Failed to delete.");
            const updated = records.filter((_, i) => i !== selectedIdx);
            setRecords(updated);
            const next = updated[0] ?? null;
            setSelected(next);
            setSelectedIdx(next ? 0 : -1);
            setFormData(next ?? { ...EMPTY });
            showSuccess("Record deleted.");
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

    const filteredRecords = records.filter(r =>
        r.storagedimgroupname.toLowerCase().includes(filterText.toLowerCase()) ||
        r.storagedimgroupdescription.toLowerCase().includes(filterText.toLowerCase())
    );

    const editable = isNew || isEditing;

    return (
        <div className="sdg-shell">

            {/* ══ COMMAND BAR ══ */}
            <div className="sdg-commandBar">
                <button className="sdg-cmd-icon-btn" title="Back">&#8592;</button>
                <button className="sdg-cmd-icon-btn sdg-hamburger">&#9776;</button>

                <div className="sdg-cmd-actions">
                    <button
                        className="sdg-cmd-btn sdg-cmd-save"
                        onClick={handleSave}
                        disabled={isLoading || (!isNew && !isEditing)}
                    >
                        <span>&#128190;</span> Save
                    </button>
                    <button className="sdg-cmd-btn" onClick={handleNew} disabled={isLoading}>
                        <span>+</span> New
                    </button>
                    <button className="sdg-cmd-btn" onClick={handleDelete} disabled={isLoading || !selected || isNew}>
                        <span>🗑</span> Delete
                    </button>
                </div>

                <div className="sdg-cmd-divider" />

                <div className="sdg-cmd-tabs">
                    <span className="sdg-cmd-tab sdg-cmd-tab-active">Options</span>
                </div>

                <div className="sdg-cmd-right">
                    <button className="sdg-cmd-icon-btn">&#128269;</button>
                </div>
            </div>

            {/* ══ BODY ══ */}
            <div className="sdg-body">

                {/* ══ SIDEBAR ══ */}
                <div className="sdg-sidebar">
                    <div className="sdg-sidebar-filter">
                        <span className="sdg-filter-icon">&#128269;</span>
                        <input
                            type="text"
                            placeholder="Filter"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            className="sdg-filter-input"
                        />
                    </div>

                    <div className="sdg-sidebar-list">
                        {pageLoading && <p className="sdg-loading">Loading...</p>}

                        {isNew && (
                            <div className="sdg-sidebar-item sdg-sidebar-item-active">
                                <div className="sdg-item-name">{formData.storagedimgroupname || "NEW"}</div>
                                <div className="sdg-item-desc">{formData.storagedimgroupdescription || "New record"}</div>
                            </div>
                        )}

                        {filteredRecords.map((r, idx) => (
                            <div
                                key={idx}
                                className={`sdg-sidebar-item ${!isNew && selectedIdx === idx ? "sdg-sidebar-item-active" : ""}`}
                                onClick={() => handleSelect(r, idx)}
                            >
                                <div className="sdg-item-name">{r.storagedimgroupname}</div>
                                <div className="sdg-item-desc">{r.storagedimgroupdescription}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ══ DETAIL PANEL ══ */}
                <div className="sdg-detail">

                    <div className="sdg-std-view">Standard view &#8964;</div>
                    <h1 className="sdg-detail-title">Storage Dimension Groups</h1>

                    {/* Banners */}
                    {successMsg && <div className="sdg-successBar">✓ {successMsg}</div>}
                    {errorMsg && <div className="sdg-errorBar">⚠ {errorMsg}</div>}

                    {/* ── Header fields card ── */}
                    <div className="sdg-header-card">
                        <div className="sdg-header-fields">

                            {/* Name (like "Unit" in screenshot) */}
                            <div className="sdg-field-group">
                                <label className="sdg-field-label">Name</label>
                                <input
                                    className={`sdg-field-input sdg-field-short ${editable ? "sdg-active" : ""}`}
                                    value={formData.storagedimgroupname}
                                    onChange={e => handleChange("storagedimgroupname", e.target.value)}
                                    disabled={!editable}
                                    placeholder="Group name"
                                />
                            </div>

                            {/* Description (like "Description" in screenshot) */}
                            <div className="sdg-field-group sdg-field-group-wide">
                                <label className="sdg-field-label">Description</label>
                                <input
                                    className={`sdg-field-input ${editable ? "sdg-active" : ""}`}
                                    value={formData.storagedimgroupdescription}
                                    onChange={e => handleChange("storagedimgroupdescription", e.target.value)}
                                    disabled={!editable}
                                    placeholder="Description"
                                />
                            </div>

                            {/* Edit / Cancel button — exactly like screenshot */}
                            <div className="sdg-header-actions">
                                {!isNew && !isEditing && selected && (
                                    <button className="sdg-btn-edit" onClick={() => setIsEditing(true)}>
                                        &#8212; Edit
                                    </button>
                                )}
                                {(isNew || isEditing) && (
                                    <button className="sdg-btn-secondary" onClick={handleCancel} disabled={isLoading}>
                                        Cancel
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ══ GENERAL SECTION ══ */}


                </div>
            </div>
        </div>
    );
};

export default StorageDimGroupPage;