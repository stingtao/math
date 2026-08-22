export const avatarFrameCatalog = [
  { id: "plain", label: "Open Trail", cost: 0, copy: "A clean, quiet frame that is always yours." },
  { id: "halo", label: "Soft Halo", cost: 30, copy: "A calm glow for showing up consistently." },
  { id: "summit", label: "Summit Ring", cost: 60, copy: "A bold ring for steady trail progress." },
  { id: "prism", label: "Prism Frame", cost: 90, copy: "A colorful frame for a growing collection." },
] as const;

export type AvatarFrameId = (typeof avatarFrameCatalog)[number]["id"];

export function getAvatarFrame(frame: string) {
  return avatarFrameCatalog.find((item) => item.id === frame);
}
