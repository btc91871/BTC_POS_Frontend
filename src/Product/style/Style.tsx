import React, { useState, useMemo, useEffect } from "react";
import StyleForm from "../../components/Forms/styleForm";
import { STYLE_API } from "../apiRoutes.ts";
import type { StyleRecord } from "../productInterface.ts";
// import Sidebar from "../../components/Sidebar/Sidebar";
import "./Style.css";

type SortDirection = "asc" | "desc" | null;
type SortKey = keyof StyleRecord | null;


const LOGGED_IN_USER_ID = localStorage.getItem("userId") ?? "";
const AUTH_TOKEN = localStorage.getItem("token") ?? "";

const EMPTY_ROW: StyleRecord = {
    GUID: "",
    STYLE: "",
    STYLENAME: "",
    STYLEDESCRIPTION: "",
    STYLEDISPLAYORDER: 0,
    STYLEREFINERGROUP: "",
    hexcode: "",
    url: "",
};

const StylesPage: React.FC = () => {

    const [records, setRecords] = useState<StyleRecord[]>([]);
    const [filterText, setFilterText] = useState<string>("");
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortDir, setSortDir] = useState<SortDirection>(null);
    const [newRow, setNewRow] = useState<StyleRecord | null>(null);
    const [rowError, setRowError] = useState<string>("");
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editedRecords, setEditedRecords] = useState<StyleRecord[]>([]);
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [pageError, setPageError] = useState<string>("");

    useEffect(() => {
        const loadStyles = async () => {
            try {
                setPageLoading(true);
                const response = await fetch(STYLE_API.GET_STYLE, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // "Authorization": `Bearer ${AUTH_TOKEN}`,
                    },
                });
                console.log("Fetch styles response:", response);
                if (!response.ok) throw new Error("Failed to fetch styles.");
                const data = await response.json();
                console.log("RAW DATA:", data);

                const arr = Array.isArray(data) ? data
                    : Array.isArray(data?.Data) ? data.Data
                        : [];
                setRecords(arr);
            } catch (err) {
                setPageError("Could not load styles. Please refresh the page.");
                console.error(err);
            } finally {
                setPageLoading(false);
            }
        };

        loadStyles();
    }, []);

    const displayedRecords = useMemo<StyleRecord[]>(() => {
        if (!Array.isArray(records)) return [];
        let result = records.filter((r) => {
            const q = filterText.toLowerCase();
            return (
                r.STYLE.toLowerCase().includes(q) ||
                r.STYLENAME.toLowerCase().includes(q) ||
                r.STYLEREFINERGROUP.toLowerCase().includes(q) ||
                r.hexcode.toLowerCase().includes(q)
            );
        });

        if (sortKey && sortDir) {
            result = [...result].sort((a, b) => {
                const av = a[sortKey];
                const bv = b[sortKey];
                if (av < bv) return sortDir === "asc" ? -1 : 1;
                if (av > bv) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [records, filterText, sortKey, sortDir]);

    const handleSort = (key: keyof StyleRecord): void => {
        if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
        else if (sortDir === "asc") { setSortDir("desc"); }
        else { setSortKey(null); setSortDir(null); }
    };

    const getSortIcon = (key: keyof StyleRecord): string => {
        if (sortKey !== key) return "↕";
        return sortDir === "asc" ? "↑" : "↓";
    };

    const handleTableChange = (index: number, field: keyof StyleRecord, value: string): void => {
        const updated = [...records];
        updated[index] = {
            ...updated[index],
            [field]: field === "STYLEDISPLAYORDER" ? Number(value) : value,
        };
        setRecords(updated);
    };

    const addRow = (): void => {
        if (newRow) return;
        setNewRow({ ...EMPTY_ROW });
    };

    const handleNewRowChange = (field: keyof StyleRecord, value: string): void => {
        if (!newRow) return;
        setNewRow({
            ...newRow,
            [field]: field === "STYLEDISPLAYORDER" ? Number(value) : value,
        });
        setRowError("");
    };


    const handleSave = async (): Promise<void> => {
        if (!newRow?.STYLE.trim()) {
            setRowError("Style code is required.");
            return;
        }

        setIsLoading(true);
        setRowError("");

        const payload = {
            style: newRow.STYLE,
            stylename: newRow.STYLENAME,
            styledescription: newRow.STYLEDESCRIPTION,
            styledisplayorder: newRow.STYLEDISPLAYORDER,
            stylerefinergroup: newRow.STYLEREFINERGROUP,
            createdby: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            modifiedby: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        };

        console.log("Saving new style with payload:", payload);

        try {
            const response = await fetch(STYLE_API.CREATE_STYLE, {
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

            const created = await response.json();
            const savedRecord: StyleRecord = {
                GUID: created.GUID ?? created.guid ?? created.Id ?? created.id ?? "",
                STYLE: created.STYLE ?? created.style ?? newRow.STYLE,
                STYLENAME: created.STYLENAME ?? created.stylename ?? newRow.STYLENAME,
                STYLEDESCRIPTION: created.STYLEDESCRIPTION ?? created.styledescription ?? newRow.STYLEDESCRIPTION,
                STYLEDISPLAYORDER: created.STYLEDISPLAYORDER ?? created.styledisplayorder ?? newRow.STYLEDISPLAYORDER,
                STYLEREFINERGROUP: created.STYLEREFINERGROUP ?? created.stylerefinergroup ?? newRow.STYLEREFINERGROUP,
                hexcode: created.hexcode ?? "",
                url: created.url ?? "",
            };

            setRecords((prev) => [...prev, savedRecord]);
            setNewRow(null);
            showSuccess(`Style "${newRow.STYLE}" saved successfully.`);

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
        setFilterText("");
        setSortKey(null);
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

    const handleEditRowChange = (guid: string, field: keyof StyleRecord, value: string): void => {
        setEditedRecords(prev =>
            prev.map(r =>
                r.GUID === guid
                    ? { ...r, [field]: field === "STYLEDISPLAYORDER" ? Number(value) : value }
                    : r
            )
        );
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
                    console.warn("Skipping row with no GUID:", row);
                    continue;
                }
                const payload = {
                    GUID: row.GUID,
                    STYLE: row.STYLE,
                    STYLENAME: row.STYLENAME,
                    STYLEDESCRIPTION: row.STYLEDESCRIPTION,
                    STYLEDISPLAYORDER: row.STYLEDISPLAYORDER,
                    STYLEREFINERGROUP: row.STYLEREFINERGROUP,
                    MODIFIEDBY: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                };

                console.log("Updating style with payload:", payload);
                const response = await fetch(STYLE_API.UPDATE_STYLE, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || `Failed to update "${row.STYLE}"`);
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
        if (!window.confirm("Are you sure you want to delete this style?")) return;
        setIsLoading(true);
        try {
            const response = await fetch(STYLE_API.DELETE_STYLE, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ GUID: guid }),
            });
            if (!response.ok) throw new Error("Failed to delete.");
            setRecords(prev => prev.filter(r => r.GUID !== guid));
            showSuccess("Style deleted successfully.");
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
                        <button className="btnSecondary" onClick={handleEditClick} disabled={isLoading || pageLoading}>
                            ✏ Edit
                        </button>
                    </>
                )}

                {/* Show Save + Delete for new row */}
                {newRow && !isEditMode && (
                    <>
                        <button className="btnPrimary" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                        <button className="btnSecondary" onClick={() => { setNewRow(null); setRowError(""); }} disabled={isLoading}>
                            Delete
                        </button>
                    </>
                )}

                {/* EDIT MODE BUTTONS */}
                {isEditMode && (
                    <>
                        <button className="btnPrimary" onClick={handleSaveEdit} disabled={isLoading}>
                            {isLoading ? "Saving..." : "💾 Save"}
                        </button>
                        <button className="btnSecondary" onClick={handleCancelEdit} disabled={isLoading}>
                            ❌ Cancel
                        </button>
                    </>
                )}
            </div>

            <p className="breadcrumb">Style</p>

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
                            <th className="th" onClick={() => handleSort("STYLE")}>
                                Style {getSortIcon("STYLE")}
                            </th>
                            <th className="th" onClick={() => handleSort("STYLEDISPLAYORDER")}>
                                Display Order {getSortIcon("STYLEDISPLAYORDER")}
                            </th>

                            <th className="th" onClick={() => handleSort("STYLEREFINERGROUP")}>
                                RefinerGroup {getSortIcon("STYLEREFINERGROUP")}
                            </th>
                            <th className="th">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {newRow && (
                            <tr className="tr">
                                <td className="td">
                                    <input
                                        value={newRow.STYLE}
                                        onChange={(e) => handleNewRowChange("STYLE", e.target.value)}
                                        placeholder="Style code *"
                                    />
                                </td>
                                <td className="td">
                                    <input
                                        type="number"
                                        value={newRow.STYLEDISPLAYORDER}
                                        onChange={(e) => handleNewRowChange("STYLEDISPLAYORDER", e.target.value)}
                                    />
                                </td>

                                <td className="td">
                                    <input
                                        value={newRow.STYLEREFINERGROUP}
                                        onChange={(e) => handleNewRowChange("STYLEREFINERGROUP", e.target.value)}
                                        placeholder="Group Name"
                                    />
                                </td>

                            </tr>
                        )}

                        {/* Existing records rendered via StyleForm */}
                        {displayedRecords.map((row, index) =>
                            isEditMode ? (
                                <tr key={row.GUID} className="tr">
                                    <td className="td"><input value={editedRecords.find(r => r.GUID === row.GUID)?.STYLE ?? ""} onChange={(e) => handleEditRowChange(row.GUID, "STYLE", e.target.value)} /></td>
                                    <td className="td"><input type="number" value={editedRecords.find(r => r.GUID === row.GUID)?.STYLEDISPLAYORDER ?? 0} onChange={(e) => handleEditRowChange(row.GUID, "STYLEDISPLAYORDER", e.target.value)} /></td>
                                    {/* <td className="td"><input value={editedRecords.find(r => r.GUID === row.GUID)?.HEXCODE ?? ""} onChange={(e) => handleEditRowChange(row.GUID, "HEXCODE", e.target.value)} /></td>
                                    <td className="td"><input value={editedRecords.find(r => r.GUID === row.GUID)?.URL ?? ""} onChange={(e) => handleEditRowChange(row.GUID, "URL", e.target.value)} /></td> */}
                                    <td className="td"><input value={editedRecords.find(r => r.GUID === row.GUID)?.STYLEREFINERGROUP ?? ""} onChange={(e) => handleEditRowChange(row.GUID, "STYLEREFINERGROUP", e.target.value)} /></td>
                                </tr>
                            ) : (
                                <tr key={row.GUID} className="tr">
                                    <td className="td">{row.STYLE}</td>
                                    <td className="td">{row.STYLEDISPLAYORDER}</td>

                                    <td className="td">{row.STYLEREFINERGROUP}</td>

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

export default StylesPage;