import assert from "node:assert/strict";
import test from "node:test";

import { computeBoundaryPlacement, computeMarkerPlacement, computeRailPosition, pickTextTarget, pickWrappingTarget, shrinkToTextLine } from "./anatomy-placement";

const frame = { left: 100, top: 200, width: 300, height: 80 };
const markerSize = 20;

test("number line points at the visual center of its target", () => {
  const target = { left: 150, top: 220, width: 16, height: 16 };
  const placement = computeMarkerPlacement({ frame, target, side: "top", gap: 24, markerSize });

  const lineCenterX = placement.marker.left + placement.line.left + placement.line.width / 2;
  assert.equal(lineCenterX, target.left - frame.left + target.width / 2);
});

test("number marker sits outside the target by the requested gap", () => {
  const target = { left: 150, top: 220, width: 16, height: 16 };
  const placement = computeMarkerPlacement({ frame, target, side: "top", gap: 24, markerSize });

  const markerBottom = placement.marker.top + markerSize;
  assert.equal(target.top - frame.top - markerBottom, 24);
  assert.equal(placement.line.height, 24);
});

test("bottom side mirrors the top placement", () => {
  const target = { left: 150, top: 220, width: 16, height: 16 };
  const placement = computeMarkerPlacement({ frame, target, side: "bottom", gap: 24, markerSize });

  assert.equal(placement.marker.top - (target.top - frame.top + target.height), 24);
  const lineTop = placement.marker.top + placement.line.top;
  assert.equal(lineTop, target.top - frame.top + target.height);
  assert.equal(placement.line.height, 24);
});

test("side markers align to the vertical center and draw a horizontal line", () => {
  const target = { left: 150, top: 220, width: 16, height: 40 };
  const placement = computeMarkerPlacement({ frame, target, side: "left", gap: 32, markerSize });

  const markerCenterY = placement.marker.top + markerSize / 2;
  assert.equal(markerCenterY, target.top - frame.top + target.height / 2);
  assert.equal(placement.line.width, 32);
  assert.equal(placement.line.height, 1);
  assert.equal(placement.marker.left + markerSize + placement.line.width, target.left - frame.left);
});

test("right side markers draw their line back towards the target", () => {
  const target = { left: 150, top: 220, width: 16, height: 40 };
  const placement = computeMarkerPlacement({ frame, target, side: "right", gap: 32, markerSize });

  assert.equal(placement.marker.left, target.left - frame.left + target.width + 32);
  assert.equal(placement.marker.left + placement.line.left, target.left - frame.left + target.width);
  assert.equal(placement.line.width, 32);
});

test("boundary line spans the full height of the container it marks", () => {
  const target = { left: 150, top: 220, width: 120, height: 48 };
  const placement = computeBoundaryPlacement({ frame, target, side: "left", connectorLength: 24, clearance: 8, markerSize });

  assert.equal(placement.boundary.height, 48);
  const boundaryCenterY = placement.marker.top + placement.boundary.top + placement.boundary.height / 2;
  assert.equal(boundaryCenterY, target.top - frame.top + target.height / 2);
});

test("boundary line keeps its distance from the container outline", () => {
  const target = { left: 150, top: 220, width: 120, height: 48 };
  const placement = computeBoundaryPlacement({ frame, target, side: "left", connectorLength: 24, clearance: 8, markerSize });

  const boundaryX = placement.marker.left + placement.boundary.left;
  assert.equal(target.left - frame.left - boundaryX, 8);
});

test("boundary connector stops at the parallel line instead of entering the container", () => {
  const target = { left: 150, top: 220, width: 120, height: 48 };
  const placement = computeBoundaryPlacement({ frame, target, side: "left", connectorLength: 24, clearance: 8, markerSize });

  const connectorStart = placement.marker.left + placement.connector.left;
  const connectorEnd = connectorStart + placement.connector.width;
  const boundaryX = placement.marker.left + placement.boundary.left;
  assert.equal(connectorEnd, boundaryX);
  assert.equal(connectorStart, placement.marker.left + markerSize);
});

test("boundary markers on the right mirror the left placement", () => {
  const target = { left: 150, top: 220, width: 120, height: 48 };
  const placement = computeBoundaryPlacement({ frame, target, side: "right", connectorLength: 24, clearance: 8, markerSize });

  const boundaryX = placement.marker.left + placement.boundary.left;
  assert.equal(boundaryX - (target.left - frame.left + target.width), 8);
  assert.equal(placement.marker.left, target.left - frame.left + target.width + 8 + 24);
});

test("horizontal boundary lines span the width of the container", () => {
  const target = { left: 150, top: 220, width: 120, height: 48 };
  const placement = computeBoundaryPlacement({ frame, target, side: "bottom", connectorLength: 24, clearance: 8, markerSize });

  assert.equal(placement.boundary.width, 120);
  assert.equal(placement.boundary.height, 1);
  const boundaryY = placement.marker.top + placement.boundary.top;
  assert.equal(boundaryY - (target.top - frame.top + target.height), 8);
});

test("text targets pick the innermost element that owns the exact label", () => {
  const outer = { id: "outer", ownText: "", depth: 1 };
  const wrapper = { id: "wrapper", ownText: "", depth: 2 };
  const leaf = { id: "leaf", ownText: "Label", depth: 3 };

  assert.equal(pickTextTarget([outer, wrapper, leaf], "Label")?.id, "leaf");
});

test("text targets ignore elements that merely contain the label as part of a sentence", () => {
  const sentence = { id: "sentence", ownText: "Label and more", depth: 2 };
  const exact = { id: "exact", ownText: "Label", depth: 2 };

  assert.equal(pickTextTarget([sentence, exact], "Label")?.id, "exact");
});

test("text targets return nothing when no element owns the label", () => {
  assert.equal(pickTextTarget([{ id: "a", ownText: "Other", depth: 1 }], "Label"), null);
});

test("text targets tolerate surrounding whitespace in the rendered text", () => {
  const padded = { id: "padded", ownText: "  Right Description \n", depth: 2 };

  assert.equal(pickTextTarget([padded], "Right Description")?.id, "padded");
});

test("container targets pick the smallest element that wraps every named part", () => {
  const field = { id: "field", texts: ["Label", "Bottom Description", "Checkbox"], depth: 1 };
  const content = { id: "content", texts: ["Label", "Bottom Description"], depth: 2 };
  const row = { id: "row", texts: ["Label"], depth: 3 };

  assert.equal(pickWrappingTarget([field, content, row], ["Label", "Bottom Description"])?.id, "content");
});

test("container targets ignore elements that miss one of the named parts", () => {
  const row = { id: "row", texts: ["Label"], depth: 5 };
  const content = { id: "content", texts: ["Label", "Bottom Description"], depth: 2 };

  assert.equal(pickWrappingTarget([row, content], ["Label", "Bottom Description"])?.id, "content");
});

test("container targets return nothing when no element wraps them all", () => {
  const row = { id: "row", texts: ["Label"], depth: 3 };

  assert.equal(pickWrappingTarget([row], ["Label", "Missing"]), null);
});

test("markers on the same side share one rail outside the outermost target", () => {
  const targets = [
    { left: 150, top: 220, width: 16, height: 16 },
    { left: 200, top: 218, width: 90, height: 20 },
  ];

  const rail = computeRailPosition({ frame, targets, side: "top", gap: 24, markerSize });

  assert.equal(rail, 218 - 200 - 24 - markerSize);
});

test("a marker placed on a rail keeps its line running all the way to its own target", () => {
  const target = { left: 150, top: 224, width: 16, height: 16 };
  const rail = -30;
  const placement = computeMarkerPlacement({ frame, target, side: "top", gap: 24, markerSize, rail });

  assert.equal(placement.marker.top, rail);
  const lineTop = placement.marker.top + placement.line.top;
  assert.equal(lineTop, rail + markerSize);
  assert.equal(lineTop + placement.line.height, target.top - frame.top);
});

test("rails on the bottom sit under the lowest target", () => {
  const targets = [
    { left: 150, top: 220, width: 16, height: 16 },
    { left: 200, top: 240, width: 90, height: 20 },
  ];

  const rail = computeRailPosition({ frame, targets, side: "bottom", gap: 24, markerSize });

  assert.equal(rail, 260 - 200 + 24);
});

test("form fields are measured by the line their text sits on, not the filled box", () => {
  const field = { left: 100, top: 145, width: 72, height: 34 };
  const line = shrinkToTextLine(field, 20);

  assert.equal(line.height, 20);
  assert.equal(line.top + line.height / 2, field.top + field.height / 2);
});

test("shrinking a field to its text line leaves the horizontal range alone", () => {
  const field = { left: 100, top: 145, width: 72, height: 34 };
  const line = shrinkToTextLine(field, 20);

  assert.equal(line.left, 100);
  assert.equal(line.width, 72);
});

test("a field no taller than one line keeps its own height", () => {
  const field = { left: 100, top: 152, width: 72, height: 20 };

  assert.deepEqual(shrinkToTextLine(field, 20), field);
  assert.deepEqual(shrinkToTextLine(field, 28), field);
});
