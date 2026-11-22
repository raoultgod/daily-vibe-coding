export function filterDetections(boxes, threshold) {
  return boxes
    .filter((box) => Number.isFinite(box.conf) && box.conf >= threshold)
    .sort((a, b) => b.conf - a.conf);
}

export function mapBoxToCanvas(box, sourceWidth, sourceHeight, canvasWidth, canvasHeight) {
  if (![sourceWidth, sourceHeight, canvasWidth, canvasHeight].every((value) => Number.isFinite(value) && value > 0)) {
    return null;
  }
  const left = Math.max(0, Math.min(sourceWidth, box.x1));
  const top = Math.max(0, Math.min(sourceHeight, box.y1));
  const right = Math.max(left, Math.min(sourceWidth, box.x2));
  const bottom = Math.max(top, Math.min(sourceHeight, box.y2));
  const scaleX = canvasWidth / sourceWidth;
  const scaleY = canvasHeight / sourceHeight;
  return {
    x: left * scaleX,
    y: top * scaleY,
    labelX: left * scaleX,
    labelY: top * scaleY,
    width: (right - left) * scaleX,
    height: (bottom - top) * scaleY,
    label: `${box.name} ${Math.round(box.conf * 100)}%`,
  };
}
