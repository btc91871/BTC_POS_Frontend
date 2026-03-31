import React, { useEffect, useState, useMemo } from "react";
import "./enum.css";


interface EnumRecord {
    enumname: string;
    membername: string;
    value: number;
    dataAreaId: string;
}
const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const AUTH_TOKEN = "fake-token-for-now";
const DATA_AREA_ID = "DAT";
const API_BASE_URL = "http://192.168.0.100"; // 🔁 your port

const EnumsPage: React.FC = () => {

    const [records, setRecords] = useState<EnumRecord[]>([]);
    const [newRow, setNewRow] = useState<EnumRecord | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editedRecords, setEditedRecords] = useState<EnumRecord[]>([]);
    const [filterText, setFilterText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        const fetchEnums = async () => {
            try {
                setPageLoading(true);

                const res = await fetch(`${API_BASE_URL}/api/Enum/all`);
                if (!res.ok) throw new Error("Failed to fetch enums.");
                const data = await res.json();
                setRecords(Array.isArray(data) ? data : data.data ?? []); // handles wrapped response
            } catch (err) {
                setErrorMsg("Could not load enums. Please refresh.");
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };
        fetchEnums();
    }, []);
    // ── Filter ──
    const displayedRecords = useMemo(() => {
        const source = isEditMode ? editedRecords : records;
        if (!filterText.trim()) return source;
        const q = filterText.toLowerCase();
        return source.filter(r =>
            r.enumname.toLowerCase().includes(q) ||
            r.membername.toLowerCase().includes(q) ||
            String(r.value).includes(q)
        );
    }, [records, editedRecords, isEditMode, filterText]);

    const addRow = (): void => {
        if (newRow) return;
        setNewRow({ enumname: "", membername: "", value: 0, dataAreaId: "" });
        setIsEditMode(false);
        setErrorMsg("");
    };

    const handleNewRowChange = (field: keyof EnumRecord, value: string): void => {
        if (!newRow) return;
        setNewRow({
            ...newRow,
            [field]: field === "value" ? Number(value) : value,
        });
        setErrorMsg("");
    };

    const handleSave = async (): Promise<void> => {
        if (!newRow?.enumname.trim()) { setErrorMsg("Enum name is required."); return; }
        if (!newRow?.membername.trim()) { setErrorMsg("Member name is required."); return; }

        setLoading(true);
        setErrorMsg("");

        const payload: EnumRecord = {
            enumname: newRow.enumname,
            membername: newRow.membername,
            value: newRow.value,
            dataAreaId: newRow.dataAreaId
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/Enum/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "*/*",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                throw new Error(e.message || `Server error: ${res.status}`);
            }

            setRecords(prev => Array.isArray(prev) ? [...prev, newRow] : [newRow]);
            setNewRow(null);
            showSuccess(`Enum "${newRow.enumname}" saved.`);

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelNew = (): void => {
        setNewRow(null);
        setErrorMsg("");
    };

    // ── Edit mode handlers ──
    const handleEditClick = (): void => {
        setEditedRecords(records.map(r => ({ ...r })));
        setIsEditMode(true);
        setNewRow(null);
        setErrorMsg("");
    };

    const handleCancelEdit = (): void => {
        setIsEditMode(false);
        setEditedRecords([]);
        setErrorMsg("");
    };

    const handleEditRowChange = (index: number, field: keyof EnumRecord, value: string): void => {
        const updated = [...editedRecords];
        updated[index] = {
            ...updated[index],
            [field]: field === "value" ? Number(value) : value,
        };
        setEditedRecords(updated);
    };

    // ── PUT — save all edited rows ──
    const handleSaveEdit = async (): Promise<void> => {
        setLoading(true);
        setErrorMsg("");

        try {
            const changedRows = editedRecords.filter((row, i) =>
                JSON.stringify(row) !== JSON.stringify(records[i])
            );

            for (const row of changedRows) {
                const res = await fetch(`${API_BASE_URL}/api/Enum/update`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "*/*",
                    },
                    body: JSON.stringify(row),
                });
                if (!res.ok) {
                    const e = await res.json().catch(() => ({}));
                    throw new Error(e.message || `Failed to update "${row.enumname}"`);
                }
            }

            setRecords([...editedRecords]);
            setIsEditMode(false);
            setEditedRecords([]);
            showSuccess("Changes saved successfully.");

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg: string): void => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };


    const handleDelete = async (row: EnumRecord, index: number): Promise<void> => {
        if (!window.confirm(`Delete "${row.enumname} - ${row.membername}"?`)) return;

        setLoading(true);
        setErrorMsg("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/Enum`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "*/*",
                },
                body: JSON.stringify(row),
            });

            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                throw new Error(e.message || `Failed to delete "${row.enumname}"`);
            }

            setRecords(prev => prev.filter((_, i) => i !== index));
            showSuccess(`Enum "${row.enumname}" deleted.`);

        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to delete.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="page">

            <div className="topBar">

                <h2 className="pageTitle">Enums</h2>

                <div className="topBarActions">

                    {/* Normal state — show New + Edit */}
                    {!isEditMode && !newRow && (
                        <>
                            <button className="btnPrimary" onClick={addRow} disabled={loading}>
                                + New
                            </button>
                            <button className="btnSecondary" onClick={handleEditClick} disabled={loading || pageLoading}>
                                ✏ Edit
                            </button>
                        </>
                    )}

                    {/* New row state — show Save + Cancel */}
                    {newRow && !isEditMode && (
                        <>
                            <button className="btnPrimary" onClick={handleSave} disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </button>
                            <button className="btnSecondary" onClick={handleCancelNew} disabled={loading}>
                                Cancel
                            </button>
                        </>
                    )}

                    {/* Edit mode — show Save + Cancel */}
                    {isEditMode && (
                        <>
                            <button className="btnPrimary" onClick={handleSaveEdit} disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </button>
                            <button className="btnSecondary" onClick={handleCancelEdit} disabled={loading}>
                                Cancel
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* ── Filter ── */}
            <div className="toolbar">
                <div className="filterBox">
                    <span className="filterIcon">🔍</span>
                    <input
                        type="text"
                        placeholder="Filter"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        className="filterInput"
                    />
                </div>
            </div>

            {/* ── Banners ── */}
            {successMsg && <div className="successBar">✓ {successMsg}</div>}
            {errorMsg && <div className="errorBar">⚠ {errorMsg}</div>}

            {/* ── Table ── */}
            <div className="tableWrapper">
                {pageLoading ? (
                    <p className="loadingText">Loading enums...</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="th">Enum Name</th>
                                <th className="th">Member Name</th>
                                <th className="th">Value</th>
                                <th className="th">Delete</th>

                                {/* <th className="th">Data Area ID</th> */}

                            </tr>
                        </thead>

                        <tbody>

                            {/* New inline row at top */}
                            {newRow && (
                                <tr className="tr newRow">
                                    <td className="td">
                                        <input
                                            value={newRow.enumname}
                                            onChange={e => handleNewRowChange("enumname", e.target.value)}
                                            placeholder="Enum name *"
                                        />
                                    </td>
                                    <td className="td">
                                        <input
                                            value={newRow.membername}
                                            onChange={e => handleNewRowChange("membername", e.target.value)}
                                            placeholder="Member name *"
                                        />
                                    </td>
                                    <td className="td">
                                        <input
                                            type="number"
                                            value={newRow.value}
                                            onChange={e => handleNewRowChange("value", e.target.value)}
                                        />
                                    </td>

                                </tr>
                            )}

                            {/* Existing records */}
                            {displayedRecords.length === 0 && !newRow && (
                                <tr>
                                    <td colSpan={4} className="emptyRow">No records found.</td>
                                </tr>
                            )}

                            {Array.isArray(displayedRecords) &&
                                displayedRecords.map((row, index) => isEditMode ? (
                                    // Edit mode — inputs
                                    <tr key={index} className="tr editableRow">
                                        <td className="td">
                                            <input
                                                value={editedRecords[index]?.enumname ?? ""}
                                                onChange={e => handleEditRowChange(index, "enumname", e.target.value)}
                                            />
                                        </td>
                                        <td className="td">
                                            <input
                                                value={editedRecords[index]?.membername ?? ""}
                                                onChange={e => handleEditRowChange(index, "membername", e.target.value)}
                                            />
                                        </td>
                                        <td className="td">
                                            <input
                                                type="number"
                                                value={editedRecords[index]?.value ?? 0}
                                                onChange={e => handleEditRowChange(index, "value", e.target.value)}
                                            />
                                        </td>

                                    </tr>
                                ) : (
                                    // Read-only — plain text
                                    <tr key={index} className="tr">
                                        <td className="td">{row.enumname}</td>
                                        <td className="td">{row.membername}</td>
                                        <td className="td">{row.value}</td>
                                        {/* <td className="td">{row.dataAreaId}</td> */}
                                        <td className="td">
                                            <button
                                                className="btnDelete"
                                                onClick={() => handleDelete(row, index)}
                                                disabled={loading}
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                )
                                )}

                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
};

export default EnumsPage;