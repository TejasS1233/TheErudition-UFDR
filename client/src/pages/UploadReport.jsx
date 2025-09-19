import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import axios from "../lib/axios";

const UploadReport = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const response = await axios.post("/report/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.status === 200) {
        setUploadSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload UFDR Report</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Select UFDR Zip File
          </label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept=".zip"
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? `Uploading... ${uploadProgress}%` : "Upload"}
        </Button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {uploadSuccess && (
        <p className="text-green-500 mt-4">File uploaded and processed successfully!</p>
      )}
    </div>
  );
};

export default UploadReport;
