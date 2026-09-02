"use client";

import { useEffect, useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
};

export function ImageUploader({
  value = "",
  onChange,
  label = "Image",
  accept = "image/*",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function choose(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (localPreview) URL.revokeObjectURL(localPreview);
    setError("");
    setSelectedFile(file);
    setLocalPreview(URL.createObjectURL(file));
  }

  async function upload() {
    if (!selectedFile) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadToCloudinary(selectedFile);
      onChange(url);
      setSelectedFile(null);
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cloudinary upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    setSelectedFile(null);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview("");
    setError("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const preview = localPreview || value;

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      {preview ? (
        <div className="border rounded p-2 mb-2" style={{ maxWidth: 460 }}>
          <img
            src={preview}
            alt="Image preview"
            style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }}
          />
          {localPreview && (
            <div className="small text-muted mt-2">Preview only — not uploaded yet.</div>
          )}
        </div>
      ) : (
        <div className="text-muted small mb-2">No image selected.</div>
      )}

      <div className="d-flex gap-2 flex-wrap">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          {value ? "Replace Image" : "Choose Image"}
        </button>
        {selectedFile && (
          <button type="button" className="btn btn-success btn-sm" onClick={() => void upload()} disabled={busy}>
            {busy ? "Uploading…" : "Upload Image"}
          </button>
        )}
        {value && !selectedFile && (
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={remove} disabled={busy}>
            Remove
          </button>
        )}
        {selectedFile && (
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={remove} disabled={busy}>
            Cancel
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="d-none"
        onChange={(e) => choose(e.target.files?.[0])}
      />
      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  );
}
