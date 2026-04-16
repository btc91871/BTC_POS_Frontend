import React, { useState, useEffect } from "react";
import { Storage_API } from "../apiRoutes";
import type { StorageLine as Line, StorageGroup as Group } from "../productInterface";
// import type { Storage_API } from "../apiRoutes";
import "./storage.css";
import axios from "axios";


const DATAAREAID = "IND";
const USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const LINE_BOOL_COLS = [
    { key: "ISACTIVE", label: "Active" },
    { key: "ISBLOTRECEIPTALLOWED", label: "Blot Receipt" },
    { key: "ISBLANKISSUEALLOWED", label: "Blank Issue" },
    { key: "ISPHYSICALINVENTORY", label: "Physical Inv." },
    { key: "ISFINANCIALINVENTORY", label: "Financial Inv." },
    { key: "ISCOVERAGEPLAN", label: "Coverage Plan" },
    { key: "ISFORPURCHASEPRICES", label: "Purchase Prices" },
    { key: "ISFORSALESPRICES", label: "Sales Prices" },
    { key: "ISTRANSFER", label: "Transfer" },
] as const;

// Returns a blank "new line" form object
function blankLine() {
    return {
        NAME: 0,
        ISACTIVE: true,
        ISBLOTRECEIPTALLOWED: false,
        ISBLANKISSUEALLOWED: false,
        ISPHYSICALINVENTORY: true,
        ISFINANCIALINVENTORY: false,
        ISCOVERAGEPLAN: false,
        ISFORPURCHASEPRICES: false,
        ISFORSALESPRICES: false,
        ISTRANSFER: false,
        DISPLAYORDER: 0,
        DATAAREAID,
    };
}


type NewLine = ReturnType<typeof blankLine>;

const StorageDimGroupPage: React.FC = () => {

    const [groups, setGroups] = useState<Group[]>([]);
    const [selected, setSelected] = useState<Group | null>(null);
    const [formData, setFormData] = useState<Group | null>(null);
    const [mode, setMode] = useState<"view" | "new" | "edit">("view");
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [showAddLine, setShowAddLine] = useState(false);
    const [newLine, setNewLine] = useState<NewLine>(blankLine());

    useEffect(() => { loadAll(); }, []);

    useEffect(() => {
        if (!msg) return;
        const t = setTimeout(() => setMsg(null), 4000);
        return () => clearTimeout(t);
    }, [msg]);


    async function loadAll(selectGuid?: string) {


        setPageLoading(true);
        try {
            const res = await axios.get(Storage_API.GET_ALL + "/" + DATAAREAID, { headers: { accept: "*/*", } });
            if (!res.data) throw new Error(`Server error: ${res.status}`);
            const response = res.data;
            console.log("RAW RESPONSE:", response.Data);
            let data: Group[] = [];
            if (Array.isArray(response.Data)) data = response.Data;
            else if (Array.isArray(response.Data?.Data)) data = response.Data.Data;
            else if (Array.isArray(response.Data)) data = response.Data;
            else if (Array.isArray(response.data)) data = response.data;

            setGroups(response.Data || []);
            console.log("FULL DATA FROM SERVER:", data);
            console.log("LINES FROM SERVER:", data[0]?.Lines);

            if (data.length > 0) {
                if (selectGuid) {
                    const found = data.find(g => g.Guid === selectGuid);
                    if (found) { selectGroup(found); return; }

                    const direct = await fetchById(selectGuid);
                    if (direct) {
                        setGroups([direct, ...data]);
                        selectGroup(direct);
                        return;
                    }
                }
                selectGroup(data[0]);
            } else {
                setSelected(null);
                setFormData(null);
            }
        } catch (e: any) {
            console.log("catch", e);
            setMsg({ text: `Could not load: ${e.message}`, ok: false });
        } finally {
            setPageLoading(false);
        }
    }

    async function fetchById(guid: string): Promise<Group | null> {
        try {
            const res = await fetch(Storage_API.GET_BY_ID, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ GUID: guid, DATAAREAID }),
            });
            const raw = await res.json();
            const item: Group = raw?.Data ?? raw;
            return item?.Guid ? item : null;
        } catch { return null; }
    }

    async function createGroup() {
        if (!formData?.STORAGEDIMGROUPNAME.trim()) {
            setMsg({ text: "Name is required.", ok: false }); return;
        }
        setLoading(true);
        try {
            const res = await fetch(Storage_API.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    STORAGEDIMGROUPNAME: formData.STORAGEDIMGROUPNAME,
                    STORAGEDIMGROUPDESC: formData.STORAGEDIMGROUPDESC,
                    DATAAREAID,
                    CREATEDBY: USER_ID,
                    MODIFIEDBY: USER_ID,
                    Lines: [],  // lines are added separately after the group is saved
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json?.Success === false)
                throw new Error(json?.Message || `Failed: ${res.status}`);

            const newGuid: string = json?.Data?.Guid ?? json?.Guid ?? "";
            setMsg({ text: "Group created!", ok: true });
            setMode("view");
            await loadAll(newGuid || undefined);
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally { setLoading(false); }
    }


    async function updateGroup(linesToSend?: Line[]) {
        if (!formData || !selected) return false;
        setLoading(true);
        try {
            const lines = linesToSend ?? formData.Lines ?? [];

            const res = await fetch(Storage_API.UPDATE, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    GUID: selected.Guid,
                    STORAGEDIMGROUPNAME: formData.STORAGEDIMGROUPNAME,
                    STORAGEDIMGROUPDESC: formData.STORAGEDIMGROUPDESC,
                    DATAAREAID,
                    MODIFIEDBY: USER_ID,
                    // Map our Line objects to the shape the API expects
                    Lines: lines.map(l => ({
                        NAME: l.ENUMVALUE,   // API calls it "NAME"; we store as ENUMVALUE
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
                        DATAAREAID,
                    })),
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json?.Success === false)
                throw new Error(json?.Message || `Failed: ${res.status}`);

            return true;
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
            return false;
        } finally { setLoading(false); }
    }

    // DELETE a group
    async function deleteGroup() {
        if (!selected) return;
        if (!window.confirm(`Delete "${selected.STORAGEDIMGROUPNAME}"?`)) return;
        setLoading(true);
        try {
            const res = await fetch(Storage_API.DELETE_GRP, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ GUID: selected.Guid }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json?.Success === false)
                throw new Error(json?.Message || `Failed: ${res.status}`);

            setMsg({ text: "Group deleted.", ok: true });
            setSelected(null);
            setFormData(null);
            setMode("view");
            await loadAll();
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally { setLoading(false); }
    }

    // DELETE a single line
    // Uses the dedicated delete-line endpoint: { GUID: line.Guid, DATAAREAID }
    async function deleteLine(line: Line, index: number) {
        console.log("LINE GUID:", line.Guid);        // ← add this
        console.log("LINE DATAAREAID:", line.DATAAREAID); // ← and this
        const name = line.EnumDetail?.MEMBERNAME ?? `ENUM ${line.ENUMVALUE}`;
        if (!window.confirm(`Delete line "${name}"?`)) return;
        setLoading(true);
        try {
            // Send GUID and DATAAREAID as query params in the URL
            // .NET is reading from URL, not the request body — that's why body alone fails
            const url = `${Storage_API.DELETE_LINE}?GUID=${line.Guid}&DATAAREAID=${line.DATAAREAID}`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ GUID: line.Guid, DATAAREAID: line.DATAAREAID }),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok || json?.Success === false)
                throw new Error(json?.Message || `Failed: ${res.status}`);

            // Update local state immediately so the UI reflects the deletion
            const updatedLines = (formData?.Lines ?? []).filter((_, i) => i !== index);
            const updated = { ...formData!, Lines: updatedLines };
            setFormData(updated);
            setSelected(updated);
            setGroups(prev => prev.map(g => g.Guid === updated.Guid ? updated : g));
            setMsg({ text: "Line deleted.", ok: true });
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally { setLoading(false); }
    }


    async function addLine() {
        if (!selected || !formData) return;
        if (!newLine.NAME) { setMsg({ text: "Enter an enum value.", ok: false }); return; }

        // Prevent adding the same dimension twice
        const alreadyExists = (formData.Lines ?? []).some(l => l.ENUMVALUE === newLine.NAME);
        if (alreadyExists) {
            setMsg({ text: "This dimension is already in the group.", ok: false }); return;
        }

        // Build a Line-shaped object (backend assigns the real Guid after save)
        const fakeNewLine: Line = {
            Guid: "",
            STORAGEDIMENSIONGROUPID: selected.Guid,
            ENUMVALUE: newLine.NAME,
            ISACTIVE: newLine.ISACTIVE,
            ISBLOTRECEIPTALLOWED: newLine.ISBLOTRECEIPTALLOWED,
            ISBLANKISSUEALLOWED: newLine.ISBLANKISSUEALLOWED,
            ISPHYSICALINVENTORY: newLine.ISPHYSICALINVENTORY,
            ISFINANCIALINVENTORY: newLine.ISFINANCIALINVENTORY,
            ISCOVERAGEPLAN: newLine.ISCOVERAGEPLAN,
            ISFORPURCHASEPRICES: newLine.ISFORPURCHASEPRICES,
            ISFORSALESPRICES: newLine.ISFORSALESPRICES,
            ISTRANSFER: newLine.ISTRANSFER,
            DISPLAYORDER: newLine.DISPLAYORDER,
            DATAAREAID,
            CREATEDBY: USER_ID,
            CREATEDDATETIME: "",
            MODIFIEDBY: USER_ID,
            MODIFIEDDATETIME: "",
            EnumDetail: null,
        };

        const allLines = [...(formData.Lines ?? []), fakeNewLine];
        const ok = await updateGroup(allLines);
        if (ok) {
            setMsg({ text: "Line added!", ok: true });
            setShowAddLine(false);
            setNewLine(blankLine());
            await loadAll(selected.Guid);

        }
    }

    // Save button — decides whether to create or update
    async function handleSave() {
        if (mode === "new") { await createGroup(); return; }
        if (mode === "edit") {
            const ok = await updateGroup();
            if (ok) {
                setMsg({ text: "Saved!", ok: true });
                setMode("view");
                await loadAll(selected!.Guid);

            }
        }
    }

    function selectGroup(g: Group) {
        setSelected(g);
        setFormData({ ...g, Lines: g.Lines.map(l => ({ ...l })) }); // deep copy lines
        setMode("view");
        setShowAddLine(false);
        setNewLine(blankLine());
        setMsg(null);
    }

    function handleNewGroup() {
        setSelected(null);
        setFormData({
            Guid: "", STORAGEDIMGROUPNAME: "", STORAGEDIMGROUPDESC: "",
            DATAAREAID, CREATEDBY: USER_ID, CREATEDDATETIME: "",
            MODIFIEDBY: USER_ID, MODIFIEDDATETIME: "", Lines: [],
        });
        setMode("new");
        setShowAddLine(false);
        setMsg(null);
    }

    function handleCancel() {
        if (selected) {
            selectGroup(selected); // reset form back to last saved values
        } else {
            setFormData(null);
            setMode("view");
        }
    }

    // Filtered list for the sidebar search
    const filtered = groups.filter(g =>
        g.STORAGEDIMGROUPNAME.toLowerCase().includes(filterText.toLowerCase()) ||
        (g.STORAGEDIMGROUPDESC ?? "").toLowerCase().includes(filterText.toLowerCase())
    );

    const isEditing = mode === "new" || mode === "edit";

    return (
        <div className="sdg-shell">

            <div className="sdg-topbar">
                <span className="sdg-topbar-title">Storage Dimension Groups</span>
                <span className="sdg-badge">{DATAAREAID}</span>

                <div className="sdg-topbar-actions">
                    <button
                        className={`sdg-btn ${mode !== "view" ? "sdg-btn-primary" : ""}`}
                        onClick={handleSave}
                        disabled={loading || mode === "view"}
                    >
                        {loading ? "⏳ Saving…" : "💾 Save"}
                    </button>

                    <button className="sdg-btn" onClick={handleNewGroup} disabled={loading || isEditing}>
                        + New
                    </button>

                    <button className="sdg-btn" onClick={() => setMode("edit")} disabled={loading || !selected || isEditing}>
                        ✏️ Edit
                    </button>

                    <button className="sdg-btn sdg-btn-danger" onClick={deleteGroup} disabled={loading || !selected || isEditing}>
                        🗑 Delete
                    </button>

                    {isEditing && (
                        <button className="sdg-btn" onClick={handleCancel} disabled={loading}>
                            ✕ Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="sdg-body">

                <div className="sdg-sidebar">
                    <div className="sdg-filter-wrap">
                        <input
                            className="sdg-filter-input"
                            placeholder="🔍 Filter..."
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                        />
                    </div>

                    <div className="sdg-sidebar-count">
                        {!pageLoading && `${filtered.length} group${filtered.length !== 1 ? "s" : ""}`}
                    </div>

                    <div className="sdg-sidebar-list">
                        {pageLoading && <p className="sdg-loading-text">Loading…</p>}

                        {mode === "new" && (
                            <div className="sdg-sidebar-item sdg-sidebar-item-active">
                                <div className="sdg-item-name">{formData?.STORAGEDIMGROUPNAME || "NEW"}</div>
                                <div className="sdg-item-desc">New group</div>
                            </div>
                        )}

                        {filtered.map(g => (
                            <div
                                key={g.Guid}
                                className={`sdg-sidebar-item ${mode !== "new" && selected?.Guid === g.Guid ? "sdg-sidebar-item-active" : ""}`}
                                onClick={() => { if (!isEditing) selectGroup(g); }}
                            >
                                <div className="sdg-item-name">{g.STORAGEDIMGROUPNAME}</div>
                                <div className="sdg-item-desc">{g.STORAGEDIMGROUPDESC || "No description"}</div>
                                <div className="sdg-item-meta">{g.DATAAREAID} · {g.Lines?.length ?? 0} lines</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── DETAIL PANEL ── */}
                <div className="sdg-detail">

                    {/* Success / error message */}
                    {msg && (
                        <div className={`sdg-msg ${msg.ok ? "sdg-msg-ok" : "sdg-msg-err"}`}>
                            {msg.ok ? "✓" : "⚠"} {msg.text}
                        </div>
                    )}

                    {/* Empty state */}
                    {!formData && !pageLoading && (
                        <div className="sdg-empty">
                            <div className="sdg-empty-icon">📦</div>
                            <p>Select a group or click <strong>+ New</strong></p>
                        </div>
                    )}

                    {/* Form */}
                    {formData && (
                        <>
                            {/* ── GENERAL SECTION ── */}
                            <div className="sdg-card">
                                <div className="sdg-section-title">General</div>
                                <div className="sdg-field-row">

                                    {/* Name — only editable when creating (mode = "new") */}
                                    <div className="sdg-field">
                                        <label className="sdg-field-label">Name *</label>
                                        <input
                                            className={`sdg-input ${mode === "new" ? "sdg-input-active" : ""}`}
                                            value={formData.STORAGEDIMGROUPNAME}
                                            onChange={e => setFormData(p => ({ ...p!, STORAGEDIMGROUPNAME: e.target.value }))}
                                            disabled={mode !== "new"}
                                            placeholder="e.g. SiteWH"
                                        />
                                    </div>

                                    {/* Description — editable in both new and edit mode */}
                                    <div className="sdg-field sdg-field-wide">
                                        <label className="sdg-field-label">Description</label>
                                        <input
                                            className={`sdg-input ${isEditing ? "sdg-input-active" : ""}`}
                                            value={formData.STORAGEDIMGROUPDESC}
                                            onChange={e => setFormData(p => ({ ...p!, STORAGEDIMGROUPDESC: e.target.value }))}
                                            disabled={!isEditing}
                                            placeholder="Optional description"
                                        />
                                    </div>

                                    {/* Data Area — always read-only */}
                                    <div className="sdg-field">
                                        <label className="sdg-field-label">Data Area</label>
                                        <input className="sdg-input" value={DATAAREAID} disabled />
                                    </div>

                                    {/* Last Modified — only for existing records */}
                                    {selected && (
                                        <div className="sdg-field">
                                            <label className="sdg-field-label">Last Modified</label>
                                            <input
                                                className="sdg-input"
                                                value={selected.MODIFIEDDATETIME ? new Date(selected.MODIFIEDDATETIME).toLocaleString() : "—"}
                                                disabled
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── LINES SECTION ── */}
                            <div className="sdg-card">
                                <div className="sdg-lines-header">
                                    <div className="sdg-section-title">
                                        Lines
                                        <span className="sdg-count-badge">{formData.Lines?.length ?? 0}</span>
                                    </div>

                                    <div>
                                        {/* Add Line button — only for existing groups */}
                                        {mode !== "new" && selected && (
                                            <button
                                                className="sdg-add-line-btn"
                                                onClick={() => { setShowAddLine(v => !v); setNewLine(blankLine()); setMsg(null); }}
                                                disabled={loading}
                                            >
                                                {showAddLine ? "✕ Cancel" : "+ Add Line"}
                                            </button>
                                        )}
                                        {/* Hint shown while creating a new group */}
                                        {mode === "new" && (
                                            <span className="sdg-lines-hint">Save the group first, then add lines.</span>
                                        )}
                                    </div>
                                </div>

                                <div className="sdg-table-wrap">
                                    <table className="sdg-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Dimension</th>
                                                <th>Enum #</th>
                                                {LINE_BOOL_COLS.map(c => <th key={c.key}>{c.label}</th>)}
                                                <th>Order</th>
                                                <th>Area</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {/* ── NEW LINE ROW (shown when + Add Line is clicked) ── */}
                                            {showAddLine && (
                                                <tr className="sdg-new-line-row">
                                                    <td><span className="sdg-new-badge">NEW</span></td>

                                                    <td>
                                                        {/*
                              Enter the enum value number manually.
                              If your API has an endpoint that returns enum names,
                              replace this <input> with a <select> dropdown.
                            */}
                                                        <input
                                                            type="number"
                                                            className="sdg-input sdg-input-active sdg-order-input"
                                                            placeholder="Enum #"
                                                            value={newLine.NAME || ""}
                                                            onChange={e => setNewLine(p => ({ ...p, NAME: parseInt(e.target.value) || 0 }))}
                                                        />
                                                    </td>

                                                    <td>{newLine.NAME > 0 ? newLine.NAME : "—"}</td>

                                                    {/* Boolean checkboxes for the new line */}
                                                    {LINE_BOOL_COLS.map(c => (
                                                        <td key={c.key} style={{ textAlign: "center" }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={!!(newLine as any)[c.key]}
                                                                onChange={() => setNewLine(p => ({ ...p, [c.key]: !(p as any)[c.key] }))}
                                                            />
                                                        </td>
                                                    ))}

                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="sdg-input sdg-input-active sdg-order-input"
                                                            value={newLine.DISPLAYORDER}
                                                            onChange={e => setNewLine(p => ({ ...p, DISPLAYORDER: parseInt(e.target.value) || 0 }))}
                                                        />
                                                    </td>

                                                    <td>{DATAAREAID}</td>

                                                    <td>
                                                        <button
                                                            className="sdg-save-line-btn"
                                                            onClick={addLine}
                                                            disabled={loading || newLine.NAME === 0}
                                                        >
                                                            {loading ? "⏳" : "✓ Save"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}

                                            {/* ── EXISTING LINES ── */}
                                            {(formData.Lines ?? []).length === 0 && !showAddLine ? (
                                                <tr>
                                                    <td colSpan={LINE_BOOL_COLS.length + 6} className="sdg-no-lines-msg">
                                                        No lines yet. Click "+ Add Line" to add one.
                                                    </td>
                                                </tr>
                                            ) : (
                                                (formData.Lines ?? []).map((line, i) => (
                                                    <tr key={line.Guid || i}>
                                                        <td>{i + 1}</td>

                                                        {/* Show friendly name from EnumDetail if available */}
                                                        <td>
                                                            {line.EnumDetail?.MEMBERNAME ?? (
                                                                <span className="sdg-enum-fallback">ENUM {line.ENUMVALUE}</span>
                                                            )}
                                                        </td>

                                                        <td>{line.ENUMVALUE}</td>

                                                        {/* Boolean values — READ ONLY (no edit mode for lines) */}
                                                        {LINE_BOOL_COLS.map(c => (
                                                            <td key={c.key} style={{ textAlign: "center" }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!(line as any)[c.key]}
                                                                    disabled
                                                                />
                                                            </td>
                                                        ))}

                                                        <td>{line.DISPLAYORDER}</td>
                                                        <td>{line.DATAAREAID}</td>

                                                        {/* Delete button — always visible, no edit mode needed */}
                                                        <td>
                                                            <button
                                                                className="sdg-delete-line-btn"
                                                                onClick={() => deleteLine(line, i)}
                                                                disabled={loading}
                                                                title="Delete this line"
                                                            >
                                                                🗑
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StorageDimGroupPage;