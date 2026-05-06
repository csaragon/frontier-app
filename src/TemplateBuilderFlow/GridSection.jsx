import { useState } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
};

const CELL_ANSWER_TYPES = ["Yes/No/NA", "Pass/Fail", "Rating Scale", "Numeric"];

function cellPlaceholder(type) {
  switch (type) {
    case "Yes/No/NA":    return "Yes / No / NA";
    case "Pass/Fail":    return "Pass / Fail";
    case "Rating Scale": return "1 – 5";
    case "Numeric":      return "0";
    default:             return "—";
  }
}

let _gid = 0;
function gid(prefix) { return `${prefix}-${Date.now()}-${++_gid}`; }

// ── GridSection ────────────────────────────────────────────────────────────────

export default function GridSection({ section, methodology, onUpdate, onToggleOff }) {
  // Initialize gridData from section, with safe defaults
  const raw = section.gridData ?? {};
  const [cellAnswerType, setCellAnswerType] = useState(raw.cellAnswerType ?? "Yes/No/NA");
  const [columns, setColumns]   = useState(raw.columns ?? [
    { id: "c1", label: "Column 1" },
    { id: "c2", label: "Column 2" },
    { id: "c3", label: "Column 3" },
  ]);
  const [rows, setRows]         = useState(raw.rows ?? [
    { id: "r1", label: "Row 1" },
    { id: "r2", label: "Row 2" },
  ]);
  const [pointsPerCell, setPointsPerCell] = useState(raw.pointsPerCell ?? 1);

  function pushUpdate(patch) {
    onUpdate({
      ...(raw),
      cellAnswerType,
      columns,
      rows,
      cells: raw.cells ?? {},
      scoring: raw.scoring ?? {},
      pointsPerCell,
      ...patch,
    });
  }

  function handleCellTypeChange(val) {
    setCellAnswerType(val);
    pushUpdate({ cellAnswerType: val });
  }

  function handlePointsChange(val) {
    const v = Number(val);
    if (!isNaN(v) && v >= 0) {
      setPointsPerCell(v);
      pushUpdate({ pointsPerCell: v });
    }
  }

  // Column operations
  function handleColLabelChange(colId, val) {
    const next = columns.map(c => c.id === colId ? { ...c, label: val } : c);
    setColumns(next);
    pushUpdate({ columns: next });
  }
  function handleAddCol() {
    const next = [...columns, { id: gid("c"), label: `Column ${columns.length + 1}` }];
    setColumns(next);
    pushUpdate({ columns: next });
  }
  function handleDeleteCol(colId) {
    if (columns.length <= 1) return;
    const next = columns.filter(c => c.id !== colId);
    setColumns(next);
    pushUpdate({ columns: next });
  }

  // Row operations
  function handleRowLabelChange(rowId, val) {
    const next = rows.map(r => r.id === rowId ? { ...r, label: val } : r);
    setRows(next);
    pushUpdate({ rows: next });
  }
  function handleAddRow() {
    const next = [...rows, { id: gid("r"), label: `Row ${rows.length + 1}` }];
    setRows(next);
    pushUpdate({ rows: next });
  }
  function handleDeleteRow(rowId) {
    if (rows.length <= 1) return;
    const next = rows.filter(r => r.id !== rowId);
    setRows(next);
    pushUpdate({ rows: next });
  }

  const totalCells = rows.length * columns.length;
  const weightPerCell = totalCells > 0 ? (100 / totalCells).toFixed(1) : "0";

  const placeholder = cellPlaceholder(cellAnswerType);

  return (
    <div style={{ fontFamily: F }}>
      {/* Config bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 14px", background: C.g1, borderRadius: 8, marginBottom: 12,
        border: `1px solid ${C.g2}`,
      }}>
        {/* Cell answer type */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.g5, fontFamily: F, whiteSpace: "nowrap" }}>Cell type:</span>
          <select
            value={cellAnswerType}
            onChange={e => handleCellTypeChange(e.target.value)}
            style={{
              fontSize: 12, fontFamily: F, color: C.g6,
              border: `1px solid ${C.g3}`, borderRadius: 4,
              padding: "4px 8px", background: C.white,
              cursor: "pointer", outline: "none",
            }}
          >
            {CELL_ANSWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Points per cell (points methodology) */}
        {methodology === "points" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.g5, fontFamily: F, whiteSpace: "nowrap" }}>Points per cell:</span>
            <input
              type="number"
              min={0}
              value={pointsPerCell}
              onChange={e => handlePointsChange(e.target.value)}
              style={{
                width: 56, fontSize: 12, fontFamily: F, color: C.g6,
                border: `1px solid ${C.g3}`, borderRadius: 4,
                padding: "4px 8px", outline: "none", textAlign: "center",
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.navy}
              onBlur={e => e.currentTarget.style.borderColor = C.g3}
            />
          </div>
        )}

        {/* Weight per cell (weighted methodology) */}
        {methodology === "weighted" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.g5, fontFamily: F, whiteSpace: "nowrap" }}>Cell weight:</span>
            <span style={{
              fontSize: 12, fontWeight: 600, fontFamily: F,
              color: "#001e76", background: "#e0f2fe",
              borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap",
            }}>~{weightPerCell}% each, distributed across {totalCells} cells</span>
          </div>
        )}

        {/* Helper text */}
        <span style={{ fontSize: 12, color: C.g4, fontFamily: F, fontStyle: "italic", marginLeft: "auto" }}>
          Grid sections use one shared question structure across all rows and columns.
        </span>
      </div>

      {/* Grid table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: F, tableLayout: "auto" }}>
          <thead>
            <tr>
              {/* Corner cell */}
              <th style={{ width: 120, background: C.white, borderBottom: `1px solid ${C.g2}`, borderRight: `1px solid ${C.g2}`, padding: "8px" }} />
              {/* Column headers */}
              {columns.map((col, ci) => (
                <th key={col.id} style={{ background: C.white, borderBottom: `1px solid ${C.g2}`, borderRight: `1px solid ${C.g2}`, padding: "6px 8px", minWidth: 110, fontWeight: "normal" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      value={col.label}
                      onChange={e => handleColLabelChange(col.id, e.target.value)}
                      style={{
                        flex: 1, fontSize: 12, fontFamily: F, color: C.g6, fontWeight: 600,
                        border: `1px solid transparent`, borderRadius: 4,
                        padding: "3px 5px", outline: "none", background: "transparent",
                        minWidth: 70,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.background = C.white; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
                    />
                    {columns.length > 1 && (
                      <button
                        onClick={() => handleDeleteCol(col.id)}
                        title="Remove column"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: C.g3, fontSize: 14, lineHeight: 1,
                          padding: "0 2px", borderRadius: 4, flexShrink: 0,
                          display: "flex", alignItems: "center",
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = C.red ?? "#b6143a"}
                        onMouseLeave={e => e.currentTarget.style.color = C.g3}
                      >×</button>
                    )}
                  </div>
                </th>
              ))}
              {/* Add column button */}
              <th style={{ background: C.white, borderBottom: `1px solid ${C.g2}`, padding: "6px 6px", width: 40, fontWeight: "normal" }}>
                <button
                  onClick={handleAddCol}
                  title="Add column"
                  style={{
                    background: "none", border: `1px dashed ${C.g3}`, color: C.g4,
                    borderRadius: 4, padding: "4px 8px", cursor: "pointer",
                    fontSize: 13, fontFamily: F, lineHeight: 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.color = C.navy; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.g3; e.currentTarget.style.color = C.g4; }}
                >+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id}>
                {/* Row label */}
                <td style={{ background: C.white, borderRight: `1px solid ${C.g2}`, borderBottom: `1px solid ${C.g2}`, padding: "6px 8px" }}>
                  <input
                    value={row.label}
                    onChange={e => handleRowLabelChange(row.id, e.target.value)}
                    style={{
                      width: "100%", fontSize: 12, fontFamily: F, color: C.g6, fontWeight: 600,
                      border: `1px solid transparent`, borderRadius: 4,
                      padding: "3px 5px", outline: "none", background: "transparent",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.background = C.white; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
                  />
                </td>
                {/* Cells */}
                {columns.map(col => (
                  <td key={col.id} style={{
                    background: "#f4f4f6", border: `1px solid ${C.g2}`,
                    padding: "8px", textAlign: "center",
                  }}>
                    <span style={{
                      fontSize: 12, color: C.g4, fontFamily: F,
                      display: "block", userSelect: "none",
                    }}>{placeholder}</span>
                  </td>
                ))}
                {/* Delete row */}
                <td style={{ background: C.white, borderBottom: `1px solid ${C.g2}`, padding: "0 6px", textAlign: "center" }}>
                  {rows.length > 1 && (
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      title="Remove row"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: C.g3, fontSize: 14, lineHeight: 1,
                        padding: "0 2px", borderRadius: 4,
                        display: "flex", alignItems: "center",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#b6143a"}
                      onMouseLeave={e => e.currentTarget.style.color = C.g3}
                    >×</button>
                  )}
                </td>
              </tr>
            ))}
            {/* Add row */}
            <tr>
              <td colSpan={columns.length + 2} style={{ padding: "6px 8px", background: C.white, borderTop: `1px solid ${C.g2}` }}>
                <button
                  onClick={handleAddRow}
                  style={{
                    background: "none", border: `1px dashed ${C.g3}`, color: C.g4,
                    borderRadius: 4, padding: "4px 12px", cursor: "pointer",
                    fontSize: 12, fontFamily: F,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.color = C.navy; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.g3; e.currentTarget.style.color = C.g4; }}
                >+ Add row</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Turn off grid link */}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onToggleOff}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontFamily: F, color: C.g4,
            textDecoration: "underline", padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.g6}
          onMouseLeave={e => e.currentTarget.style.color = C.g4}
        >Switch back to question list</button>
      </div>
    </div>
  );
}
