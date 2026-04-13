import React, { useState, useEffect, useCallback } from "react";
import "./SizeGroup.css";
import type { SizeGroup, SizeLinegroups } from "../productInterface.ts";
import { API_BASE_URL, SIZE_API, SIZE_GROUP } from "../apiRoutes.ts";

const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

// const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const TEMP_SIZE_GUID = "dc6f5ec3-9591-4b39-9e78-a9a6a8d14e9b"; // ← remove when size picker is ready

const createEmptyGroup = (): SizeGroup => ({
    Guid: "",
    SIZEGROUPNAME: "",
    SIZEGROUPDESCRIPTION: "",
    CREATEDBY: LOGGED_IN_USER_ID,
    MODIFIEDBY: LOGGED_IN_USER_ID,
    Lines: [],
});

const createEmptyLine = (): SizeLinegroups => ({
    Guid: "",
    SIZE: TEMP_SIZE_GUID,
    NUMBERINBARCODE: "",
    SIZEGROUPLINEDISPLAYORDER: 0,
    CREATEDBY: LOGGED_IN_USER_ID,
    MODIFIEDBY: LOGGED_IN_USER_ID,
});


const Sizegroup: React.FC = () => {
    const [groups, setGroups] = useState<SizeGroup[]>([]);

    // FIX 1: Track selection by GUID string, NOT by array index.
    // Using index breaks whenever the array is filtered or re-ordered.
    const [selectedGuid, setSelectedGuid] = useState<string>("");

    const [filterText, setFilterText] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [draft, setDraft] = useState<SizeGroup | null>(null);
    const [generalOpen, setGeneralOpen] = useState<boolean>(true);
    const [detailsOpen, setDetailsOpen] = useState<boolean>(true);
    const [isAddingLine, setIsAddingLine] = useState<boolean>(false);
    const [newLine, setNewLine] = useState<SizeLinegroups>(createEmptyLine());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const selected = groups.find(g => g.Guid === selectedGuid) ?? null;
    const displayGroup = isEditing && draft ? draft : selected;

    // FIX 3: Filter is only used for sidebar display.
    // selectedGuid still points to the correct group regardless of filter.
    // const filteredGroups = groups.filter(g =>
    //     g.SIZEGROUPNAME.toLowerCase().includes(filterText.toLowerCase()) ||
    //     (g.SIZEGROUPDESCRIPTION ?? "").toLowerCase().includes(filterText.toLowerCase())
    // );

    const filteredGroups = groups.filter(g => {
        const name = (g.SIZEGROUPNAME ?? "").toLowerCase();
        const desc = (g.SIZEGROUPDESCRIPTION ?? "").toLowerCase();
        const search = filterText.toLowerCase();

        return name.includes(search) || desc.includes(search);
    });

    // ── FETCH ──────────────────────────────────────────────────────────────
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // const res = await fetch(SIZE_GROUP.GET_SIZE_GROUP);
            const res = await fetch(SIZE_GROUP.GET_ALL);
            if (!res.ok) throw new Error(`GET failed: ${res.status}`);
            const data = await res.json();

            let list: SizeGroup[] = [];
            if (Array.isArray(data)) list = data;
            else if (Array.isArray(data.Data)) list = data.Data;
            else if (Array.isArray(data.value)) list = data.value;
            else if (Array.isArray(data.data)) list = data.data;
            else if (Array.isArray(data.items)) list = data.items;
            else if (data && typeof data === "object") list = [data];

            setGroups(list);


            setSelectedGuid(prev => {
                const stillExists = list.some(g => g.Guid === prev);
                return stillExists ? prev : (list[0]?.Guid ?? "");
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // ── HELPERS ────────────────────────────────────────────────────────────
    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    // ── NEW ────────────────────────────────────────────────────────────────
    // FIX 5: Don't push a fake blank into groups[] state.
    // Just open an empty draft. On save → POST → fetchGroups fills the real item.
    const handleNew = () => {
        setDraft(createEmptyGroup());
        setIsEditing(true);
        setSelectedGuid("");
    };

    // ── EDIT / CANCEL ──────────────────────────────────────────────────────
    const startEdit = () => {
        if (!selected) return;
        setDraft(JSON.parse(JSON.stringify(selected))); // deep clone
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setDraft(null);
        setIsAddingLine(false);
        setNewLine(createEmptyLine());
    };

    // ── SAVE ───────────────────────────────────────────────────────────────
    // FIX 6: Plain async function — no useCallback with stale deps.
    // draft.GUID is empty string for new records, truthy GUID for existing ones.
    const handleSave = async () => {
        if (!draft) return;
        if (draft.Guid) {
            await handlePut();
        } else {
            await handlePost();
        }
    };

    // ── POST ───────────────────────────────────────────────────────────────
    // FIX 7: Lines are now included in the POST payload.
    // REPLACE the entire handlePost function:
    // REPLACE entire handlePost:
    const handlePost = async () => {
        if (!draft) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                SIZEGROUPNAME: draft.SIZEGROUPNAME,
                SIZEGROUPDESCRIPTION: draft.SIZEGROUPDESCRIPTION,
                CREATEDBY: LOGGED_IN_USER_ID,
                MODIFIEDBY: LOGGED_IN_USER_ID,
                // Inside handlePost, change the Lines mapping:
                Lines: draft.Lines.filter(l => l.SIZE.trim() !== "").map(l => ({
                    SIZE: l.SIZE,
                    NUMBERINBARCODE: l.NUMBERINBARCODE,
                    SIZEGROUPLINEDISPLAYORDER: l.SIZEGROUPLINEDISPLAYORDER,
                    CREATEDBY: LOGGED_IN_USER_ID,
                    MODIFIEDBY: LOGGED_IN_USER_ID,
                })),
            };

            const res = await fetch(SIZE_GROUP.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`POST failed: ${res.status}`);

            let created: any = null;
            try { created = await res.json(); } catch { }

            showSuccess("Size group created!");
            setIsEditing(false);
            setDraft(null);
            await fetchGroups();
            if (created?.Guid) setSelectedGuid(created.Guid);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };


    const handlePut = async () => {
        if (!draft || !draft.Guid) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                GUID: draft.Guid,        // ← was "Guid: draft.Guid"
                SIZEGROUPNAME: draft.SIZEGROUPNAME,
                SIZEGROUPDESCRIPTION: draft.SIZEGROUPDESCRIPTION,
                MODIFIEDBY: LOGGED_IN_USER_ID, // ← no CREATEDBY in PUT schema
                Lines: draft.Lines.map(l => ({
                    SIZE: l.SIZE,
                    NUMBERINBARCODE: l.NUMBERINBARCODE,
                    SIZEGROUPLINEDISPLAYORDER: l.SIZEGROUPLINEDISPLAYORDER,
                    MODIFIEDBY: LOGGED_IN_USER_ID, // ← no CREATEDBY in line either
                })),
            };

            const res = await fetch(SIZE_GROUP.UPDATE, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`PUT failed: ${res.status}`);

            showSuccess("Size group updated!");
            setIsEditing(false);
            setDraft(null);
            await fetchGroups();

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── DELETE GROUP ───────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selected?.Guid) return;
        if (!window.confirm(`Delete "${selected.SIZEGROUPNAME}"?`)) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(SIZE_GROUP.DELETE, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Guid: selected.Guid }),
            });
            if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);

            // FIX 11: Clear Guid so fetchGroups picks first item automatically
            setSelectedGuid("");
            await fetchGroups();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── ADD LINE ───────────────────────────────────────────────────────────
    // const handleAddLine = () => {
    //     if (!draft) return;
    //     if (!newLine.SIZE.trim()) {
    //         setError("Size Guid is required.");
    //         return;
    //     }
    //     setDraft(prev =>
    //         prev ? { ...prev, Lines: [...prev.Lines, { ...newLine }] } : prev
    //     );
    //     setNewLine(createEmptyLine());
    //     setIsAddingLine(false);
    // };

    const handleAddLine = async () => {
        if (!newLine.SIZE.trim()) {
            setError("Size GUID is required.");
            return;
        }

        if (draft?.Guid) {

            const updatedLines = [...(draft.Lines ?? []), { ...newLine }];
            setLoading(true);
            setError(null);
            try {
                const payload = {
                    GUID: draft.Guid,        // ← was "Guid: draft.Guid"
                    SIZEGROUPNAME: draft.SIZEGROUPNAME,
                    SIZEGROUPDESCRIPTION: draft.SIZEGROUPDESCRIPTION,
                    MODIFIEDBY: LOGGED_IN_USER_ID,
                    Lines: updatedLines.map(l => ({
                        SIZE: l.SIZE,
                        NUMBERINBARCODE: l.NUMBERINBARCODE,
                        SIZEGROUPLINEDISPLAYORDER: l.SIZEGROUPLINEDISPLAYORDER,
                        MODIFIEDBY: LOGGED_IN_USER_ID,
                    })),
                };
                const res = await fetch(SIZE_GROUP.UPDATE, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
                showSuccess("Line added!");
                setIsAddingLine(false);
                setNewLine(createEmptyLine());
                await fetchGroups();
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        } else if (draft) {
            // New group not saved yet → just add to draft
            setDraft(prev =>
                prev ? { ...prev, Lines: [...prev.Lines, { ...newLine }] } : prev
            );
            setNewLine(createEmptyLine());
            setIsAddingLine(false);
        }
    };

    // ── DELETE LINE ────────────────────────────────────────────────────────
    // REPLACE the entire handleDeleteLine function:
    // REPLACE entire handleDeleteLine:
    const handleDeleteLine = async (lineIdx: number) => {
        if (!draft) return;
        const line = draft.Lines[lineIdx];

        if (line.Guid) {
            // Already saved on server — delete it via API
            setLoading(true);
            try {
                const res = await fetch(SIZE_GROUP.DELETE_LINE, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Guid: line.Guid }),
                });
                if (!res.ok) throw new Error(`Delete line failed: ${res.status}`);
                showSuccess("Line deleted.");
            } catch (e: any) {
                setError(e.message);
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        }

        // Remove from draft (new unsaved line, or server delete succeeded)
        setDraft(prev =>
            prev ? { ...prev, Lines: prev.Lines.filter((_, i) => i !== lineIdx) } : prev
        );
    };

    // ── RENDER ─────────────────────────────────────────────────────────────
    return (
        <div className="sgl-shell">

            {error && (
                <div className="sgl-toast sgl-toast-error" onClick={() => setError(null)}>
                    ⚠ {error}
                </div>
            )}
            {successMsg && (
                <div className="sgl-toast sgl-toast-success">
                    ✓ {successMsg}
                </div>
            )}

            {/* ══ COMMAND BAR ══ */}
            <div className="sgl-commandBar">
                <button className="sgl-cmd-icon-btn">&#8592;</button>
                <button className="sgl-cmd-icon-btn sgl-hamburger">&#9776;</button>

                <div className="sgl-cmd-actions">
                    <button
                        className="sgl-cmd-btn sgl-cmd-save"
                        onClick={handleSave}
                        disabled={!isEditing || loading}
                    >
                        <span>&#128190;</span> Save
                    </button>
                    <button
                        className="sgl-cmd-btn"
                        onClick={handleNew}
                        disabled={loading}
                    >
                        <span>+</span> New
                    </button>
                    <button
                        className="sgl-cmd-btn"
                        onClick={handleDelete}
                        disabled={!selected?.Guid || loading}
                    >
                        <span>🗑</span> Delete
                    </button>
                </div>

                <div className="sgl-cmd-divider" />

                <div className="sgl-cmd-tabs">
                    <span className="sgl-cmd-tab sgl-cmd-tab-active">Options</span>
                </div>

                <div className="sgl-cmd-right">
                    <button
                        className="sgl-cmd-icon-btn"
                        onClick={fetchGroups}
                        disabled={loading}
                        title="Refresh"
                    >
                        {loading ? "…" : "↺"}
                    </button>
                </div>
            </div>

            {/* ══ BODY ══ */}
            <div className="sgl-body">

                {/* ══ SIDEBAR ══ */}
                <div className="sgl-sidebar">
                    <div className="sgl-sidebar-filter">
                        <span className="sgl-filter-icon">&#128269;</span>
                        <input
                            type="text"
                            placeholder="Filter"
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            className="sgl-filter-input"
                        />
                    </div>
                    <div className="sgl-sidebar-list">
                        {/* FIX 12: Use filteredGroups, highlight by GUID not index */}
                        {filteredGroups.map(g => (
                            <div
                                key={g.Guid || `name-${g.SIZEGROUPNAME}`}
                                className={`sgl-sidebar-item ${selectedGuid === g.Guid ? "sgl-sidebar-item-active" : ""}`}
                                onClick={() => {
                                    setSelectedGuid(g.Guid);
                                    setIsEditing(false);
                                    setDraft(null);
                                    setIsAddingLine(false);
                                }}
                            >
                                <div className="sgl-item-code">{g.SIZEGROUPNAME || "—"}</div>
                                <div className="sgl-item-desc">{g.SIZEGROUPDESCRIPTION || "No description"}</div>
                            </div>
                        ))}
                        {filteredGroups.length === 0 && !loading && (
                            <div className="sgl-sidebar-empty">No records found</div>
                        )}
                    </div>
                </div>

                {/* ══ DETAIL PANEL ══ */}
                <div className="sgl-detail">

                    <div className="sgl-std-view">Standard view &#8964;</div>
                    <h1 className="sgl-detail-title">Size Group</h1>

                    {/* ── Header Card ── */}
                    <div className="sgl-header-card">
                        <div className="sgl-header-fields">

                            <div className="sgl-field-group">
                                <label className="sgl-field-label">Size Group Name</label>
                                <input
                                    className="sgl-field-input sgl-field-medium"
                                    value={displayGroup?.SIZEGROUPNAME ?? ""}
                                    onChange={e => setDraft(p => p ? { ...p, SIZEGROUPNAME: e.target.value } : p)}
                                    disabled={!isEditing}
                                    placeholder="Enter name"
                                />
                            </div>

                            <div className="sgl-field-group">
                                <label className="sgl-field-label">Description</label>
                                <input
                                    className="sgl-field-input sgl-field-guid"
                                    value={displayGroup?.SIZEGROUPDESCRIPTION ?? ""}
                                    onChange={e => setDraft(p => p ? { ...p, SIZEGROUPDESCRIPTION: e.target.value } : p)}
                                    disabled={!isEditing}
                                    placeholder="Enter description"
                                />
                            </div>

                            <div className="sgl-header-actions">
                                {!isEditing ? (
                                    <button
                                        className="sgl-btn-edit"
                                        onClick={startEdit}
                                        disabled={!selected}
                                    >
                                        &#9998; Edit
                                    </button>
                                ) : (
                                    <button className="sgl-btn-secondary" onClick={cancelEdit}>
                                        Cancel
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ══ GENERAL SECTION ══ */}
                    <div className="sgl-section">
                        <div
                            className="sgl-section-header"
                            onClick={() => setGeneralOpen(v => !v)}
                        >
                            <span>General</span>
                            <span className="sgl-chevron">{generalOpen ? "∧" : "∨"}</span>
                        </div>

                        {generalOpen && (
                            <div className="sgl-section-body">
                                <div className="sgl-general-grid">

                                    <div className="sgl-gen-col">
                                        <div className="sgl-col-title">AUDIT</div>
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Created by</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.CREATEDBY ?? ""}
                                                disabled
                                            />
                                        </div>
                                        <div className="sgl-field-group sgl-mt">
                                            <label className="sgl-field-label">Modified by</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.MODIFIEDBY ?? ""}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sgl-section">
                        <div
                            className="sgl-section-header"
                            onClick={() => setDetailsOpen(v => !v)}
                        >
                            <span>Lines</span>
                            <span className="sgl-chevron">{detailsOpen ? "∧" : "∨"}</span>
                        </div>

                        {detailsOpen && (
                            <div className="sgl-section-body">

                                <div className="sgl-addr-toolbar">
                                    {(isEditing || selected?.Guid) && (
                                        <button
                                            className="sgl-add-btn"
                                            onClick={() => {
                                                setIsAddingLine(v => !v);
                                                setNewLine(createEmptyLine());
                                            }}
                                        >
                                            {isAddingLine ? "✕ Cancel" : "+ Add"}
                                        </button>
                                    )}
                                </div>

                                {isAddingLine && (
                                    <div className="sgl-add-line-form">
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Size</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                placeholder="3fa85f64-..."
                                                value={newLine.SIZE}
                                                onChange={e => setNewLine(p => ({ ...p, SIZE: e.target.value }))}
                                            />
                                        </div>
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Number in Barcode</label>
                                            <input
                                                className="sgl-field-input sgl-field-medium"
                                                placeholder="e.g. ST001"
                                                value={newLine.NUMBERINBARCODE}
                                                onChange={e => setNewLine(p => ({ ...p, NUMBERINBARCODE: e.target.value }))}
                                            />
                                        </div>
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Display Order</label>
                                            <input
                                                type="number"
                                                className="sgl-field-input sgl-field-short"
                                                value={newLine.SIZEGROUPLINEDISPLAYORDER}
                                                onChange={e => setNewLine(p => ({ ...p, SIZEGROUPLINEDISPLAYORDER: Number(e.target.value) }))}
                                            />
                                        </div>
                                        <div className="sgl-add-line-confirm">
                                            <button className="sgl-btn-confirm" onClick={handleAddLine}>
                                                ✓ Add Line
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <table className="sgl-table">
                                    <thead>
                                        <tr>
                                            <th>Size</th>
                                            <th>Number in Barcode</th>
                                            <th>Display Order</th>
                                            {isEditing && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* FIX 13: displayGroup comes from selected (by GUID),
                                            so Lines always belong to the clicked group only */}
                                        {/* {(displayGroup?.Lines ?? []).map((l, i) => (
                                            <tr key={i}> */}
                                        {(displayGroup?.Lines ?? []).map((l, i) => (
                                            <tr key={l.Guid || `line-${i}-${l.SIZE}`}>
                                                <td className="sgl-guid-cell">{l.SIZE}</td>
                                                <td>{l.NUMBERINBARCODE}</td>
                                                <td>{l.SIZEGROUPLINEDISPLAYORDER}</td>
                                                {(isEditing || selected?.Guid) && (
                                                    <td>
                                                        <button className="sgl-delete-line-btn" onClick={() => handleDeleteLine(i)} disabled={loading}>

                                                            🗑
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {(displayGroup?.Lines ?? []).length === 0 && (
                                            <tr>
                                                <td colSpan={isEditing ? 4 : 3} className="sgl-empty-row">
                                                    No lines added
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Sizegroup;



