import React, { useState, useEffect, useCallback } from "react";
// import "./StyleGroup.css";
import type { SizeLinegroups } from "../productInterface.ts";




const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const API_BASE_URL = "http://192.168.0.110";

const EMPTY_LINE: SizeLinegroups = {
    SIZE: "",
    NUMBERINBARCODE: "",
    SIZEGROUPLINEDISPLAYORDER: 0,
    CREATEDBY: LOGGED_IN_USER_ID,
    MODIFIEDBY: LOGGED_IN_USER_ID,
};


const SizeLine: React.FC = () => {

    const [groups, setGroups] = useState<StyleGroup[]>([]);
    const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);
    const [filterText, setFilterText] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [draft, setDraft] = useState<StyleGroup | null>(null);
    const [isAddingLine, setIsAddingLine] = useState<boolean>(false);
    const [newLine, setNewLine] = useState<StyleGroupLine>({ ...EMPTY_LINE });
    const [generalOpen, setGeneralOpen] = useState<boolean>(true);
    const [detailsOpen, setDetailsOpen] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const selected = groups[selectedGroupIdx] ?? null;
    const displayGroup = isEditing && draft ? draft : selected;

    // ──────────────────────────────────────────────
    // GET
    // ──────────────────────────────────────────────
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/Style/GetStyleGroupsWithLines`);
            if (!res.ok) throw new Error(`GET failed: ${res.status}`);
            const data = await res.json();

            let list: StyleGroup[] = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (Array.isArray(data.value)) {
                list = data.value;
            } else if (Array.isArray(data.data)) {
                list = data.data;
            } else if (Array.isArray(data.items)) {
                list = data.items;
            } else if (data && typeof data === "object") {
                list = [data];
            }

            setGroups(list);
            setSelectedGroupIdx(0);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // ──────────────────────────────────────────────
    // POST
    // ──────────────────────────────────────────────
    const handlePost = async () => {
        if (!draft) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                stylegroupname: draft.stylegroupname,
                stylegroupdescription: draft.stylegroupdescription,
                createdby: LOGGED_IN_USER_ID,
                modifiedby: LOGGED_IN_USER_ID,
                lines: draft.lines.map(l => ({
                    style: l.style,
                    numberinbarcode: l.numberinbarcode,
                    stylegrouplinedisplayorder: l.stylegrouplinedisplayorder,
                    createdby: LOGGED_IN_USER_ID,
                    modifiedby: LOGGED_IN_USER_ID,
                })),
            };

            const res = await fetch(`${API_BASE_URL}/api/Style/createStyleGroupNdLines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`POST failed: ${res.status}`);
            setSuccessMsg("Style group created!");
            setTimeout(() => setSuccessMsg(null), 3000);
            setIsEditing(false);
            setDraft(null);
            await fetchGroups();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };


    const handlePut = async () => {
        if (!draft || !selected?.id) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                id: selected.id,
                stylegroupname: draft.stylegroupname,
                stylegroupdescription: draft.stylegroupdescription,
                createdby: draft.createdby,
                modifiedby: LOGGED_IN_USER_ID,
                lines: draft.lines.map(l => ({
                    style: l.style,
                    numberinbarcode: l.numberinbarcode,
                    stylegrouplinedisplayorder: l.stylegrouplinedisplayorder,
                    createdby: l.createdby,
                    modifiedby: LOGGED_IN_USER_ID,
                })),
            };

            const res = await fetch(`${API_BASE_URL}/api/Style/updateStyleGroupById`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
            setSuccessMsg("Style group updated!");
            setTimeout(() => setSuccessMsg(null), 3000);
            setIsEditing(false);
            setDraft(null);
            await fetchGroups();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────────────────────────────────
    // DELETE
    // ──────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selected?.id) return;
        if (!window.confirm("Delete this style group?")) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/Style/updateStyleGroupById`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selected.id }),
            });

            if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
            setSelectedGroupIdx(0);
            await fetchGroups();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────────────────────────────────
    // SAVE ROUTER — decides POST or PUT
    // ──────────────────────────────────────────────
    const handleSave = () => {
        if (!draft) return;
        if (draft.lines.length === 0) {
            setError("Please add at least one line before saving.");
            return;
        }
        if (selected?.id) {
            handlePut();
        } else {
            handlePost();
        }
    };

    // ──────────────────────────────────────────────
    // LOCAL HELPERS
    // ──────────────────────────────────────────────
    const handleNew = () => {
        const blank = { ...EMPTY_GROUP };
        setGroups(prev => [blank, ...prev]);
        setSelectedGroupIdx(0);
        setDraft({ ...blank });
        setIsEditing(true);
    };

    const startEdit = () => {
        if (selected) {
            setDraft(JSON.parse(JSON.stringify(selected)));
            setIsEditing(true);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setDraft(null);
        if (!selected?.id) {
            setGroups(prev => prev.filter((_, i) => i !== selectedGroupIdx));
            setSelectedGroupIdx(0);
        }
    };

    const handleAddLine = () => {
        if (!newLine.style || !newLine.numberinbarcode) {
            setError("Style and Number in Barcode are required.");
            return;
        }
        setDraft(prev =>
            prev ? { ...prev, lines: [...prev.lines, { ...newLine }] } : prev
        );
        setNewLine({ ...EMPTY_LINE });
        setIsAddingLine(false);
        setError(null);
    };

    const handleDeleteLine = (lineIdx: number) => {
        setDraft(prev =>
            prev ? { ...prev, lines: prev.lines.filter((_, i) => i !== lineIdx) } : prev
        );
    };

    // ──────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────
    return (
        <div className="sgl-shell">

            {/* ══ TOASTS ══ */}
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
                        disabled={!selected?.id || loading}
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
                        {groups
                            .filter(g =>
                                g.stylegroupname.toLowerCase().includes(filterText.toLowerCase()) ||
                                g.stylegroupdescription?.toLowerCase().includes(filterText.toLowerCase())
                            )
                            .map((g, idx) => (
                                <div
                                    key={idx}
                                    className={`sgl-sidebar-item ${selectedGroupIdx === idx ? "sgl-sidebar-item-active" : ""}`}
                                    onClick={() => {
                                        setSelectedGroupIdx(idx);
                                        setIsEditing(false);
                                        setDraft(null);
                                    }}
                                >
                                    <div className="sgl-item-code">{g.stylegroupname || "—"}</div>
                                    <div className="sgl-item-desc">{g.stylegroupdescription || "No description"}</div>
                                </div>
                            ))
                        }
                        {groups.length === 0 && !loading && (
                            <div className="sgl-sidebar-empty">No records found</div>
                        )}
                    </div>
                </div>

                {/* ══ DETAIL PANEL ══ */}
                <div className="sgl-detail">

                    <div className="sgl-std-view">Standard view &#8964;</div>
                    <h1 className="sgl-detail-title">Style Group</h1>

                    {/* ── Header Card ── */}
                    <div className="sgl-header-card">
                        <div className="sgl-header-fields">

                            <div className="sgl-field-group">
                                <label className="sgl-field-label">Style Group Name</label>
                                <input
                                    className="sgl-field-input sgl-field-medium"
                                    value={displayGroup?.stylegroupname ?? ""}
                                    onChange={e => setDraft(p => p ? { ...p, stylegroupname: e.target.value } : p)}
                                    disabled={!isEditing}
                                    placeholder="Enter name"
                                />
                            </div>

                            <div className="sgl-field-group">
                                <label className="sgl-field-label">Description</label>
                                <input
                                    className="sgl-field-input sgl-field-guid"
                                    value={displayGroup?.stylegroupdescription ?? ""}
                                    onChange={e => setDraft(p => p ? { ...p, stylegroupdescription: e.target.value } : p)}
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
                                        &#8212; Edit
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

                                    {/* COL 1 — INFORMATION */}
                                    <div className="sgl-gen-col">
                                        <div className="sgl-col-title">INFORMATION</div>

                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Style Group Name</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.stylegroupname ?? ""}
                                                disabled
                                            />
                                        </div>

                                        <div className="sgl-field-group sgl-mt">
                                            <label className="sgl-field-label">Description</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.stylegroupdescription ?? ""}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    {/* COL 2 — AUDIT */}
                                    <div className="sgl-gen-col">
                                        <div className="sgl-col-title">AUDIT</div>

                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Created by</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.createdby ?? ""}
                                                disabled
                                            />
                                        </div>

                                        <div className="sgl-field-group sgl-mt">
                                            <label className="sgl-field-label">Modified by</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.modifiedby ?? ""}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>

                    {/* ══ LINES SECTION ══ */}
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
                                    {isEditing && (
                                        <button
                                            className="sgl-add-btn"
                                            onClick={() => setIsAddingLine(v => !v)}
                                        >
                                            {isAddingLine ? "✕ Cancel" : "+ Add"}
                                        </button>
                                    )}
                                </div>

                                {/* ── Inline add line form ── */}
                                {isEditing && isAddingLine && (
                                    <div className="sgl-add-line-form">
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Style (GUID)</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                placeholder="3fa85f64-..."
                                                value={newLine.style}
                                                onChange={e => setNewLine(p => ({ ...p, style: e.target.value }))}
                                            />
                                        </div>
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Number in Barcode</label>
                                            <input
                                                className="sgl-field-input sgl-field-medium"
                                                placeholder="e.g. ST001"
                                                value={newLine.numberinbarcode}
                                                onChange={e => setNewLine(p => ({ ...p, numberinbarcode: e.target.value }))}
                                            />
                                        </div>
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Display Order</label>
                                            <input
                                                type="number"
                                                className="sgl-field-input sgl-field-short"
                                                value={newLine.stylegrouplinedisplayorder}
                                                onChange={e => setNewLine(p => ({ ...p, stylegrouplinedisplayorder: Number(e.target.value) }))}
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
                                            <th>Style</th>
                                            <th>Number in Barcode</th>
                                            <th>Display Order</th>
                                            {isEditing && <th></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(displayGroup?.lines ?? []).map((l, i) => (
                                            <tr key={i}>
                                                <td className="sgl-guid-cell">{l.style}</td>
                                                <td>{l.numberinbarcode}</td>
                                                <td>{l.stylegrouplinedisplayorder}</td>
                                                {isEditing && (
                                                    <td>
                                                        <button
                                                            className="sgl-delete-line-btn"
                                                            onClick={() => handleDeleteLine(i)}
                                                        >
                                                            🗑
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {(displayGroup?.lines ?? []).length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={isEditing ? 4 : 3}
                                                    className="sgl-empty-row"
                                                >
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

export default SizeLine;