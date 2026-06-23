import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function sanitize(text) {
  return String(text || "estudiante")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function captureNode(node) {
  const isDark = document.documentElement.classList.contains("dark");
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: isDark ? "#020617" : "#f8fafc",
    skipFonts: true, // evita SecurityError al leer Google Fonts (cross-origin)
    filter: (n) =>
      !(n instanceof HTMLElement && n.dataset?.exportIgnore === "true"),
  });
}

function triggerDownload(href, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.click();
}

export async function exportAsPng(node, studentName) {
  const dataUrl = await captureNode(node);
  const filename = `pensum-${sanitize(studentName)}-${todayStamp()}.png`;
  triggerDownload(dataUrl, filename);
}

export async function exportAsPdf(node, studentName) {
  const dataUrl = await captureNode(node);
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const orientation = img.width >= img.height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [img.width, img.height],
    compress: true,
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
  pdf.save(`pensum-${sanitize(studentName)}-${todayStamp()}.pdf`);
}
