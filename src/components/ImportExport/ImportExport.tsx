import { useState } from "react";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import "./ImportExport.css";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;
interface Table {
  name: string;
}

// Define the API response interface
interface ApiResponse {
  success: boolean;
  tables: Table[];
}
const ImportExport = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("");

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/api/tables`);
      setTables(response.data.tables.map((table) => table.name));
      setMessage("Tables fetched successfully");
      toast.success(message);
      console.log(message);
    } catch (error: unknown) {
      let errorMsg = "Failed to fetch tables";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message || errorMsg;
      }
      toast.error(errorMsg);
      setMessage("Failed to fetch tables");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // Handle import
  const handleImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !tableName) {
      setMessage("Please select a file and table");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("tableName", tableName);

    setLoading(true); // Start loading
    try {
      const response = await axios.post(`${API_URL}/api/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      toast.success(response.data.message);
    } catch (error: unknown) {
      let errorMsg = "Failed to import";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message || errorMsg;
      }
      toast.error(errorMsg);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!tableName) {
      setMessage("Please select a table");
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.get(`${API_URL}/api/export/${tableName}`, {
        responseType: "blob",
      });

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${tableName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage("Export successful");
      toast.success("Export successful");
    } catch (error) {
      toast.error("Export failed");
      console.log(error);
      setMessage("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ margin: "10px 0" }}>
        <button
          className="twoButton"
          onClick={() => setMode("import")}
          disabled={loading}
        >
          Import Mode
        </button>
        <button
          className="twoButton"
          onClick={() => setMode("export")}
          disabled={loading}
        >
          Export Mode
        </button>
      </div>
      {loading && (
        <div className="loading-overlay">
          <ClipLoader color="#007bff" size={50} />
          <p>Processing...</p>
        </div>
      )}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <label>Select Table: </label>
        <select
          style={{ width: "400px" }}
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a table</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
        <button onClick={fetchTables} disabled={loading}>
          Fetch Tables
        </button>
      </div>
      {mode === "import" && (
        <form onSubmit={handleImport}>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            Import
          </button>
        </form>
      )}
      {mode === "export" && (
        <button onClick={handleExport} disabled={loading}>
          Export
        </button>
      )}
    </div>
  );
};

export default ImportExport;
