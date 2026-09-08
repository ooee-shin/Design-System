export type AnatomyBox = { left: number; top: number; width: number; height: number };

export type AnatomySide = "top" | "bottom" | "left" | "right";

export type AnatomyRect = { left: number; top: number; width: number; height: number };

export type MarkerPlacement = {
  marker: { left: number; top: number };
  line: AnatomyRect;
};

export type BoundaryPlacement = {
  marker: { left: number; top: number };
  connector: AnatomyRect;
  boundary: AnatomyRect;
};

const LINE_THICKNESS = 1;

function relativeTarget(frame: AnatomyBox, target: AnatomyBox) {
  const left = target.left - frame.left;
  const top = target.top - frame.top;
  return {
    left,
    top,
    right: left + target.width,
    bottom: top + target.height,
    centerX: left + target.width / 2,
    centerY: top + target.height / 2,
    width: target.width,
    height: target.height,
  };
}

/**
 * 번호 마커와 안내선의 위치를 계산한다. 마커는 frame 기준, 안내선은 마커 기준 상대 좌표로 돌려준다.
 * 안내선은 대상의 시각 중심 축에 놓이고 대상 가장자리에서 gap만큼 떨어진 지점에서 끝난다.
 */
export function computeMarkerPlacement({
  frame,
  target,
  side,
  gap,
  markerSize,
  rail,
}: {
  frame: AnatomyBox;
  target: AnatomyBox;
  side: AnatomySide;
  gap: number;
  markerSize: number;
  rail?: number;
}): MarkerPlacement {
  const box = relativeTarget(frame, target);
  const half = markerSize / 2;
  const lineOffset = half - LINE_THICKNESS / 2;

  if (side === "top") {
    const top = rail ?? box.top - gap - markerSize;
    return {
      marker: { left: box.centerX - half, top },
      line: { left: lineOffset, top: markerSize, width: LINE_THICKNESS, height: box.top - top - markerSize },
    };
  }

  if (side === "bottom") {
    const top = rail ?? box.bottom + gap;
    return {
      marker: { left: box.centerX - half, top },
      line: { left: lineOffset, top: box.bottom - top, width: LINE_THICKNESS, height: top - box.bottom },
    };
  }

  if (side === "left") {
    const left = rail ?? box.left - gap - markerSize;
    return {
      marker: { left, top: box.centerY - half },
      line: { left: markerSize, top: lineOffset, width: box.left - left - markerSize, height: LINE_THICKNESS },
    };
  }

  const left = rail ?? box.right + gap;
  return {
    marker: { left, top: box.centerY - half },
    line: { left: box.right - left, top: lineOffset, width: left - box.right, height: LINE_THICKNESS },
  };
}

/**
 * 같은 방향에 놓인 번호 마커들이 공유할 축을 구한다. 가장 바깥에 있는 대상을 기준으로 잡아
 * 마커가 한 줄로 정렬되고, 각 마커의 안내선만 자기 대상까지 길이를 달리해 이어진다.
 */
export function computeRailPosition({
  frame,
  targets,
  side,
  gap,
  markerSize,
}: {
  frame: AnatomyBox;
  targets: AnatomyBox[];
  side: AnatomySide;
  gap: number;
  markerSize: number;
}): number {
  const boxes = targets.map((target) => relativeTarget(frame, target));

  if (side === "top") return Math.min(...boxes.map((box) => box.top)) - gap - markerSize;
  if (side === "bottom") return Math.max(...boxes.map((box) => box.bottom)) + gap;
  if (side === "left") return Math.min(...boxes.map((box) => box.left)) - gap - markerSize;
  return Math.max(...boxes.map((box) => box.right)) + gap;
}

/**
 * Container처럼 묶음 영역을 가리키는 범위 표시선을 계산한다.
 * 평행선은 대상의 높이 또는 너비 전체를 덮고 외곽선에서 clearance만큼 떨어지며,
 * 번호에서 나온 연결선은 그 평행선에서 끝나 Container 안으로 들어가지 않는다.
 */
export function computeBoundaryPlacement({
  frame,
  target,
  side,
  connectorLength,
  clearance,
  markerSize,
}: {
  frame: AnatomyBox;
  target: AnatomyBox;
  side: AnatomySide;
  connectorLength: number;
  clearance: number;
  markerSize: number;
}): BoundaryPlacement {
  const box = relativeTarget(frame, target);
  const half = markerSize / 2;
  const lineOffset = half - LINE_THICKNESS / 2;
  const distance = clearance + connectorLength;

  if (side === "left") {
    const markerLeft = box.left - distance - markerSize;
    return {
      marker: { left: markerLeft, top: box.centerY - half },
      connector: { left: markerSize, top: lineOffset, width: connectorLength, height: LINE_THICKNESS },
      boundary: {
        left: markerSize + connectorLength,
        top: half - box.height / 2,
        width: LINE_THICKNESS,
        height: box.height,
      },
    };
  }

  if (side === "right") {
    return {
      marker: { left: box.right + distance, top: box.centerY - half },
      connector: { left: -connectorLength, top: lineOffset, width: connectorLength, height: LINE_THICKNESS },
      boundary: {
        left: -connectorLength,
        top: half - box.height / 2,
        width: LINE_THICKNESS,
        height: box.height,
      },
    };
  }

  if (side === "top") {
    return {
      marker: { left: box.centerX - half, top: box.top - distance - markerSize },
      connector: { left: lineOffset, top: markerSize, width: LINE_THICKNESS, height: connectorLength },
      boundary: {
        left: half - box.width / 2,
        top: markerSize + connectorLength,
        width: box.width,
        height: LINE_THICKNESS,
      },
    };
  }

  return {
    marker: { left: box.centerX - half, top: box.bottom + distance },
    connector: { left: lineOffset, top: -connectorLength, width: LINE_THICKNESS, height: connectorLength },
    boundary: {
      left: half - box.width / 2,
      top: -connectorLength,
      width: box.width,
      height: LINE_THICKNESS,
    },
  };
}

export type TextTargetCandidate = { ownText: string; depth: number };

/**
 * 요소가 직접 소유한 텍스트로 Anatomy 대상을 고른다. Anatomy 예시의 콘텐츠는 요소 명칭을
 * 그대로 사용하므로, 같은 명칭을 가진 후보가 여럿이면 가장 안쪽 요소를 대상으로 삼는다.
 */
export function pickTextTarget<T extends TextTargetCandidate>(candidates: T[], needle: string): T | null {
  const wanted = needle.trim();
  let picked: T | null = null;
  for (const candidate of candidates) {
    if (candidate.ownText.trim() !== wanted) continue;
    if (!picked || candidate.depth > picked.depth) picked = candidate;
  }
  return picked;
}

export type WrappingTargetCandidate = { texts: string[]; depth: number };

/**
 * Container처럼 여러 요소를 묶는 대상을 고른다. 클래스 이름이 아니라 어떤 부품을 품고 있는지로
 * 정의하므로, 구현의 스타일이 바뀌어도 같은 묶음 영역을 계속 가리킨다.
 */
export function pickWrappingTarget<T extends WrappingTargetCandidate>(candidates: T[], needles: string[]): T | null {
  const wanted = needles.map((needle) => needle.trim());
  let picked: T | null = null;
  for (const candidate of candidates) {
    const owned = candidate.texts.map((text) => text.trim());
    if (!wanted.every((needle) => owned.includes(needle))) continue;
    if (!picked || candidate.depth > picked.depth) picked = candidate;
  }
  return picked;
}

/**
 * `input`처럼 값을 담는 폼 요소는 박스가 Container 안쪽을 거의 다 채우기 때문에,
 * 번호선을 박스 기준으로 그리면 Container의 border에 닿아 끊긴 것처럼 보인다.
 * 다른 화면의 Field가 글자 또는 글자가 놓이는 자리를 가리키는 것과 같아지도록
 * 세로 범위를 글자가 앉는 한 줄로 좁힌다. 이미 한 줄 높이면 그대로 둔다.
 */
export function shrinkToTextLine(box: AnatomyBox, lineHeight: number): AnatomyBox {
  if (!Number.isFinite(lineHeight) || lineHeight <= 0 || lineHeight >= box.height) return box;
  return {
    left: box.left,
    top: box.top + (box.height - lineHeight) / 2,
    width: box.width,
    height: lineHeight,
  };
}
