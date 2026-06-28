const BASE_URL = "http://localhost:8000/api";

export async function uploadHeadshot(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload-headshot`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload headshot");
  return res.json(); // { url: "..." }
}

export async function createJob(prompt, numThumbnails, headshotUrl) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      num_thumbnails: numThumbnails,
      headshot_url: headshotUrl,
    }),
  });

  if (!res.ok) throw new Error("Failed to create job");
  return res.json(); // { job_id: 1 }
}

export async function getJob(jobId) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`);
  if (!res.ok) throw new Error("Failed to get job");
  return res.json();
}

export function streamJob(jobId, onThumbnailReady, onThumbnailFailed, onJobCompleted) {
  const es = new EventSource(`${BASE_URL}/jobs/${jobId}/stream`);

  es.addEventListener("thumbnail_ready", (e) => {
    onThumbnailReady(JSON.parse(e.data));
  });

  es.addEventListener("thumbnail_failed", (e) => {
    onThumbnailFailed(JSON.parse(e.data));
  });

  es.addEventListener("job completed", (e) => {
    onJobCompleted(JSON.parse(e.data));
    es.close();
  });

  es.addEventListener("error", () => {
    es.close();
  });

  return es;
}
