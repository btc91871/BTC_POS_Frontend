import React, { useState, useMemo, useEffect } from "react";
import StyleForm from "../../components/Forms/styleForm";
import type { API_BASE_URL } from "../apiRoutes.ts";
import type { SizeRecord } from "../productInterface.ts";
import { SIZE_API } from "../apiRoutes.ts";
import "./size.css";


// interface SizeRecord {
//     GUID: string;
//     SIZE: string;
//     SIZENAME: string;
//     SIZEDESCRIPTION: string;
//     SIZEDISPLAYORDER: number;
//     SIZEREFINERGROUP: string;
//     hexcode: string;
//     url: string;
// }

type SortDirection = "asc" | "desc" | null;
type SortKey = keyof SizeRecord | null;


// ─────────────────────────────────────────────  
// const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
//   const userId = import.meta.env.VITE_USER_ID;
//   const authToken = import.meta.env.VITE_AUTH_TOKEN;
//   const dataAreaId = import.meta.env.VITE_DATA_AREA_ID;

const LOGGED_IN_USER_ID = localStorage.getItem("userId") ?? "";
const AUTH_TOKEN = localStorage.getItem("token") ?? "";



// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const API_BASE_URL = "http://192.168.0.110";

const EMPTY_ROW: SizeRecord = {
    GUID: "",
    SIZE: "",
    SIZENAME: "",
    SIZEDESCRIPTION: "",
    SIZEDISPLAYORDER: 0,
    SIZEREFINERGROUP: "",
    hexcode: "",
    url: "",
};



const SizePage: React.FC = () => {

    const [records, setRecords] = useState<SizeRecord[]>([]);
    const [filterText, setFilterText] = useState<string>("");
    const [sortKey, setSortKey] = useState<keyof SizeRecord | null>(null);
    const [sortDir, setSortDir] = useState<SortDirection>(null);
    const [newRow, setNewRow] = useState<SizeRecord | null>(null);
    const [rowError, setRowError] = useState<string>("");
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editedRecords, setEditedRecords] = useState<SizeRecord[]>([]);

    const [successMsg, setSuccessMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [pageError, setPageError] = useState<string>("");


    useEffect(() => {
        const loadSizes = async () => {
            try {
                setPageLoading(true);
                // const response = await fetch(`${API_BASE_URL}/api/Size/getAllSizes`, {
                const response = await fetch(SIZE_API.GET_SIZE, {

                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // "Authorization": `Bearer ${AUTH_TOKEN}`,
                    },
                });

                console.log("Fetch sizes response:", response);
                if (!response.ok) throw new Error("Failed to fetch sizes.");
                const data = await response.json();
                console.log("ACTUAL API DATA:", data);
                const arr = Array.isArray(data) ? data
                    : Array.isArray(data?.Data) ? data.Data
                        : Array.isArray(data?.data) ? data.data
                            : [];
                setRecords(arr);
            } catch (err) {
                setPageError("Could not load sizes. Please refresh the page.");
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };

        loadSizes();
    }, []);

    const displayedRecords = useMemo<SizeRecord[]>(() => {
        if (!Array.isArray(records)) return [];   // ← add this
        let result = records.filter((r) => {
            const q = filterText.toLowerCase();
            return (
                (r.SIZE ?? "").toLowerCase().includes(q) ||
                (r.SIZENAME ?? "").toLowerCase().includes(q) ||
                (r.SIZEREFINERGROUP ?? "").toLowerCase().includes(q) ||
                (r.hexcode ?? "").toLowerCase().includes(q)
            );
        });
        // ... rest stays same

        if (sortKey && sortDir) {
            result = [...result].sort((a, b) => {
                const av = a[sortKey];
                const bv = b[sortKey];
                if (typeof av === "string" && typeof bv === "string") {
                    return sortDir === "asc"
                        ? av.localeCompare(bv)
                        : bv.localeCompare(av);
                }

                if (typeof av === "number" && typeof bv === "number") {
                    return sortDir === "asc" ? av - bv : bv - av;
                }

                return 0;
            });
        }

        return result;
    }, [records, filterText, sortKey, sortDir]);

    const handleSort = (key: keyof SizeRecord): void => {
        if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
        else if (sortDir === "asc") { setSortDir("desc"); }
        else { setSortKey(null); setSortDir(null); }
    };

    const getSortIcon = (key: keyof SizeRecord): string => {
        if (sortKey !== key) return "↕";
        return sortDir === "asc" ? "↑" : "↓";
    };

    // ──────────────────────────────────────────
    // Existing row inline edit (sizeForm rows)
    // ──────────────────────────────────────────
    const handleTableChange = (index: number, field: keyof SizeRecord, value: string): void => {
        const updated = [...records];
        updated[index] = {
            ...updated[index],
            [field]: field === "SIZEDISPLAYORDER" ? Number(value) : value,
        };
        setRecords(updated);
    };

    // ──────────────────────────────────────────
    // New inline row — add empty editable row
    // ──────────────────────────────────────────
    const addRow = (): void => {
        if (newRow) return; // only one new row at a time
        setNewRow({ ...EMPTY_ROW });
    };

    const handleNewRowChange = (field: keyof SizeRecord, value: string): void => {
        if (!newRow) return;
        setNewRow({
            ...newRow,
            [field]: field === "SIZEDISPLAYORDER" ? Number(value) : value,
        });
        setRowError("");
    };

    // ──────────────────────────────────────────

    // Your POST endpoint: /api/size/size
    // ──────────────────────────────────────────
    const handleSave = async (): Promise<void> => {
        if (!newRow?.SIZE.trim()) {
            setRowError("Size code is required.");
            return;
        }

        setIsLoading(true);
        setRowError("");

        // Build payload: visible fields + auto-filled auth fields
        const payload = {
            size: newRow.SIZE,
            sizename: newRow.SIZENAME,
            sizedescription: newRow.SIZEDESCRIPTION,
            sizedisplayorder: newRow.SIZEDISPLAYORDER,
            sizerefinergroup: newRow.SIZEREFINERGROUP,
            createdby: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            modifiedby: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        };

        console.log("Saving new size with payload:", payload);

        try {
            const response = await fetch(SIZE_API.CREATE_SIZE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            console.log("API response status:", response);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server error: ${response.status}`);
            }

            // Add to table and clear the new row
            setRecords((prev) => [...prev, newRow]);
            setNewRow(null);
            showSuccess(`Size "${newRow.SIZE}" saved successfully.`);

        } catch (error) {
            setRowError(error instanceof Error ? error.message : "Failed to save. Try again.");
            console.error("API Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccess = (msg: string): void => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3500);
    };


    const handleEditClick = (): void => {
        setFilterText("");       // ← add
        setSortKey(null);        // ← add
        setSortDir(null);        // ← add
        setEditedRecords(records.map(r => ({ ...r })));
        setIsEditMode(true);
        setNewRow(null);
        setRowError("");
    };

    const handleCancelEdit = (): void => {
        setIsEditMode(false);
        setEditedRecords([]);
        setRowError("");
    };

    const handleEditRowChange = (index: number, field: keyof SizeRecord, value: string): void => {
        const updated = [...editedRecords];
        updated[index] = {
            ...updated[index],
            [field]: field === "SIZEDISPLAYORDER" ? Number(value) : value,
        };
        setEditedRecords(updated);
    };




    const handleSaveEdit = async (): Promise<void> => {
        setIsLoading(true);
        setRowError("");

        try {
            const changedRows = editedRecords.filter((editedRow, i) => {
                const original = records[i];
                if (!original) return true;
                return JSON.stringify(editedRow) !== JSON.stringify(original);
            });

            for (const row of changedRows) {

                if (!row.GUID) {
                    console.log("❌ Missing GUID:", row);
                    continue;
                }

                const payload = {
                    guid: row.GUID,
                    size: row.SIZE,
                    sizename: row.SIZENAME,
                    sizedescription: row.SIZEDESCRIPTION,
                    sizedisplayorder: row.SIZEDISPLAYORDER,
                    sizerefinergroup: row.SIZEREFINERGROUP,
                    modifiedby:
                        LOGGED_IN_USER_ID && LOGGED_IN_USER_ID.length === 36
                            ? LOGGED_IN_USER_ID
                            : "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                };

                console.log("✅ FINAL PAYLOAD:", payload);

                const response = await fetch(SIZE_API.UPDATE_SIZE, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const err = await response.text();
                    console.log("❌ SERVER ERROR:", err);
                    throw new Error(err);
                }
            }

            setRecords([...editedRecords]);
            setIsEditMode(false);
            setEditedRecords([]);
            showSuccess("Changes saved successfully.");

        } catch (error) {
            setRowError(error instanceof Error ? error.message : "Failed to save changes.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleDelete = async (guid: string): Promise<void> => {
        if (!window.confirm("Are you sure you want to delete this size?")) return;
        setIsLoading(true);
        try {
            const response = await fetch(SIZE_API.DELETE_SIZE, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ GUID: guid }),
            });
            if (!response.ok) throw new Error("Failed to delete.");
            setRecords(prev => prev.filter(r => r.GUID !== guid));
            showSuccess("Size deleted successfully.");
        } catch (error) {
            setRowError(error instanceof Error ? error.message : "Failed to delete.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="page">
            {/* <Sidebar /> */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>

                {!isEditMode && !newRow && (
                    <>
                        <button className="btnPrimary" onClick={addRow} disabled={isLoading}>
                            + New
                        </button>

                        <button className="btnSecondary" onClick={handleEditClick}>
                            ✏ Edit
                        </button>
                    </>
                )}

                {/* EDIT MODE BUTTONS */}
                {isEditMode && (
                    <>
                        <button className="btnPrimary" onClick={handleSaveEdit}>
                            💾 Save
                        </button>

                        <button className="btnSecondary" onClick={handleCancelEdit}>
                            ❌ Cancel
                        </button>
                    </>
                )}

                {/* NEW ROW BUTTONS */}
                {newRow && !isEditMode && (
                    <>
                        <button className="btnPrimary" onClick={handleSave}>
                            Save
                        </button>

                        <button className="btnSecondary" onClick={() => setNewRow(null)}>
                            Cancel
                        </button>
                    </>
                )}
            </div>

            <p className="breadcrumb">Size</p>

            <div className="topRow">
                <h1 className="heading">Standard view</h1>

            </div>

            {/* Success banner */}
            {successMsg && (
                <div className="successBar">✓ {successMsg}</div>
            )}

            {/* Page-level fetch error */}
            {pageError && (
                <div className="errorBar">⚠ {pageError}</div>
            )}

            {/* Filter */}
            <div className="toolbar">
                <div className="filterBox">
                    <input
                        type="text"
                        placeholder="🔍 Filter"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="filterInput"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="tableWrapper">
                {/* {pageLoading ? (
                    <p className="loadingText">Loading styles...</p>
                ) : ( */}



                <table className="table">
                    <thead>
                        <tr>
                            {/* <th className="th" onClick={() => handleSort("sizename")}>
                                Name {getSortIcon("sizename")}
                            </th> */}

                            <th className="th" onClick={() => handleSort("SIZE")}>
                                Size {getSortIcon("SIZE")}
                            </th>
                            <th className="th" onClick={() => handleSort("SIZEDISPLAYORDER")}>
                                Display Order {getSortIcon("SIZEDISPLAYORDER")}
                            </th>

                            <th className="th" onClick={() => handleSort("SIZEREFINERGROUP")}>
                                RefinerGroup {getSortIcon("SIZEREFINERGROUP")}
                            </th>

                            <th className="th">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {newRow && (
                            <tr className="tr">
                                <td className="td">
                                    <input
                                        value={newRow.SIZE}
                                        onChange={(e) => handleNewRowChange("SIZE", e.target.value)}
                                        placeholder="Size *"
                                    />
                                </td>
                                <td className="td">
                                    <input
                                        type="number"
                                        value={newRow.SIZEDISPLAYORDER}
                                        onChange={(e) => handleNewRowChange("SIZEDISPLAYORDER", e.target.value)}
                                    />
                                </td>

                                <td className="td">
                                    <input
                                        value={newRow.SIZEREFINERGROUP}
                                        onChange={(e) => handleNewRowChange("SIZEREFINERGROUP", e.target.value)}
                                        placeholder="Group Name"
                                    />
                                </td>

                            </tr>
                        )}

                        {/* Existing records rendered via StyleForm */}
                        {displayedRecords.map((row, index) =>
                            isEditMode ? (
                                <tr key={index} className="tr">
                                    <td className="td"><input value={editedRecords[index]?.SIZE ?? ""} onChange={(e) => handleEditRowChange(index, "SIZE", e.target.value)} /></td>
                                    <td className="td"><input type="number" value={editedRecords[index]?.SIZEDISPLAYORDER ?? 0} onChange={(e) => handleEditRowChange(index, "SIZEDISPLAYORDER", e.target.value)} /></td>
                                    <td className="td"><input value={editedRecords[index]?.SIZEREFINERGROUP ?? ""} onChange={(e) => handleEditRowChange(index, "SIZEREFINERGROUP", e.target.value)} /></td>
                                </tr>
                            ) : (
                                <tr key={index} className="tr">
                                    <td className="td">{row.SIZE}</td>
                                    <td className="td">{row.SIZEDISPLAYORDER}</td>
                                    <td className="td">{row.SIZEREFINERGROUP}</td>
                                    <td className="td">
                                        <button
                                            className="btnDanger"
                                            onClick={() => handleDelete(row.GUID)}
                                            disabled={isLoading}
                                        >
                                            🗑 Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
                {/* )} */}


                {rowError && (
                    <p className="rowError">⚠ {rowError}</p>
                )}
            </div>
        </div>
    );
};

export default SizePage;