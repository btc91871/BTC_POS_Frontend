import React, { useState, useEffect } from "react";
import "./storage.css";

// ──────────────────────────────────────────────
// INTERFACES — matching real API GET response
// ──────────────────────────────────────────────

interface EnumDetail {
    Guid: string;
    ENUMNAME: string;
    MEMBERNAME: string;
    VALUE: number;
}

interface Line {
    Guid: string;
    STORAGEDIMENSIONGROUPID: string;
    ENUMVALUE: number;
    ISACTIVE: boolean;
    ISBLOTRECEIPTALLOWED: boolean;
    ISBLANKISSUEALLOWED: boolean;
    ISPHYSICALINVENTORY: boolean;
    ISFINANCIALINVENTORY: boolean;
    ISCOVERAGEPLAN: boolean;
    ISFORPURCHASEPRICES: boolean;
    ISFORSALESPRICES: boolean;
    ISTRANSFER: boolean;
    DISPLAYORDER: number;
    DATAAREAID: string;
    CREATEDBY: string;
    CREATEDDATETIME: string;
    MODIFIEDBY: string;
    MODIFIEDDATETIME: string;
    EnumDetail: EnumDetail;
}

interface StorageGroup {
    Guid: string;
    STORAGEDIMGROUPNAME: string;
    STORAGEDIMGROUPDESC: string;
    DATAAREAID: string;
    CREATEDBY: string;
    CREATEDDATETIME: string;
    MODIFIEDBY: string;
    MODIFIEDDATETIME: string;
    Lines: Line[];
}

interface CreateGroupPayload {
    STORAGEDIMGROUPNAME: string;
    STORAGEDIMGROUPDESC: string;
    DATAAREAID: string;
    CREATEDBY: string;
    MODIFIEDBY: string;
    Lines: {
        NAME: number;
        ISACTIVE: boolean;
        ISBLOTRECEIPTALLOWED: boolean;
        ISBLANKISSUEALLOWED: boolean;
        ISPHYSICALINVENTORY: boolean;
        ISFINANCIALINVENTORY: boolean;
        ISCOVERAGEPLAN: boolean;
        ISFORPURCHASEPRICES: boolean;
        ISFORSALESPRICES: boolean;
        ISTRANSFER: boolean;
        DISPLAYORDER: number;
        DATAAREAID: string;
    }[];
}

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────

const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const API_BASE_URL = "http://192.168.0.104";
const DATAAREAID = "IND";

const EMPTY_GROUP: StorageGroup = {
    Guid: "",
    STORAGEDIMGROUPNAME: "",
    STORAGEDIMGROUPDESC: "",
    DATAAREAID: DATAAREAID,
    CREATEDBY: LOGGED_IN_USER_ID,
    CREATEDDATETIME: "",
    MODIFIEDBY: LOGGED_IN_USER_ID,
    MODIFIEDDATETIME: "",
    Lines: [],
};

const BOOL_COLUMNS: { key: keyof Line; label: string }[] = [
    { key: "ISACTIVE", label: "Active" },
    { key: "ISBLOTRECEIPTALLOWED", label: "Blot Receipt" },
    { key: "ISBLANKISSUEALLOWED", label: "Blank Issue" },
    { key: "ISPHYSICALINVENTORY", label: "Physical Inv." },
    { key: "ISFINANCIALINVENTORY", label: "Financial Inv." },
    { key: "ISCOVERAGEPLAN", label: "Coverage Plan" },
    { key: "ISFORPURCHASEPRICES", label: "Purchase Prices" },
    { key: "ISFORSALESPRICES", label: "Sales Prices" },
    { key: "ISTRANSFER", label: "Transfer" },
];

// ──────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────

const StorageDimGroupPage: React.FC = () => {
    const [records, setRecords] = useState<StorageGroup[]>([]);
    const [selected, setSelected] = useState<StorageGroup | null>(null);
    const [selectedIdx, setSelectedIdx] = useState<number>(-1);
    const [formData, setFormData] = useState<StorageGroup>({ ...EMPTY_GROUP });
    const [filterText, setFilterText] = useState<string>("");
    const [isNew, setIsNew] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);

    useEffect(() => {
        loadRecords();
    }, []);

    // ── GET all ──
    const loadRecords = async () => {
        try {
            setPageLoading(true);
            setErrorMsg("");
            const res = await fetch(
                `${API_BASE_URL}/api/StorageDimension/GetAllStorageDimesion/${DATAAREAID}`,
                { headers: { accept: "*/*" } }
            );
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data: StorageGroup[] = await res.json();
            setRecords(data);
            if (data.length > 0) {
                setSelected(data[0]);
                setSelectedIdx(0);
                setFormData({ ...data[0], Lines: [...data[0].Lines] });
            }
        } catch (err) {
            setErrorMsg("Could not load records. Check network and refresh.");
            console.error("GET error:", err);
        } finally {
            setPageLoading(false);
        }
    };

    const handleSelect = (item: StorageGroup, idx: number) => {
        if (isNew || isEditing) return;
        setSelected(item);
        setSelectedIdx(idx);
        setFormData({ ...item, Lines: [...item.Lines] });
        setErrorMsg("");
        setSuccessMsg("");
    };

    const handleChange = (
        field: "STORAGEDIMGROUPNAME" | "STORAGEDIMGROUPDESC" | "DATAAREAID",
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLineToggle = (lineIdx: number, field: keyof Line) => {
        if (!isEditing && !isNew) return;
        setFormData((prev) => ({
            ...prev,
            Lines: prev.Lines.map((l, i) =>
                i === lineIdx ? { ...l, [field]: !(l[field] as boolean) } : l
            ),
        }));
    };

    const handleLineOrderChange = (lineIdx: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            Lines: prev.Lines.map((l, i) =>
                i === lineIdx ? { ...l, DISPLAYORDER: parseInt(value) || 0 } : l
            ),
        }));
    };

    const handleNew = () => {
        setIsNew(true);
        setIsEditing(false);
        setSelected(null);
        setSelectedIdx(-1);
        setFormData({ ...EMPTY_GROUP });
        setErrorMsg("");
        setSuccessMsg("");
    };

    const handleCancel = () => {
        setIsNew(false);
        setIsEditing(false);
        if (selected) setFormData({ ...selected, Lines: [...selected.Lines] });
        setErrorMsg("");
    };

    // ── POST / PUT ──
    const handleSave = async () => {
        if (!formData.STORAGEDIMGROUPNAME.trim()) {
            setErrorMsg("Name is required.");
            return;
        }
        setIsLoading(true);
        setErrorMsg("");

        try {
            if (isNew) {
                const payload: CreateGroupPayload = {
                    STORAGEDIMGROUPNAME: formData.STORAGEDIMGROUPNAME,
                    STORAGEDIMGROUPDESC: formData.STORAGEDIMGROUPDESC,
                    DATAAREAID: formData.DATAAREAID || DATAAREAID,
                    CREATEDBY: LOGGED_IN_USER_ID,
                    MODIFIEDBY: LOGGED_IN_USER_ID,
                    Lines: formData.Lines.map((l) => ({
                        NAME: l.ENUMVALUE,
                        ISACTIVE: l.ISACTIVE,
                        ISBLOTRECEIPTALLOWED: l.ISBLOTRECEIPTALLOWED,
                        ISBLANKISSUEALLOWED: l.ISBLANKISSUEALLOWED,
                        ISPHYSICALINVENTORY: l.ISPHYSICALINVENTORY,
                        ISFINANCIALINVENTORY: l.ISFINANCIALINVENTORY,
                        ISCOVERAGEPLAN: l.ISCOVERAGEPLAN,
                        ISFORPURCHASEPRICES: l.ISFORPURCHASEPRICES,
                        ISFORSALESPRICES: l.ISFORSALESPRICES,
                        ISTRANSFER: l.ISTRANSFER,
                        DISPLAYORDER: l.DISPLAYORDER,
                        DATAAREAID: l.DATAAREAID || DATAAREAID,
                    })),
                };
                console.log("POST payload:", payload);
                const res = await fetch(
                    `${API_BASE_URL}/api/StorageDimension/CreateStorageDimesion`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json", accept: "*/*" },
                        body: JSON.stringify(payload),
                    }
                );
                if (!res.ok) {
                    const e = await res.json().catch(() => ({}));
                    throw new Error((e as any).message || `Failed to create. Status: ${res.status}`);
                }
                await loadRecords();
                showSuccess(`"${formData.STORAGEDIMGROUPNAME}" created.`);

            } else if (isEditing && selected) {
                const payload = {
                    GUID: formData.Guid,
                    STORAGEDIMGROUPNAME: formData.STORAGEDIMGROUPNAME,
                    STORAGEDIMGROUPDESC: formData.STORAGEDIMGROUPDESC,
                    DATAAREAID: formData.DATAAREAID,
                    MODIFIEDBY: LOGGED_IN_USER_ID,
                    Lines: formData.Lines,
                };
                console.log("PUT payload:", payload);
                const res = await fetch(
                    `${API_BASE_URL}/api/StorageDimension/UpdateStorageDimesion`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", accept: "*/*" },
                        body: JSON.stringify(payload),
                    }
                );
                if (!res.ok) {
                    const e = await res.json().catch(() => ({}));
                    throw new Error((e as any).message || `Failed to update. Status: ${res.status}`);
                }
                await loadRecords();
                showSuccess(`"${formData.STORAGEDIMGROUPNAME}" updated.`);
            }

            setIsNew(false);
            setIsEditing(false);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── DELETE group ──
    const handleDelete = async () => {
        if (!selected || isNew) return;
        if (!window.confirm(`Delete "${selected.STORAGEDIMGROUPNAME}"?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/StorageDimension/DeleteStorageDimesion`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json", accept: "*/*" },
                    body: JSON.stringify({ GUID: selected.Guid }),
                }
            );
            if (!res.ok) throw new Error(`Failed to delete. Status: ${res.status}`);
            const updated = records.filter((_, i) => i !== selectedIdx);
            setRecords(updated);
            const next = updated[0] ?? null;
            setSelected(next);
            setSelectedIdx(next ? 0 : -1);
            setFormData(next ? { ...next, Lines: [...next.Lines] } : { ...EMPTY_GROUP });
            showSuccess("Record deleted.");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to delete.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── DELETE line ──
    const handleDeleteLine = async (line: Line, lineIdx: number) => {
        if (!window.confirm(`Delete line "${line.EnumDetail?.MEMBERNAME ?? line.Guid}"?`))
            return;
        setIsLoading(true);
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/StorageDimension/DeleteStorageDimesionLine`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json", accept: "*/*" },
                    body: JSON.stringify({ GUID: line.Guid, DATAAREAID: line.DATAAREAID }),
                }
            );
            if (!res.ok) throw new Error(`Failed to delete line. Status: ${res.status}`);
            const updatedLines = formData.Lines.filter((_, i) => i !== lineIdx);
            const updatedForm = { ...formData, Lines: updatedLines };
            setFormData(updatedForm);
            setSelected(updatedForm);
            setRecords((prev) =>
                prev.map((r, i) => (i === selectedIdx ? updatedForm : r))
            );
            showSuccess("Line deleted.");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to delete line.");
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    // // ✅ Filter restored
    // const filteredRecords = records.filter(
    //     (r) =>
    //         r.STORAGEDIMGROUPNAME.toLowerCase().includes(filterText.toLowerCase()) ||
    //         r.STORAGEDIMGROUPDESC.toLowerCase().includes(filterText.toLowerCase())
    // );

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
                    <button
                        className="sdg-cmd-btn"
                        onClick={handleNew}
                        disabled={isLoading || isNew || isEditing}
                    >
                        <span>+</span> New
                    </button>
                    <button
                        className="sdg-cmd-btn"
                        onClick={handleDelete}
                        disabled={isLoading || !selected || isNew || isEditing}
                    >
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
                            onChange={(e) => setFilterText(e.target.value)}
                            className="sdg-filter-input"
                        />
                    </div>

                    <div className="sdg-sidebar-list">
                        {pageLoading && <p className="sdg-loading">Loading...</p>}

                        {isNew && (
                            <div className="sdg-sidebar-item sdg-sidebar-item-active">
                                <div className="sdg-item-name">
                                    {formData.STORAGEDIMGROUPNAME || "NEW"}
                                </div>
                                <div className="sdg-item-desc">
                                    {formData.STORAGEDIMGROUPDESC || "New record"}
                                </div>
                            </div>
                        )}

                        {/* ✅ Sidebar list — restored from commented-out state */}
                        {/* {filteredRecords.map((r, idx) => (
                            <div
                                key={r.Guid || idx}
                                className={`sdg-sidebar-item ${!isNew && selectedIdx === idx ? "sdg-sidebar-item-active" : ""
                                    }`}
                                onClick={() => handleSelect(r, idx)}
                            >
                                <div className="sdg-item-name">{r.STORAGEDIMGROUPNAME}</div>
                                <div className="sdg-item-desc">{r.STORAGEDIMGROUPDESC}</div>
                            </div>
                        ))} */}
                    </div>
                </div>

                {/* ══ DETAIL PANEL ══ */}
                <div className="sdg-detail">
                    <div className="sdg-std-view">Standard view &#8964;</div>
                    <h1 className="sdg-detail-title">Storage Dimension Groups</h1>

                    {successMsg && <div className="sdg-successBar">✓ {successMsg}</div>}
                    {errorMsg && <div className="sdg-errorBar">⚠ {errorMsg}</div>}

                    <div className="sdg-header-card">
                        <div className="sdg-header-fields">

                            <div className="sdg-field-group">
                                <label className="sdg-field-label">Name</label>
                                <input
                                    className={`sdg-field-input sdg-field-short ${editable ? "sdg-active" : ""}`}
                                    value={formData.STORAGEDIMGROUPNAME}
                                    onChange={(e) => handleChange("STORAGEDIMGROUPNAME", e.target.value)}
                                    disabled={!isNew} // Name only editable on create
                                    placeholder="Group name"
                                />
                            </div>

                            <div className="sdg-field-group sdg-field-group-wide">
                                <label className="sdg-field-label">Description</label>
                                <input
                                    className={`sdg-field-input ${editable ? "sdg-active" : ""}`}
                                    value={formData.STORAGEDIMGROUPDESC}
                                    onChange={(e) => handleChange("STORAGEDIMGROUPDESC", e.target.value)}
                                    disabled={!editable}
                                    placeholder="Description"
                                />
                            </div>

                            <div className="sdg-field-group">
                                <label className="sdg-field-label">Data Area ID</label>
                                <input
                                    className={`sdg-field-input sdg-field-short ${editable ? "sdg-active" : ""}`}
                                    value={formData.DATAAREAID}
                                    onChange={(e) => handleChange("DATAAREAID", e.target.value)}
                                    disabled={!editable}
                                    placeholder="e.g. IND"
                                />
                            </div>

                            <div className="sdg-header-actions">
                                {!isNew && !isEditing && selected && (
                                    <button
                                        className="sdg-btn-edit"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        &#9998; Edit
                                    </button>
                                )}
                                {(isNew || isEditing) && (
                                    <button
                                        className="sdg-btn-secondary"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ══ LINES TABLE ══ */}
                    {(selected || isNew) && (
                        <div className="sdg-lines-section">
                            <div className="sdg-lines-header">
                                <h2 className="sdg-lines-title">Lines</h2>
                            </div>

                            <div className="sdg-lines-table-wrapper">
                                <table className="sdg-lines-table">
                                    <thead>
                                        <tr>
                                            <th>Dimension</th>
                                            <th>Enum Value</th>
                                            {BOOL_COLUMNS.map((c) => (
                                                <th key={String(c.key)}>{c.label}</th>
                                            ))}
                                            <th>Display Order</th>
                                            <th>Data Area</th>
                                            {isEditing && <th>Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.Lines.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={BOOL_COLUMNS.length + 4 + (isEditing ? 1 : 0)}
                                                    className="sdg-no-lines"
                                                >
                                                    No lines.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.Lines.map((line, li) => (
                                                <tr key={line.Guid || li}>
                                                    <td className="sdg-line-name">
                                                        {line.EnumDetail?.MEMBERNAME ?? "—"}
                                                    </td>
                                                    <td>{line.ENUMVALUE}</td>
                                                    {BOOL_COLUMNS.map((c) => (
                                                        <td key={String(c.key)} className="sdg-bool-cell">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!(line[c.key] as boolean)}
                                                                onChange={() => handleLineToggle(li, c.key)}
                                                                disabled={!isEditing}
                                                                className="sdg-checkbox"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td>
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                className="sdg-field-input sdg-field-order"
                                                                value={line.DISPLAYORDER}
                                                                onChange={(e) =>
                                                                    handleLineOrderChange(li, e.target.value)
                                                                }
                                                            />
                                                        ) : (
                                                            line.DISPLAYORDER
                                                        )}
                                                    </td>
                                                    <td>{line.DATAAREAID}</td>
                                                    {isEditing && (
                                                        <td>
                                                            <button
                                                                className="sdg-line-delete-btn"
                                                                onClick={() => handleDeleteLine(line, li)}
                                                                disabled={isLoading}
                                                                title="Delete line"
                                                            >
                                                                🗑
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default StorageDimGroupPage;