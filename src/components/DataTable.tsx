import { useState, useMemo } from "react";
import { 
  ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet, 
  Search, SlidersHorizontal, ArrowUp, ArrowDown 
} from "lucide-react";
import { DataItem, ColumnSpec } from "../types";

interface DataTableProps {
  data: DataItem[];
  columns: ColumnSpec[];
}

export default function DataTable({ data, columns }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter keys inside items
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );
  }, [data, searchTerm]);

  // Sort rows
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      // Handle numerical sort
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      // Default string comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      
      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination bounds
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Calculate dynamic average/sum aggregates for list header
  const numericStatistics = useMemo(() => {
    const stats: Record<string, { sum: number; avg: number }> = {};
    const numericCols = columns.filter((c) => c.type === "numeric");

    numericCols.forEach((col) => {
      const vals = filteredData.map((row) => Number(row[col.name])).filter((v) => !isNaN(v));
      if (vals.length > 0) {
        const sum = vals.reduce((s, c) => s + c, 0);
        stats[col.name] = {
          sum,
          avg: sum / vals.length,
        };
      }
    });
    return stats;
  }, [filteredData, columns]);

  return (
    <div id="datatable-full-panel" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
      
      {/* Search Header */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-800">
            Records Explorer ({filteredData.length} filtered entries)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Row search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search items in list..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-600 w-56 font-mono text-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-indigo-600 font-semibold"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100/80">
              {columns.map((col) => (
                <th
                  key={col.name}
                  onClick={() => handleSort(col.name)}
                  className="px-4 py-3 text-slate-500 font-semibold text-xs tracking-wide uppercase select-none cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans">{col.name}</span>
                    {sortKey === col.name ? (
                      sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
              ))}
            </tr>

            {/* Quick statistical summaries calculation row */}
            {filteredData.length > 0 && (
              <tr className="bg-slate-100/30 text-[10px] text-slate-400 font-mono border-b border-slate-100 select-none">
                {columns.map((col) => (
                  <td key={`stats-${col.name}`} className="px-4 py-1.5 font-mono italic text-slate-400 bg-slate-50/20">
                    {col.type === "numeric" && numericStatistics[col.name] ? (
                      <div>
                        <span>Σ: {numericStatistics[col.name].sum > 10000 ? numericStatistics[col.name].sum.toLocaleString(undefined, { maximumFractionDigits: 0 }) : numericStatistics[col.name].sum.toFixed(1)}</span>
                        <span className="mx-1 border-r border-slate-200"></span>
                        <span>μ: {numericStatistics[col.name].avg.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-[9px]">Text categorical</span>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/30 transition text-slate-700">
                  {columns.map((col) => {
                    const cellVal = row[col.name];
                    return (
                      <td key={col.name} className="px-4 py-3 truncate max-w-[200px]" title={String(cellVal)}>
                        {col.type === "numeric" && typeof cellVal === "number" ? (
                          <span className="font-mono font-medium text-slate-900">
                            {cellVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        ) : col.type === "boolean" ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${cellVal ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                            {cellVal ? "TRUE" : "FALSE"}
                          </span>
                        ) : (
                          <span className="font-sans text-slate-600">{String(cellVal ?? "-")}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                  No matching records discovered. Empty selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono select-none">
        <div>
          <span>Showing </span>
          <span className="font-bold text-slate-700">
            {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
          </span>
          <span> to </span>
          <span className="font-bold text-slate-700">
            {Math.min(currentPage * rowsPerPage, sortedData.length)}
          </span>
          <span> of </span>
          <span className="font-bold text-slate-700">{sortedData.length}</span>
          <span> items</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
