import React, { useState, useEffect, useCallback } from "react";
import "./SizeGroup.css";
import type { SizeGroup, SizeLinegroups } from "../productInterface.ts";
import { API_BASE_URL, SIZE_API, SIZE_GROUP, SIZE_LINE } from "../apiRoutes.ts";

const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const createEmptyGroup = (): SizeGroup => ({
    GUID: "",
    SIZEGROUPNAME: "",
    SIZEGROUPDESCRIPTION: "",
    CREATEDBY: LOGGED_IN_USER_ID,
    MODIFIEDBY: LOGGED_IN_USER_ID,
    Lines: [],
});

const createEmptyLine = (): SizeLinegroups => ({
    Guid: "",
    SIZE: "",
    NUMBERINBARCODE: "",
    SIZEGROUPLINEDISPLAYORDER: 0,
    CREATEDBY: LOGGED_IN_USER_ID,
    MODIFIEDBY: LOGGED_IN_USER_ID,
});


const Sizegroup: React.FC = () => {
    const [groups, setGroups] = useState<SizeGroup[]>([]);

    // FIX 1: Track selection by GUID string, NOT by array index.
    // Using index breaks whenever the array is filtered or re-ordered.
    const [selectedGUID, setSelectedGUID] = useState<string>("");

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

    // FIX 2: Derive `selected` by finding the group whose GUID matches.
    // Before: groups[selectedGroupIdx] — broke when filtered list was used.
    const selected = groups.find(g => g.GUID === selectedGUID) ?? null;
    const displayGroup = isEditing && draft ? draft : selected;

    // FIX 3: Filter is only used for sidebar display.
    // selectedGUID still points to the correct group regardless of filter.
    const filteredGroups = groups.filter(g =>
        g.SIZEGROUPNAME.toLowerCase().includes(filterText.toLowerCase()) ||
        (g.SIZEGROUPDESCRIPTION ?? "").toLowerCase().includes(filterText.toLowerCase())
    );

    // ── FETCH ──────────────────────────────────────────────────────────────
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(SIZE_GROUP.GET_SIZE_GROUP);
            if (!res.ok) throw new Error(`GET failed: ${res.status}`);
            const data = await res.json();

            let list: SizeGroup[] = [];
            if (Array.isArray(data)) list = data;
            else if (Array.isArray(data.value)) list = data.value;
            else if (Array.isArray(data.data)) list = data.data;
            else if (Array.isArray(data.items)) list = data.items;
            else if (data && typeof data === "object") list = [data];

            setGroups(list);

            // FIX 4: After fetch keep current selection if GUID still exists,
            // otherwise auto-select the first item.
            setSelectedGUID(prev => {
                const stillExists = list.some(g => g.GUID === prev);
                return stillExists ? prev : (list[0]?.GUID ?? "");
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
        setSelectedGUID("");
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
        if (draft.GUID) {
            await handlePut();
        } else {
            await handlePost();
        }
    };

    // ── POST ───────────────────────────────────────────────────────────────
    // FIX 7: Lines are now included in the POST payload.
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
                Lines: draft.Lines.map(l => ({
                    SIZE: l.SIZE,
                    NUMBERINBARCODE: l.NUMBERINBARCODE,
                    SIZEGROUPLINEDISPLAYORDER: l.SIZEGROUPLINEDISPLAYORDER,
                    CREATEDBY: LOGGED_IN_USER_ID,
                    MODIFIEDBY: LOGGED_IN_USER_ID,
                })),
            };

            const res = await fetch(SIZE_GROUP.CREATE_SIZE_GROUP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`POST failed: ${res.status}`);

            let created: SizeGroup | null = null;
            try { created = await res.json(); } catch { }

            showSuccess("Size group created!");
            setIsEditing(false);
            setDraft(null);
            await fetchGroups();

            // FIX 8: Auto-select the newly created group by the GUID the server returned
            if (created?.GUID) setSelectedGUID(created.GUID);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── PUT ────────────────────────────────────────────────────────────────
    // FIX 9: Lines included in PUT payload too.
    const handlePut = async () => {
        if (!draft || !draft.GUID) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                GUID: draft.GUID,
                SIZEGROUPNAME: draft.SIZEGROUPNAME,
                SIZEGROUPDESCRIPTION: draft.SIZEGROUPDESCRIPTION,
                CREATEDBY: LOGGED_IN_USER_ID,
                MODIFIEDBY: LOGGED_IN_USER_ID,
                Lines: draft.Lines.map(l => ({
                    SIZE: l.SIZE,
                    NUMBERINBARCODE: l.NUMBERINBARCODE,
                    SIZEGROUPLINEDISPLAYORDER: l.SIZEGROUPLINEDISPLAYORDER,
                    CREATEDBY: LOGGED_IN_USER_ID,
                    MODIFIEDBY: LOGGED_IN_USER_ID,
                })),
            };

            const res = await fetch(SIZE_GROUP.UPDATE_SIZE_GROUP, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`PUT failed: ${res.status}`);

            showSuccess("Size group updated!");
            setIsEditing(false);
            setDraft(null);
            // FIX 10: selectedGUID is preserved through fetchGroups (see FIX 4)
            await fetchGroups();

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── DELETE GROUP ───────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selected?.GUID) return;
        if (!window.confirm(`Delete "${selected.SIZEGROUPNAME}"?`)) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(SIZE_GROUP.DELETE_SIZE_GROUP, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Guid: selected.GUID }),
            });
            if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);

            // FIX 11: Clear GUID so fetchGroups picks first item automatically
            setSelectedGUID("");
            await fetchGroups();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ── ADD LINE ───────────────────────────────────────────────────────────
    const handleAddLine = () => {
        if (!draft) return;
        if (!newLine.SIZE.trim()) {
            setError("Size GUID is required.");
            return;
        }
        setDraft(prev =>
            prev ? { ...prev, Lines: [...prev.Lines, { ...newLine }] } : prev
        );
        setNewLine(createEmptyLine());
        setIsAddingLine(false);
    };

    // ── DELETE LINE ────────────────────────────────────────────────────────
    const handleDeleteLine = (lineIdx: number) => {
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
                        disabled={!selected?.GUID || loading}
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
                                key={g.GUID || g.SIZEGROUPNAME}
                                className={`sgl-sidebar-item ${selectedGUID === g.GUID ? "sgl-sidebar-item-active" : ""}`}
                                onClick={() => {
                                    setSelectedGUID(g.GUID);
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
                                        <div className="sgl-col-title">INFORMATION</div>
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Size Group Name</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.SIZEGROUPNAME ?? ""}
                                                disabled
                                            />
                                        </div>
                                        <div className="sgl-field-group sgl-mt">
                                            <label className="sgl-field-label">Description</label>
                                            <input
                                                className="sgl-field-input sgl-field-guid"
                                                value={displayGroup?.SIZEGROUPDESCRIPTION ?? ""}
                                                disabled
                                            />
                                        </div>
                                    </div>

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
                                            onClick={() => {
                                                setIsAddingLine(v => !v);
                                                setNewLine(createEmptyLine());
                                            }}
                                        >
                                            {isAddingLine ? "✕ Cancel" : "+ Add"}
                                        </button>
                                    )}
                                </div>

                                {isEditing && isAddingLine && (
                                    <div className="sgl-add-line-form">
                                        <div className="sgl-field-group">
                                            <label className="sgl-field-label">Size (GUID)</label>
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
                                        {(displayGroup?.Lines ?? []).map((l, i) => (
                                            <tr key={i}>
                                                <td className="sgl-guid-cell">{l.SIZE}</td>
                                                <td>{l.NUMBERINBARCODE}</td>
                                                <td>{l.SIZEGROUPLINEDISPLAYORDER}</td>
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














// import React, { useState, useEffect, useCallback } from "react";
// import "./SizeGroup.css";
// // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// import type { SizeGroup, SizeLinegroups } from "../productInterface.ts";
// import { API_BASE_URL, SIZE_API, SIZE_GROUP } from "../apiRoutes.ts";
// // import { API_BASE_URL } from "../apiRoutes.ts";
// // import { SIZE_API, SIZE_GROUP } from "../apiRoutes.ts";


// const LOGGED_IN_USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
// // const API_BASE_URL = "http://192.168.0.110";


// const createEmptyGroup = (): SizeGroup => ({
//     GUID: "",
//     SIZEGROUPNAME: "",
//     SIZEGROUPDESCRIPTION: "",
//     CREATEDBY: LOGGED_IN_USER_ID,
//     MODIFIEDBY: LOGGED_IN_USER_ID,
//     Lines: [],
// });




// const Sizegroup: React.FC = () => {
//     //groups all data
//     const [groups, setGroups] = useState<SizeGroup[]>([]);
//     const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);
//     const [filterText, setFilterText] = useState<string>("");

//     //editing
//     const [isEditing, setIsEditing] = useState<boolean>(false);
//     const [draft, setDraft] = useState<SizeGroup | null>(null);

//     const [generalOpen, setGeneralOpen] = useState<boolean>(true);

//     const [loading, setLoading] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);
//     const [successMsg, setSuccessMsg] = useState<string | null>(null);

//     const selected = groups[selectedGroupIdx] ?? null;
//     const displayGroup = isEditing && draft ? draft : selected; // ui show

//     const [detailsOpen, setDetailsOpen] = useState<boolean>(true);
//     const [isAddingLine, setIsAddingLine] = useState<boolean>(false);

//     const [newLine, setNewLine] = useState<SizeLinegroups>({
//         Guid: "",
//         SIZE: "",
//         NUMBERINBARCODE: "",
//         SIZEGROUPLINEDISPLAYORDER: 0,
//         CREATEDBY: LOGGED_IN_USER_ID,
//         MODIFIEDBY: LOGGED_IN_USER_ID,
//     });

//     const handleSave = useCallback(() => {
//         if (!draft) return;

//         if (selected?.GUID) {
//             handlePut();
//         } else {
//             handlePost();
//         }
//     }, [draft, selected]);

//     //button add
//     const handleAdd = useCallback(() => {
//         setDraft(createEmptyGroup());
//         setIsEditing(true);
//     }, []);

//     // edit button
//     const handleEdit = useCallback(() => {

//         if (!selected) return;
//         setDraft(selected);
//         setIsEditing(true);

//     }, []);

//     //cancel button for nav
//     const handleCancel = useCallback(() => {

//         setIsEditing(false);
//         setDraft(null);
//     }, []);

//     const fetchGroups = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {


//             const res = await fetch(SIZE_GROUP.GET_SIZE_GROUP);
//             if (!res.ok) throw new Error(`GET failed: ${res.status}`);
//             const data = await res.json();

//             let list: SizeGroup[] = [];
//             if (Array.isArray(data)) {
//                 list = data;
//             } else if (Array.isArray(data.value)) {
//                 list = data.value;
//             } else if (Array.isArray(data.data)) {
//                 list = data.data;
//             } else if (Array.isArray(data.items)) {
//                 list = data.items;
//             } else if (data && typeof data === "object") {
//                 list = [data];
//             }

//             setGroups(list);
//             setSelectedGroupIdx(0);
//         } catch (e: any) {
//             setError(e.message);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchGroups();
//     }, [fetchGroups]);


//     const handlePost = async () => {
//         if (!draft) return;
//         setLoading(true);
//         setError(null);
//         try {
//             const payload = {
//                 SIZEGROUPNAME: draft.SIZEGROUPNAME,
//                 SIZEGROUPDESCRIPTION: draft.SIZEGROUPDESCRIPTION,
//                 CREATEDBY: LOGGED_IN_USER_ID,
//                 MODIFIEDBY: LOGGED_IN_USER_ID,
//             };

//             const res = await fetch(SIZE_GROUP.CREATE_SIZE, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) throw new Error(`POST failed: ${res.status}`);
//             setSuccessMsg("Size group created!");
//             setTimeout(() => setSuccessMsg(null), 3000);
//             setIsEditing(false);
//             setDraft(null);
//             await fetchGroups();
//         } catch (e: any) {
//             setError(e.message);
//         } finally {
//             setLoading(false);
//         }
//     };


//     const handlePut = async () => {
//         if (!draft || !selected?.GUID) return;
//         setLoading(true);
//         setError(null);
//         try {
//             const payload = {
//                 GUID: selected.GUID,
//                 SIZEGROUPNAME: draft.SIZEGROUPNAME,
//                 SIZEGROUPDESCRIPTION: draft.SIZEGROUPDESCRIPTION,
//                 CREATEDBY: LOGGED_IN_USER_ID,
//                 MODIFIEDBY: LOGGED_IN_USER_ID,
//             };

//             const res = await fetch(SIZE_GROUP.UPDATE_SIZE_GROUP, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
//             setSuccessMsg("Size group updated!");
//             setTimeout(() => setSuccessMsg(null), 3000);
//             setIsEditing(false);
//             setDraft(null);
//             await fetchGroups();
//         } catch (e: any) {
//             setError(e.message);
//         } finally {
//             setLoading(false);
//         }
//     };



//     const handleDelete = async () => {
//         if (!selected?.GUID) return;
//         if (!window.confirm("Delete this size group?")) return;
//         setLoading(true);
//         setError(null);
//         try {
//             const res = await fetch(SIZE_GROUP.DELETE_SIZE_GROUP, {
//                 method: "DELETE",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ Guid: selected.GUID }),
//             });

//             if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
//             setSelectedGroupIdx(0);
//             await fetchGroups();
//         } catch (e: any) {
//             setError(e.message);
//         } finally {
//             setLoading(false);
//         }
//     };



//     const handleAddLine = () => {
//         if (!draft) return;

//         setDraft(prev =>
//             prev
//                 ? { ...prev, Lines: [...prev.Lines, newLine] }
//                 : prev
//         );

//         setNewLine({
//             Guid: "",
//             SIZE: "",
//             NUMBERINBARCODE: "",
//             SIZEGROUPLINEDISPLAYORDER: 0,
//             CREATEDBY: LOGGED_IN_USER_ID,
//             MODIFIEDBY: LOGGED_IN_USER_ID,
//         });

//         setIsAddingLine(false);
//     };
//     const handleNew = () => {
//         const blank = createEmptyGroup();
//         setGroups(prev => [blank, ...prev]);
//         setSelectedGroupIdx(0);
//         setDraft({ ...blank });
//         setIsEditing(true);
//     };

//     const startEdit = () => {
//         if (selected) {
//             setDraft({
//                 ...selected,
//                 Lines: [...selected.Lines],
//             });
//             setIsEditing(true);
//         }
//     };

//     const cancelEdit = () => {
//         setIsEditing(false);
//         setDraft(null);
//         if (!selected?.GUID) {
//             setGroups(prev => prev.filter((_, i) => i !== selectedGroupIdx));
//             setSelectedGroupIdx(0);
//         }
//     };


//     const handleDeleteLine = (lineIdx: number) => {
//         setDraft(prev =>
//             prev ? { ...prev, Lines: prev.Lines.filter((_, i) => i !== lineIdx) } : prev
//         );
//     };


//     return (

//         <div className="sgl-shell">


//             {error && (
//                 <div className="sgl-toast sgl-toast-error" onClick={() => setError(null)}>
//                     ⚠ {error}
//                 </div>
//             )}
//             {successMsg && (
//                 <div className="sgl-toast sgl-toast-success">
//                     ✓ {successMsg}
//                 </div>
//             )}

//             {/* ══ COMMAND BAR ══ */}
//             <div className="sgl-commandBar">
//                 <button className="sgl-cmd-icon-btn">&#8592;</button>
//                 <button className="sgl-cmd-icon-btn sgl-hamburger">&#9776;</button>

//                 <div className="sgl-cmd-actions">
//                     <button
//                         className="sgl-cmd-btn sgl-cmd-save"
//                         onClick={handleSave}
//                         disabled={!isEditing || loading}
//                     >
//                         <span>&#128190;</span> Save
//                     </button>
//                     <button
//                         className="sgl-cmd-btn"
//                         onClick={handleNew}
//                         disabled={loading}
//                     >
//                         <span>+</span> New
//                     </button>
//                     <button
//                         className="sgl-cmd-btn"
//                         onClick={handleDelete}
//                         disabled={!selected?.GUID || loading}
//                     >
//                         <span>🗑</span> Delete
//                     </button>
//                 </div>

//                 <div className="sgl-cmd-divider" />

//                 <div className="sgl-cmd-tabs">
//                     <span className="sgl-cmd-tab sgl-cmd-tab-active">Options</span>
//                 </div>

//                 <div className="sgl-cmd-right">
//                     <button
//                         className="sgl-cmd-icon-btn"
//                         onClick={fetchGroups}
//                         disabled={loading}
//                         title="Refresh"
//                     >
//                         {loading ? "…" : "↺"}
//                     </button>
//                 </div>
//             </div>

//             {/* ══ BODY ══ */}
//             <div className="sgl-body">

//                 {/* ══ SIDEBAR ══ */}
//                 <div className="sgl-sidebar">
//                     <div className="sgl-sidebar-filter">
//                         <span className="sgl-filter-icon">&#128269;</span>
//                         <input
//                             type="text"
//                             placeholder="Filter"
//                             value={filterText}
//                             onChange={e => setFilterText(e.target.value)}
//                             className="sgl-filter-input"
//                         />
//                     </div>
//                     <div className="sgl-sidebar-list">
//                         {groups
//                             .filter(g =>
//                                 g.SIZEGROUPNAME.toLowerCase().includes(filterText.toLowerCase()) ||
//                                 g.SIZEGROUPDESCRIPTION?.toLowerCase().includes(filterText.toLowerCase())
//                             )
//                             .map((g, idx) => (
//                                 <div
//                                     key={idx}
//                                     className={`sgl-sidebar-item ${selectedGroupIdx === idx ? "sgl-sidebar-item-active" : ""}`}
//                                     onClick={() => {
//                                         setSelectedGroupIdx(idx);
//                                         setIsEditing(false);
//                                         setDraft(null);
//                                     }}
//                                 >
//                                     <div className="sgl-item-code">{g.SIZEGROUPNAME || "—"}</div>
//                                     <div className="sgl-item-desc">{g.SIZEGROUPDESCRIPTION || "No description"}</div>
//                                 </div>
//                             ))
//                         }
//                         {groups.length === 0 && !loading && (
//                             <div className="sgl-sidebar-empty">No records found</div>
//                         )}
//                     </div>
//                 </div>

//                 {/* ══ DETAIL PANEL ══ */}
//                 <div className="sgl-detail">

//                     <div className="sgl-std-view">Standard view &#8964;</div>
//                     <h1 className="sgl-detail-title">Size Group</h1>

//                     {/* ── Header Card ── */}
//                     <div className="sgl-header-card">
//                         <div className="sgl-header-fields">

//                             <div className="sgl-field-group">
//                                 <label className="sgl-field-label">Size Group Name</label>
//                                 <input
//                                     className="sgl-field-input sgl-field-medium"
//                                     value={displayGroup?.SIZEGROUPNAME ?? ""}
//                                     onChange={e => setDraft(p => p ? { ...p, SIZEGROUPNAME: e.target.value } : p)}
//                                     disabled={!isEditing}
//                                     placeholder="Enter name"
//                                 />
//                             </div>

//                             <div className="sgl-field-group">
//                                 <label className="sgl-field-label">Description</label>
//                                 <input
//                                     className="sgl-field-input sgl-field-guid"
//                                     value={displayGroup?.SIZEGROUPDESCRIPTION ?? ""}
//                                     onChange={e => setDraft(p => p ? { ...p, SIZEGROUPDESCRIPTION: e.target.value } : p)}
//                                     disabled={!isEditing}
//                                     placeholder="Enter description"
//                                 />
//                             </div>

//                             <div className="sgl-header-actions">
//                                 {!isEditing ? (
//                                     <button
//                                         className="sgl-btn-edit"
//                                         onClick={startEdit}
//                                         disabled={!selected}
//                                     >
//                                         &#8212; Edit
//                                     </button>
//                                 ) : (
//                                     <button className="sgl-btn-secondary" onClick={cancelEdit}>
//                                         Cancel
//                                     </button>
//                                 )}
//                             </div>

//                         </div>
//                     </div>

//                     {/* ══ GENERAL SECTION ══ */}
//                     <div className="sgl-section">
//                         <div
//                             className="sgl-section-header"
//                             onClick={() => setGeneralOpen(v => !v)}
//                         >
//                             <span>General</span>
//                             <span className="sgl-chevron">{generalOpen ? "∧" : "∨"}</span>
//                         </div>

//                         {generalOpen && (
//                             <div className="sgl-section-body">
//                                 <div className="sgl-general-grid">

//                                     {/* COL 1 — INFORMATION */}
//                                     <div className="sgl-gen-col">
//                                         <div className="sgl-col-title">INFORMATION</div>

//                                         <div className="sgl-field-group">
//                                             <label className="sgl-field-label">Size Group Name</label>
//                                             <input
//                                                 className="sgl-field-input sgl-field-guid"
//                                                 value={displayGroup?.SIZEGROUPNAME ?? ""}
//                                                 disabled
//                                             />
//                                         </div>

//                                         <div className="sgl-field-group sgl-mt">
//                                             <label className="sgl-field-label">Description</label>
//                                             <input
//                                                 className="sgl-field-input sgl-field-guid"
//                                                 value={displayGroup?.SIZEGROUPDESCRIPTION ?? ""}
//                                                 disabled
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* COL 2 — AUDIT */}
//                                     <div className="sgl-gen-col">
//                                         <div className="sgl-col-title">AUDIT</div>

//                                         <div className="sgl-field-group">
//                                             <label className="sgl-field-label">Created by</label>
//                                             <input
//                                                 className="sgl-field-input sgl-field-guid"
//                                                 value={displayGroup?.CREATEDBY ?? ""}
//                                                 disabled
//                                             />
//                                         </div>

//                                         <div className="sgl-field-group sgl-mt">
//                                             <label className="sgl-field-label">Modified by</label>
//                                             <input
//                                                 className="sgl-field-input sgl-field-guid"
//                                                 value={displayGroup?.MODIFIEDBY ?? ""}
//                                                 disabled
//                                             />
//                                         </div>
//                                     </div>

//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* ══ LINES SECTION ══ */}
//                     <div className="sgl-section">
//                         <div
//                             className="sgl-section-header"
//                             onClick={() => setDetailsOpen(v => !v)}
//                         >
//                             <span>Lines</span>
//                             <span className="sgl-chevron">{detailsOpen ? "∧" : "∨"}</span>
//                         </div>

//                         {detailsOpen && (
//                             <div className="sgl-section-body">

//                                 <div className="sgl-addr-toolbar">
//                                     {isEditing && (
//                                         <button
//                                             className="sgl-add-btn"
//                                             onClick={() => setIsAddingLine(v => !v)}
//                                         >
//                                             {isAddingLine ? "✕ Cancel" : "+ Add"}
//                                         </button>
//                                     )}
//                                 </div>

//                                 {/* ── Inline add line form ── */}
//                                 {isEditing && isAddingLine && (
//                                     <div className="sgl-add-line-form">
//                                         <div className="sgl-field-group">
//                                             <label className="sgl-field-label">Size (GUID)</label>
//                                             <input
//                                                 className="sgl-field-input sgl-field-guid"
//                                                 placeholder="3fa85f64-..."
//                                                 value={newLine.SIZE}
//                                                 onChange={e => setNewLine(p => ({ ...p, SIZE: e.target.value }))}
//                                             />
//                                         </div>
//                                         <div className="sgl-field-group">
//                                             <label className="sgl-field-label">Number in Barcode</label>
//                                             <input
//                                                 className="sgl-field-input sgl-field-medium"
//                                                 placeholder="e.g. ST001"
//                                                 value={newLine.NUMBERINBARCODE}
//                                                 onChange={e => setNewLine(p => ({ ...p, NUMBERINBARCODE: e.target.value }))}
//                                             />
//                                         </div>
//                                         <div className="sgl-field-group">
//                                             <label className="sgl-field-label">Display Order</label>
//                                             <input
//                                                 type="number"
//                                                 className="sgl-field-input sgl-field-short"
//                                                 value={newLine.SIZEGROUPLINEDISPLAYORDER}
//                                                 onChange={e => setNewLine(p => ({ ...p, SIZEGROUPLINEDISPLAYORDER: Number(e.target.value) }))}
//                                             />
//                                         </div>
//                                         <div className="sgl-add-line-confirm">
//                                             <button className="sgl-btn-confirm" onClick={handleAddLine}>
//                                                 ✓ Add Line
//                                             </button>
//                                         </div>
//                                     </div>
//                                 )}

//                                 <table className="sgl-table">
//                                     <thead>
//                                         <tr>
//                                             <th>Size</th>
//                                             <th>Number in Barcode</th>
//                                             <th>Display Order</th>
//                                             {isEditing && <th></th>}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {(displayGroup?.Lines ?? []).map((l, i) => (
//                                             <tr key={i}>
//                                                 <td className="sgl-guid-cell">{l.SIZE}</td>
//                                                 <td>{l.NUMBERINBARCODE}</td>
//                                                 <td>{l.SIZEGROUPLINEDISPLAYORDER}</td>
//                                                 {isEditing && (
//                                                     <td>
//                                                         <button
//                                                             className="sgl-delete-line-btn"
//                                                             onClick={() => handleDeleteLine(i)}
//                                                         >
//                                                             🗑
//                                                         </button>
//                                                     </td>
//                                                 )}
//                                             </tr>
//                                         ))}
//                                         {(displayGroup?.Lines ?? []).length === 0 && (
//                                             <tr>
//                                                 <td
//                                                     colSpan={isEditing ? 4 : 3}
//                                                     className="sgl-empty-row"
//                                                 >
//                                                     No lines added
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>

//                             </div>
//                         )}
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Sizegroup;







