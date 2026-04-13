import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiRoutes";
import type { UnitRecord } from "../productInterface";
import "./Unit.css";


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


const LOGGED_IN_USER_ID = localStorage.getItem("userId") ?? "";
const AUTH_TOKEN = localStorage.getItem("token") ?? "";



const EMPTY_UNIT: UnitRecord = {
    UNIT: "",
    DESCRIPTION: "",
    UNITCLASS: 0,
    ISBASEUNIT: 0,
    CREATEDBY: "",
    MODIFIEDBY: "",
    DATAAREAID: "",
    GUID: "",
};


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
                const dataareaid = { DATAAREAID: "IND" }; // 🔁 your data area id
                setPageLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/Unit/GetAllUnits`, {
                    method: "POST",
                    headers: {
                        "accept": "*/*",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataareaid),
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
                console.log(err)
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
            [field]: (field === "UNITCLASS" || field === "ISBASEUNIT") ? Number(value) : value,
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
        if (!formData.UNIT.trim()) { setErrorMsg("Unit code is required."); return; }
        setIsLoading(true);
        setErrorMsg("");
        try {
            if (isNew) {
                const payload = {
                    UNIT: formData.UNIT,
                    DESCRIPTION: formData.DESCRIPTION,
                    UNITCLASS: formData.UNITCLASS,
                    ISBASEUNIT: formData.ISBASEUNIT,         // number 0/1 as per POST schema
                    CREATEDBY: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    MODIFIEDBY: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    DATAAREAID: "IND",
                };

                const res = await fetch(`${API_BASE_URL}/api/Unit/createUnit`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "*/*",
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to create."); }

                const created = await res.json().catch(() => ({ ...formData }));
                const updated = [...records, { ...formData, ...created }];
                setRecords(updated);
                setSelected({ ...formData, ...created });
                setSelectedIdx(updated.length - 1);
                showSuccess(`Unit "${formData.UNIT}" created.`);

            } else if (isEditing && selected) {
                const payload = {
                    GUID: selected.GUID,                            // uppercase GUID
                    UNIT: formData.UNIT,
                    DESCRIPTION: formData.DESCRIPTION,
                    UNITCLASS: formData.UNITCLASS,
                    ISBASEUNIT: formData.ISBASEUNIT === 1,          // convert to boolean for PUT
                    MODIFIEDBY: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                };

                const res = await fetch(`${API_BASE_URL}/api/Unit/updateUnitById`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "*/*",
                        "Authorization": `Bearer ${AUTH_TOKEN}`
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Failed to update."); }

                const updated = records.map((r, i) => i === selectedIdx ? { ...formData } : r);
                setRecords(updated);
                setSelected({ ...formData });
                showSuccess(`Unit "${formData.UNIT}" updated.`);
            }

            setIsNew(false);
            setIsEditing(false);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selected || isNew) return;
        if (!window.confirm(`Delete unit "${selected.UNIT}"?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/Unit/deleteUnit`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "*/*",
                    "Authorization": `Bearer ${AUTH_TOKEN}`
                },
                body: JSON.stringify({ GUID: selected.GUID }),
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
        r.UNIT.toLowerCase().includes(filterText.toLowerCase()) ||
        r.DESCRIPTION.toLowerCase().includes(filterText.toLowerCase())
    );

    const editable = isNew || isEditing;

    return (
        <div className="u-shell">

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

                <div className="u-cmd-tabs">
                    <span className="u-cmd-tab u-cmd-tab-active">Options</span>
                    <span className="u-cmd-tab">Unit conversions</span>
                </div>

                <div className="u-cmd-right">
                    <button className="u-cmd-icon-btn">&#128269;</button>
                </div>
            </div>

            <div className="u-body">

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
                                <div className="u-item-code">{formData.UNIT || "NEW"}</div>
                                <div className="u-item-desc">{formData.DESCRIPTION || "New unit"}</div>
                            </div>
                        )}
                        {filteredRecords.map((r, idx) => (
                            <div
                                key={idx}
                                className={`u-sidebar-item ${!isNew && selectedIdx === idx ? "u-sidebar-item-active" : ""}`}
                                onClick={() => handleSelectUnit(r, idx)}
                            >
                                <div className="u-item-code">{r.UNIT}</div>
                                <div className="u-item-desc">{r.DESCRIPTION}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="u-detail">
                    <div className="u-std-view">Standard view &#8964;</div>
                    <h1 className="u-detail-title">Units</h1>
                    {successMsg && <div className="u-successBar">✓ {successMsg}</div>}
                    {errorMsg && <div className="u-errorBar">⚠ {errorMsg}</div>}

                    <div className="u-header-fields">
                        <div className="u-field-group">
                            <label className="u-field-label">Unit</label>
                            <input
                                className="u-field-input u-field-unit"
                                value={formData.UNIT}
                                onChange={e => handleChange("UNIT", e.target.value)}
                                placeholder="Unit"
                                disabled={!editable}
                            />
                        </div>
                        <div className="u-field-group u-field-group-wide">
                            <label className="u-field-label">Description</label>
                            <input
                                className="u-field-input"
                                value={formData.DESCRIPTION}
                                onChange={e => handleChange("DESCRIPTION", e.target.value)}
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

                                <div className="u-gen-col">
                                    <div className="u-col-title">CLASSIFICATION</div>

                                    <div className="u-field-group">
                                        <label className="u-field-label">Unit class</label>
                                        <select
                                            className="u-field-select"
                                            value={formData.UNITCLASS}
                                            onChange={e => handleChange("UNITCLASS", e.target.value)}
                                            disabled={!editable}
                                        >
                                            {UNIT_CLASS_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                </div>

                                <div className="u-gen-col">
                                    <div className="u-col-title">ROLES</div>

                                    <div className="u-field-group">
                                        <label className="u-field-label">Base unit</label>
                                        <div className="u-toggle-row">
                                            <Toggle
                                                value={formData.ISBASEUNIT === 1}
                                                onChange={() => editable && handleChange("ISBASEUNIT", formData.ISBASEUNIT === 1 ? "0" : "1")}
                                                disabled={!editable}
                                            />
                                            <span className="u-toggle-label">{formData.ISBASEUNIT === 1 ? "Yes" : "No"}</span>
                                        </div>
                                    </div>
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