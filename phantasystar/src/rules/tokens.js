export const SQUARE_PX = 70;

const SQUARES_BY_SIZE = { tiny: 1, small: 1, medium: 1, large: 2, huge: 3, gargantuan: 4 };

export const tokenSizeForSize = (size) => String(SQUARES_BY_SIZE[size] ?? 1);

export const parseTokenSize = (text) => {
  const parts = String(text ?? '').trim().split(/\s*[,x×]\s*/i);
  if (parts.length > 2 || parts.some((p) => p === '')) return null;
  const [width, height = width] = parts.map(Number);
  if (!(width > 0) || !(height > 0)) return null;
  return { width, height };
};

export const tokenDimensions = (tokenSize, size) => {
  const squares = parseTokenSize(tokenSize) ?? parseTokenSize(tokenSizeForSize(size));
  return { width: squares.width * SQUARE_PX, height: squares.height * SQUARE_PX };
};

const DARK_SENSES = /\b(darkvision|infravision|blindsight|tremorsense|truesight)\s+(\d+)\s*(?:ft|feet)/gi;

export const visionFromSenses = (senses) => {
  const ranges = [...String(senses ?? '').matchAll(DARK_SENSES)].map((m) => Number(m[2]));
  if (!ranges.length) return null;
  return {
    has_bright_light_vision: true,
    has_night_vision: true,
    night_vision_distance: Math.max(...ranges),
  };
};

export const creatureToken = ({ tokenSize, size, senses }) => ({
  ...tokenDimensions(tokenSize, size),
  ...(visionFromSenses(senses) ?? {}),
});
