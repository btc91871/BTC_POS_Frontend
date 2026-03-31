import React, { useState, useEffect } from "react";
import "./Unit.css";

// ──────────────────────────────────────────────
// INTERFACES
// ──────────────────────────────────────────────
interface UnitRecord {
    guid: string;
    unit: string;
    description: string;
    unitclass: number;   // goes to DB
    isbaseunit: number;  // goes to DB
}

const UNIT_CLASS_OPTIONS = [
    { value: 0, label: "Quantity" },
    { value: 1, label: "Weight" },
    { value: 2, label: "Volume" },
    { value: 3, label: "Length" },
    { value: 4, label: "Area" },
    { value: 5, label: "Time" },
    { value: 6, label: "Temperature" },
];

const SYSTEM_OF_UNITS_OPTIONS = ["None", "SI", "US", "Imperial"];

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
const LOGGED_IN_USER_ID = localStorage.getItem("userId") ?? "";
const AUTH_TOKEN = localStorage.getItem("token") ?? "";
const API_BASE_URL = "http://192.168.0.100"; // 🔁 your port

// const API_BASE_URL = "http://192.168.0.112"; // 🔁 your port


const EMPTY_UNIT: UnitRecord = {
    unit: "",
    description: "",
    unitclass: 0,
    isbaseunit: 0,
};

// ──────────────────────────────────────────────
// TOGGLE COMPONENT
// ──────────────────────────────────────────────
const Toggle: React.FC<{
    value: boolean;
    onChange?: () => void;
    disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
    <button
        type="button"
        className={`u-toggle ${value ? "u-toggle-on" : "u-toggle-off"}`}
        onClick={!disabled ? onChange : undefined}
        disabled={disabled}
    >
        <span className="u-toggle-thumb" />
    </button>
);

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
const UnitsPage: React.FC = () => {

    const [records, setRecords] = useState<UnitRecord[]>([]);
    const [selected, setSelected] = useState<UnitRecord | null>(null);
    const [selectedIdx, setSelectedIdx] = useState<number>(-1);
    const [filterText, setFilterText] = useState<string>("");
    const [isNew, setIsNew] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<UnitRecord>(EMPTY_UNIT);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);

    // UI-only fields (not sent to DB)
    const [fixedUnitAssignment, setFixedUnitAssignment] = useState<boolean>(false);
    const [systemUnit, setSystemUnit] = useState<boolean>(false);
    const [systemOfUnits, setSystemOfUnits] = useState<string>("None");
    const [decimalPrecision, setDecimalPrecision] = useState<number>(2);
    const [codeByOkei, setCodeByOkei] = useState<string>("");

    // ── GET all units on load ──
    useEffect(() => {
        const load = async () => {
            try {
                setPageLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/Unit/GetAllUnits`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                console.log(res);

                if (!res.ok) throw new Error("Failed to fetch.");
                const data: UnitRecord[] = await res.json();
                setRecords(data);
                if (data.length > 0) {
                    setSelected(data[0]);
                    setSelectedIdx(0);
                    setFormData({ ...data[0] });
                }
            } catch (err) {
                setErrorMsg("Could not load units.");
            } finally {
                setPageLoading(false);
            }
        };
        load();
    }, []);

    const handleSelectUnit = (unit: UnitRecord, idx: number) => {
        if (isNew || isEditing) return;
        setSelected(unit);
        setSelectedIdx(idx);
        setFormData({ ...unit });
        setErrorMsg("");
    };

    const handleChange = (field: keyof UnitRecord, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: (field === "unitclass" || field === "isbaseunit") ? Number(value) : value,
        }));
    };

    const handleNew = () => {
        setIsNew(true);
        setIsEditing(false);
        setSelected(null);
        setSelectedIdx(-1);
        setFormData({ ...EMPTY_UNIT });
        setFixedUnitAssignment(false);
        setSystemUnit(false);
        setSystemOfUnits("None");
        setDecimalPrecision(2);
        setCodeByOkei("");
        setErrorMsg("");
    };

    const handleCancel = () => {
        setIsNew(false);
        setIsEditing(false);
        if (selected) setFormData({ ...selected });
        setErrorMsg("");
    };

    const handleSave = async () => {
        if (!formData.unit.trim()) { setErrorMsg("Unit code is required."); return; }
        setIsLoading(true);
        setErrorMsg("");
        try {
            if (isNew) {
                const payload = {
                    ...formData,
                    // id: selected.id,
                    createdby: "05065350-017F-45F8-AB68-9AC04CBE135F",
                    modifiedby: "05065350-017F-45F8-AB68-9AC04CBE135F",
                };

                console.log("Saving new unit with payload:", payload);
                const res = await fetch(`${API_BASE_URL}/api/Unit/createUnit`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "*/*",
                    },
                    body: JSON.stringify(payload),
                });
                console.log("API response:", res);
                // if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed."); }
                const updated = [...records, { ...formData }];
                setRecords(updated);
                setSelected({ ...formData });
                setSelectedIdx(updated.length - 1);
                showSuccess(`Unit "${formData.unit}" created.`);
            } else if (isEditing && selected) {
                const payload = {
                    guid: selected.guid, // 🔥 here instead
                    ...formData,
                    modifiedby: LOGGED_IN_USER_ID,
                };

                const res = await fetch(`${API_BASE_URL}/api/Unit/updateUnitById`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AUTH_TOKEN}`
                    },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed."); }
                const updated = records.map((r, i) => i === selectedIdx ? { ...formData } : r);
                setRecords(updated);
                setSelected({ ...formData });
                showSuccess(`Unit "${formData.unit}" updated.`);
            }
            setIsNew(false);
            setIsEditing(false);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
            console.log(err);

        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selected || isNew) return;
        if (!window.confirm(`Delete unit "${selected.unit}"?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/Unit/deleteUnit/${selected.guid}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${AUTH_TOKEN}` },
            });
            if (!res.ok) throw new Error("Failed to delete.");
            const updated = records.filter((_, i) => i !== selectedIdx);
            setRecords(updated);
            const next = updated[0] ?? null;
            setSelected(next);
            setSelectedIdx(next ? 0 : -1);
            setFormData(next ?? EMPTY_UNIT);
            showSuccess("Unit deleted.");
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
        r.unit.toLowerCase().includes(filterText.toLowerCase()) ||
        r.description.toLowerCase().includes(filterText.toLowerCase())
    );

    const editable = isNew || isEditing;

    // ──────────────────────────────────────────
    // JSX
    // ──────────────────────────────────────────
    return (
        <div className="u-shell">

            {/* ══ TOP COMMAND BAR ══ */}
            <div className="u-commandBar">
                <button className="u-cmd-icon-btn" title="Back">&#8592;</button>
                <button className="u-cmd-icon-btn u-cmd-hamburger" title="Menu">&#9776;</button>

                {/* Left action buttons */}
                <div className="u-cmd-actions">
                    <button className="u-cmd-btn u-cmd-save" onClick={handleSave} disabled={isLoading || (!isNew && !isEditing)}>
                        <span>&#128190;</span> Save
                    </button>
                    <button className="u-cmd-btn" onClick={handleNew} disabled={isLoading}>
                        <span>+</span> New
                    </button>
                    <button className="u-cmd-btn" onClick={handleDelete} disabled={isLoading || !selected || isNew}>
                        <span>🗑</span> Delete
                    </button>
                </div>

                <div className="u-cmd-divider" />

                {/* Navigation tabs */}
                <div className="u-cmd-tabs">
                    <span className="u-cmd-tab u-cmd-tab-active">Options</span>
                    <span className="u-cmd-tab">Unit conversions</span>


                </div>

                {/* Right icons */}
                <div className="u-cmd-right">
                    <button className="u-cmd-icon-btn">&#128269;</button>
                </div>
            </div>

            {/* ══ BODY ══ */}
            <div className="u-body">

                {/* ══ LEFT SIDEBAR ══ */}
                <div className="u-sidebar">
                    <div className="u-sidebar-filter">
                        <span className="u-filter-icon">&#128269;</span>
                        <input
                            type="text"
                            placeholder="Filter"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            className="u-filter-input"
                        />
                    </div>
                    <div className="u-sidebar-list">
                        {pageLoading && <p className="u-loading">Loading...</p>}
                        {isNew && (
                            <div className="u-sidebar-item u-sidebar-item-active">
                                <div className="u-item-code">{formData.unit || "NEW"}</div>
                                <div className="u-item-desc">{formData.description || "New unit"}</div>
                            </div>
                        )}
                        {filteredRecords.map((r, idx) => (
                            <div
                                key={idx}
                                className={`u-sidebar-item ${!isNew && selectedIdx === idx ? "u-sidebar-item-active" : ""}`}
                                onClick={() => handleSelectUnit(r, idx)}
                            >
                                <div className="u-item-code">{r.unit}</div>
                                <div className="u-item-desc">{r.description}</div>
                            </div>
                        ))}
                    </div>
                </div>


                <div className="u-detail">

                    <div className="u-std-view">Standard view &#8964;</div>
                    <h1 className="u-detail-title">Units</h1>

                    {successMsg && <div className="u-successBar">✓ {successMsg}</div>}
                    {errorMsg && <div className="u-errorBar">⚠ {errorMsg}</div>}

                    {/* Unit + Description top fields */}
                    <div className="u-header-fields">
                        <div className="u-field-group">
                            <label className="u-field-label">Unit</label>
                            <input
                                className="u-field-input u-field-unit"
                                value={formData.unit}
                                onChange={e => handleChange("unit", e.target.value)}
                                placeholder="Unit"
                                disabled={!editable}
                            />
                        </div>
                        <div className="u-field-group u-field-group-wide">
                            <label className="u-field-label">Description</label>
                            <input
                                className="u-field-input"
                                value={formData.description}
                                onChange={e => handleChange("description", e.target.value)}
                                placeholder="Description"
                                disabled={!editable}
                            />
                        </div>
                        {/* Edit / Cancel inline button */}
                        <div className="u-header-actions">
                            {!isNew && !isEditing && selected && (
                                <button className="u-btn-secondary" onClick={() => setIsEditing(true)}>✏ Edit</button>
                            )}
                            {(isNew || isEditing) && (
                                <button className="u-btn-secondary" onClick={handleCancel} disabled={isLoading}>Cancel</button>
                            )}
                        </div>
                    </div>


                    <div className="u-section">
                        <div className="u-section-header">General</div>
                        <div className="u-section-body">
                            <div className="u-general-grid">


                                {/* COL 2 — CLASSIFICATION */}
                                <div className="u-gen-col">
                                    <div className="u-col-title">CLASSIFICATION</div>

                                    <div className="u-field-group">
                                        <label className="u-field-label">Unit class</label>
                                        <select
                                            className="u-field-select"
                                            value={formData.unitclass}
                                            onChange={e => handleChange("unitclass", e.target.value)}
                                            disabled={!editable}
                                        >
                                            {UNIT_CLASS_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* <div className="u-field-group u-mt">
                                        <label className="u-field-label">System of units</label>
                                        <select
                                            className="u-field-select"
                                            value={systemOfUnits}
                                            onChange={e => editable && setSystemOfUnits(e.target.value)}
                                            disabled={!editable}
                                        >
                                            {SYSTEM_OF_UNITS_OPTIONS.map(o => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    </div> */}
                                </div>

                                <div className="u-gen-col">
                                    <div className="u-col-title">ROLES</div>

                                    <div className="u-field-group">
                                        <label className="u-field-label">Base unit</label>
                                        <div className="u-toggle-row">
                                            <Toggle
                                                value={formData.isbaseunit === 1}
                                                onChange={() => editable && handleChange("isbaseunit", formData.isbaseunit === 1 ? "0" : "1")}
                                                disabled={!editable}
                                            />
                                            <span className="u-toggle-label">{formData.isbaseunit === 1 ? "Yes" : "No"}</span>
                                        </div>
                                    </div>

                                    {/* <div className="u-field-group u-mt">
                                        <label className="u-field-label">System unit</label>
                                        <div className="u-toggle-row">
                                            <Toggle
                                                value={systemUnit}
                                                onChange={() => editable && setSystemUnit(v => !v)}
                                                disabled={!editable}
                                            />
                                            <span className="u-toggle-label">{systemUnit ? "Yes" : "No"}</span>
                                        </div>
                                    </div> */}





                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UnitsPage;