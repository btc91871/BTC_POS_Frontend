import React, { useState, useEffect } from "react";
import { Storage_API } from "../apiRoutes";
import type { StorageLine as Line, StorageGroup as Group } from "../productInterface";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import Typography from '@mui/material/Typography';
import "./storage.css";
import axios from "axios";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const DATAAREAID = "IND";
const USER_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const ENUM_OPTIONS = [
    { NAME: 1, label: "Site" },
    { NAME: 2, label: "Warehouse" },
    { NAME: 3, label: "Location" },
    { NAME: 4, label: "Inventory Status" },
    { NAME: 5, label: "Licence Plates" },
];

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

function defaultLineValues() {
    return {
        ISACTIVE: false,
        ISBLOTRECEIPTALLOWED: false,
        ISBLANKISSUEALLOWED: false,
        ISPHYSICALINVENTORY: false,
        ISFINANCIALINVENTORY: false,
        ISCOVERAGEPLAN: false,
        ISFORPURCHASEPRICES: false,
        ISFORSALESPRICES: false,
        ISTRANSFER: false,
        DISPLAYORDER: 0,
    };
}

// ─────────────────────────────────────────────
// SORTING UTILITIES
// ─────────────────────────────────────────────

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const StorageDimGroupPage: React.FC = () => {

    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [formData, setFormData] = useState<Group | null>(null);
    const [mode, setMode] = useState<"view" | "new" | "edit">("view");
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    // Sorting state
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Line>('ENUMVALUE');

    // Selection state for rows
    const [selectedRows, setSelectedRows] = useState<readonly number[]>([]);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // ─────────────────────────────────────────────
    // API FUNCTIONS
    // ─────────────────────────────────────────────

    async function loadAll(selectGuid?: string) {
        setPageLoading(true);
        try {
            const res = await axios.get(Storage_API.GET_ALL + "/" + DATAAREAID, {
                headers: { accept: "*/*" },
            });
            const response = res.data;
            let data: Group[] = [];
            if (Array.isArray(response.Data)) data = response.Data;
            else if (Array.isArray(response.Data?.Data)) data = response.Data.Data;
            else if (Array.isArray(response.data)) data = response.data;
            else if (Array.isArray(response)) data = response;

            setGroups(data);

            if (data.length > 0) {
                if (selectGuid) {
                    const found = data.find(g => g.Guid === selectGuid);
                    if (found) { selectGroup(found); return; }

                    const direct = await fetchById(selectGuid);
                    if (direct) { setGroups([direct, ...data]); selectGroup(direct); return; }
                }
                selectGroup(data[0]);
            } else {
                setSelectedGroup(null);
                setFormData(null);
            }
        } catch (e: any) {
            setMsg({ text: `Could not load: ${e.message}`, ok: false });
        } finally {
            setPageLoading(false);
        }
    }

    async function fetchById(guid: string): Promise<Group | null> {
        try {
            const res = await axios.post(Storage_API.GET_BY_ID, { GUID: guid, DATAAREAID });
            const item: Group = res.data?.Data ?? res.data;
            return item?.Guid ? item : null;
        } catch { return null; }
    }

    async function createGroup() {
        if (!formData?.STORAGEDIMGROUPNAME.trim()) {
            setMsg({ text: "Name is required.", ok: false });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(Storage_API.CREATE, {
                STORAGEDIMGROUPNAME: formData.STORAGEDIMGROUPNAME,
                STORAGEDIMGROUPDESC: formData.STORAGEDIMGROUPDESC,
                DATAAREAID,
                CREATEDBY: USER_ID,
                MODIFIEDBY: USER_ID,
                Lines: [],
            });
            const json = res.data;
            if (json?.Success === false) throw new Error(json?.Message || "Create failed");

            const newGuid: string = json?.Data?.Guid ?? json?.Guid ?? "";
            setMsg({ text: "Group created!", ok: true });
            setMode("view");
            await loadAll(newGuid || undefined);
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally {
            setLoading(false);
        }
    }

    async function updateGroup(): Promise<boolean> {
        if (!formData || !selectedGroup) return false;
        setLoading(true);
        try {
            const res = await axios.put(Storage_API.UPDATE, {
                GUID: selectedGroup.Guid,
                STORAGEDIMGROUPNAME: formData.STORAGEDIMGROUPNAME,
                STORAGEDIMGROUPDESC: formData.STORAGEDIMGROUPDESC,
                DATAAREAID,
                MODIFIEDBY: USER_ID,
                Lines: (formData.Lines ?? []).map(l => ({
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
                    DATAAREAID,
                })),
            });
            const json = res.data;
            if (json?.Success === false) throw new Error(json?.Message || "Update failed");
            return true;
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function deleteGroup() {
        if (!selectedGroup) return;
        if (!window.confirm(`Delete "${selectedGroup.STORAGEDIMGROUPNAME}"?`)) return;
        setLoading(true);
        try {
            const res = await axios.delete(Storage_API.DELETE_GRP, {
                data: { GUID: selectedGroup.Guid },
            });
            const json = res.data;
            if (json?.Success === false) throw new Error(json?.Message || "Delete failed");

            setMsg({ text: "Group deleted.", ok: true });
            setSelectedGroup(null);
            setFormData(null);
            setMode("view");
            await loadAll();
        } catch (e: any) {
            setMsg({ text: e.message, ok: false });
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (mode === "new") {
            await createGroup();
        } else if (mode === "edit") {
            const ok = await updateGroup();
            if (ok) {
                setMsg({ text: "Saved!", ok: true });
                setMode("view");
                await loadAll(selectedGroup!.Guid);
            }
        }
    }

    // ─────────────────────────────────────────────
    // UI HANDLERS
    // ─────────────────────────────────────────────

    function toggleLineField(enumValue: number, field: string) {
        setFormData(prev => {
            if (!prev) return prev;
            const lines = [...(prev.Lines ?? [])];
            const idx = lines.findIndex(l => l.ENUMVALUE === enumValue);
            if (idx !== -1) {
                const updated = { ...lines[idx], [field]: !(lines[idx] as any)[field] };
                lines[idx] = updated;
            } else {
                const newEntry: Line = {
                    Guid: "",
                    STORAGEDIMENSIONGROUPID: prev.Guid,
                    ENUMVALUE: enumValue,
                    DATAAREAID,
                    CREATEDBY: USER_ID,
                    CREATEDDATETIME: "",
                    MODIFIEDBY: USER_ID,
                    MODIFIEDDATETIME: "",
                    EnumDetail: null,
                    ...defaultLineValues(),
                    [field]: true,
                };
                lines.push(newEntry);
            }
            return { ...prev, Lines: lines };
        });
    }

    function selectGroup(g: Group) {
        setSelectedGroup(g);
        setFormData({ ...g, Lines: (g.Lines ?? []).map(l => ({ ...l })) });
        setMode("view");
        setSelectedRows([]);
        setPage(0);
        setMsg(null);
    }

    function handleNewGroup() {
        setSelectedGroup(null);
        setFormData({
            Guid: "",
            STORAGEDIMGROUPNAME: "",
            STORAGEDIMGROUPDESC: "",
            DATAAREAID,
            CREATEDBY: USER_ID,
            CREATEDDATETIME: "",
            MODIFIEDBY: USER_ID,
            MODIFIEDDATETIME: "",
            Lines: [],
        });
        setMode("new");
        setSelectedRows([]);
        setMsg(null);
    }

    function handleCancel() {
        if (selectedGroup) {
            selectGroup(selectedGroup);
        } else {
            setFormData(null);
            setMode("view");
        }
        setSelectedRows([]);
    }

    // ✅ Sorting handler
    const handleRequestSort = (property: keyof Line) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // ✅ Select all rows handler
    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = ENUM_OPTIONS.map(opt => opt.NAME);
            setSelectedRows(newSelected);
        } else {
            setSelectedRows([]);
        }
    };

    // ✅ Single row click handler
    const handleRowClick = (enumValue: number) => {
        const selectedIndex = selectedRows.indexOf(enumValue);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selectedRows, enumValue];
        } else if (selectedIndex === 0) {
            newSelected = selectedRows.slice(1);
        } else if (selectedIndex === selectedRows.length - 1) {
            newSelected = selectedRows.slice(0, -1);
        } else if (selectedIndex > 0) {
            newSelected = [
                ...selectedRows.slice(0, selectedIndex),
                ...selectedRows.slice(selectedIndex + 1),
            ];
        }
        setSelectedRows(newSelected);
    };

    // ✅ Pagination handlers
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ✅ Bulk delete handler
    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) return;

        const confirmMsg = `Delete ${selectedRows.length} dimension row${selectedRows.length > 1 ? 's' : ''}?`;
        if (!window.confirm(confirmMsg)) return;

        const updatedLines = (formData?.Lines ?? []).filter(
            line => !selectedRows.includes(line.ENUMVALUE)
        );

        setFormData(prev => ({ ...prev!, Lines: updatedLines }));
        setSelectedRows([]);

        if (mode === "edit") {
            const ok = await updateGroup();
            if (ok) {
                setMsg({ text: `${selectedRows.length} row(s) deleted!`, ok: true });
                await loadAll(selectedGroup!.Guid);
            }
        }
    };

    // ✅ Compute visible rows with sorting & pagination
    const visibleRows = React.useMemo(() => {
        const linesData = ENUM_OPTIONS.map(opt => {
            const existingLine = (formData?.Lines ?? []).find(l => l.ENUMVALUE === opt.NAME);
            return existingLine ?? { ...defaultLineValues(), ENUMVALUE: opt.NAME, DATAAREAID };
        });
        const sorted = [...linesData].sort(getComparator(order, orderBy));
        return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [formData?.Lines, order, orderBy, page, rowsPerPage]);

    useEffect(() => {
        loadAll();
    }, []);

    useEffect(() => {
        if (!msg) return;
        const t = setTimeout(() => setMsg(null), 4000);
        return () => clearTimeout(t);
    }, [msg]);

    const filtered = groups.filter(g =>
        g.STORAGEDIMGROUPNAME.toLowerCase().includes(filterText.toLowerCase()) ||
        (g.STORAGEDIMGROUPDESC ?? "").toLowerCase().includes(filterText.toLowerCase())
    );

    const isEditing = mode === "new" || mode === "edit";

    // ✅ Enhanced Table Toolbar Component
    const EnhancedTableToolbar = ({ numSelected }: { numSelected: number }) => {
        return (
            <Toolbar sx={[
                { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
                numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                },
            ]}>
                {numSelected > 0 ? (
                    <Typography variant="subtitle1" component="div" sx={{ flex: '1 1 100%' }}>
                        {numSelected} selected
                    </Typography>
                ) : (
                    <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
                        Storage Dimensions
                    </Typography>
                )}
                {numSelected > 0 ? (
                    <Tooltip title="Delete">
                        <IconButton onClick={handleBulkDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Filter list">
                        <IconButton>
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Toolbar>
        );
    };

    return (
        <div className="sdg-shell">
            {/* TOP BAR */}
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
                    <button className="sdg-btn" onClick={handleNewGroup} disabled={loading || isEditing}>+ New</button>
                    <button className="sdg-btn" onClick={() => setMode("edit")} disabled={loading || !selectedGroup || isEditing}>✏️ Edit</button>
                    <button className="sdg-btn sdg-btn-danger" onClick={deleteGroup} disabled={loading || !selectedGroup || isEditing}>🗑 Delete</button>
                    {isEditing && <button className="sdg-btn" onClick={handleCancel} disabled={loading}>✕ Cancel</button>}
                </div>
            </div>

            <div className="sdg-body">
                {/* SIDEBAR */}
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
                                className={`sdg-sidebar-item ${mode !== "new" && selectedGroup?.Guid === g.Guid ? "sdg-sidebar-item-active" : ""}`}
                                onClick={() => { if (!isEditing) selectGroup(g); }}
                            >
                                <div className="sdg-item-name">{g.STORAGEDIMGROUPNAME}</div>
                                <div className="sdg-item-desc">{g.STORAGEDIMGROUPDESC || "No description"}</div>
                                <div className="sdg-item-meta">{g.DATAAREAID} · {g.Lines?.length ?? 0} lines</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETAIL PANEL */}
                <div className="sdg-detail">
                    {msg && (
                        <div className={`sdg-msg ${msg.ok ? "sdg-msg-ok" : "sdg-msg-err"}`}>
                            {msg.ok ? "✓" : "⚠"} {msg.text}
                        </div>
                    )}

                    {!formData && !pageLoading && (
                        <div className="sdg-empty">
                            <div className="sdg-empty-icon">📦</div>
                            <p>Select a group or click <strong>+ New</strong></p>
                        </div>
                    )}

                    {formData && (
                        <>
                            {/* GENERAL SECTION */}
                            <div className="sdg-card">
                                <div className="sdg-section-title">General</div>
                                <div className="sdg-field-row">
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
                                    <div className="sdg-field">
                                        <label className="sdg-field-label">Data Area</label>
                                        <input className="sdg-input" value={DATAAREAID} disabled />
                                    </div>
                                    {selectedGroup && (
                                        <div className="sdg-field">
                                            <label className="sdg-field-label">Last Modified</label>
                                            <input
                                                className="sdg-input"
                                                value={selectedGroup.MODIFIEDDATETIME ? new Date(selectedGroup.MODIFIEDDATETIME).toLocaleString() : "—"}
                                                disabled
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ENHANCED LINES TABLE */}
                            <div className="sdg-card">
                                <div className="sdg-lines-header">
                                    <div className="sdg-section-title">
                                        Lines
                                        {mode === "edit" && (
                                            <span style={{ fontSize: 11, fontWeight: 400, color: "#0078d4", marginLeft: 10 }}>
                                                ✏️ Checkboxes are editable — click Save when done
                                            </span>
                                        )}
                                        {mode === "new" && (
                                            <span style={{ fontSize: 11, fontWeight: 400, color: "#aaa", marginLeft: 10 }}>
                                                Save the group first, then edit lines.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Paper sx={{ width: '100%', mb: 2 }}>
                                    <EnhancedTableToolbar numSelected={selectedRows.length} />
                                    <TableContainer>
                                        <Table sx={{ minWidth: 750 }} size="medium" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            color="primary"
                                                            indeterminate={selectedRows.length > 0 && selectedRows.length < ENUM_OPTIONS.length}
                                                            checked={ENUM_OPTIONS.length > 0 && selectedRows.length === ENUM_OPTIONS.length}
                                                            onChange={handleSelectAllClick}
                                                            disabled={mode !== "edit"}
                                                        />
                                                    </TableCell>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>Dimension</TableCell>
                                                    {LINE_BOOL_COLS.map(c => (
                                                        <TableCell key={c.key} align="center">
                                                            <TableSortLabel
                                                                active={orderBy === c.key}
                                                                direction={orderBy === c.key ? order : 'asc'}
                                                                onClick={() => handleRequestSort(c.key as keyof Line)}
                                                            >
                                                                {c.label}
                                                                {orderBy === c.key && (
                                                                    <Box component="span" sx={visuallyHidden}>
                                                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                                    </Box>
                                                                )}
                                                            </TableSortLabel>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {visibleRows.map((row, index) => {
                                                    const isItemSelected = selectedRows.includes(row.ENUMVALUE);
                                                    const labelId = `enhanced-table-checkbox-${index}`;
                                                    const actualLine = (formData.Lines ?? []).find(l => l.ENUMVALUE === row.ENUMVALUE);

                                                    return (
                                                        <TableRow
                                                            hover
                                                            onClick={() => { if (mode === "edit") handleRowClick(row.ENUMVALUE); }}
                                                            role="checkbox"
                                                            aria-checked={isItemSelected}
                                                            tabIndex={-1}
                                                            key={row.ENUMVALUE}
                                                            selected={isItemSelected && mode === "edit"}
                                                            sx={{ cursor: mode === "edit" ? 'pointer' : 'default' }}
                                                        >
                                                            <TableCell padding="checkbox">
                                                                <Checkbox
                                                                    color="primary"
                                                                    checked={isItemSelected}
                                                                    disabled={mode !== "edit"}
                                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>{ENUM_OPTIONS.findIndex(o => o.NAME === row.ENUMVALUE) + 1}</TableCell>
                                                            <TableCell component="th" id={labelId} scope="row" sx={{ fontWeight: 500 }}>
                                                                {ENUM_OPTIONS.find(o => o.NAME === row.ENUMVALUE)?.label}
                                                            </TableCell>
                                                            {LINE_BOOL_COLS.map(c => (
                                                                <TableCell key={c.key} align="center">
                                                                    <Checkbox
                                                                        checked={(actualLine as any)?.[c.key] ?? false}
                                                                        disabled={mode !== "edit"}
                                                                        onChange={() => {
                                                                            if (mode === "edit") toggleLineField(row.ENUMVALUE, c.key);
                                                                        }}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={ENUM_OPTIONS.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </Paper>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StorageDimGroupPage;