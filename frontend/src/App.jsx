import { useState } from "react";
import { uploadHeadshot, createJob, streamJob } from "./api";
import "./App.css";

const STEPS = { UPLOAD: "upload", FORM: "form", GENERATING: "generating", DONE: "done" };

export default function App() {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [headshotUrl, setHeadshotUrl] = useState("");
  const [headshotPreview, setHeadshotPreview] = useState("");
  const [prompt, setPrompt] = useState("");
  const [numThumbnails, setNumThumbnails] = useState(3);
  const [thumbnails, setThumbnails] = useState([]);
  const [jobStatus, setJobStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleHeadshotUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setHeadshotPreview(URL.createObjectURL(file));
    setLoading(true);
    setError("");
    try {
      const data = await uploadHeadshot(file);
      setHeadshotUrl(data.url);
      setStep(STEPS.FORM);
    } catch {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setThumbnails([]);
    try {
      const data = await createJob(prompt, numThumbnails, headshotUrl);
      setStep(STEPS.GENERATING);
      setJobStatus("processing");
      streamJob(
        data.job_id,
        (thumb) => setThumbnails((prev) => [...prev, { ...thumb, failed: false }]),
        (thumb) => setThumbnails((prev) => [...prev, { ...thumb, failed: true }]),
        (job) => { setJobStatus(job.status); setStep(STEPS.DONE); }
      );
    } catch {
      setError("Failed to start job. Please try again.");
      setStep(STEPS.FORM);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep(STEPS.UPLOAD);
    setHeadshotUrl("");
    setHeadshotPreview("");
    setPrompt("");
    setNumThumbnails(3);
    setThumbnails([]);
    setJobStatus("");
    setError("");
  }

  return (
    <div className="app">
      <h1>YouTube Thumbnail Generator</h1>
      <p className="subtitle">AI-powered thumbnails from your photo</p>

      {error && <div className="error-banner">{error}</div>}

      {step === STEPS.UPLOAD && (
        <div className="card">
          <h2>Step 1 — Upload your photo</h2>
          <p>Upload a clear headshot photo of yourself</p>
          <label className="upload-btn">
            {loading ? "Uploading..." : "Choose Photo"}
            <input type="file" accept="image/*" onChange={handleHeadshotUpload} disabled={loading} hidden />
          </label>
        </div>
      )}

      {step === STEPS.FORM && (
        <div className="card">
          <h2>Step 2 — Describe your thumbnail</h2>
          {headshotPreview && <img src={headshotPreview} alt="headshot" className="preview" />}
          <form onSubmit={handleSubmit}>
            <label>
              What is your video about?
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. How I made $10,000 in one month with AI"
                required
                rows={3}
              />
            </label>
            <label>
              How many thumbnails? (1-3)
              <select value={numThumbnails} onChange={(e) => setNumThumbnails(Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
            <button type="submit" disabled={loading || !prompt}>
              {loading ? "Starting..." : "Generate Thumbnails"}
            </button>
          </form>
        </div>
      )}

      {step === STEPS.GENERATING && (
        <div className="card">
          <h2>Generating your thumbnails...</h2>
          <p>AI is working on it. This takes 30-60 seconds per thumbnail.</p>
          <div className="spinner" />
          {thumbnails.length > 0 && (
            <div className="thumbnails">
              {thumbnails.map((t, i) => <ThumbnailCard key={i} thumbnail={t} />)}
            </div>
          )}
        </div>
      )}

      {step === STEPS.DONE && (
        <div className="card">
          <h2>Done! Your thumbnails are ready</h2>
          <p>Status: <strong>{jobStatus}</strong></p>
          <div className="thumbnails">
            {thumbnails.map((t, i) => <ThumbnailCard key={i} thumbnail={t} />)}
          </div>
          <button onClick={handleReset} className="reset-btn">Generate New Thumbnails</button>
        </div>
      )}
    </div>
  );
}

function ThumbnailCard({ thumbnail }) {
  if (thumbnail.failed) {
    return (
      <div className="thumb-card error-card">
        <p><strong>{thumbnail.style_name}</strong></p>
        <p className="error">Failed: {thumbnail.error}</p>
      </div>
    );
  }
  const variants = thumbnail.variants || {};
  return (
    <div className="thumb-card">
      <p className="style-name">{thumbnail.style_name?.replace("_", " ")}</p>
      {thumbnail.imagekit_url && <img src={thumbnail.imagekit_url} alt={thumbnail.style_name} />}
      <div className="variant-links">
        {Object.entries(variants).map(([name, url]) => (
          <a key={name} href={url} target="_blank" rel="noreferrer">{name}</a>
        ))}
      </div>
    </div>
  );
}
