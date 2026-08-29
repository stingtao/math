export type ComboTier = "signal" | "spark" | "flame" | "prism" | "cosmic";

export type ComboSpec = {
  tier: ComboTier;
  label: string;
  motif: string;
  nextAt: number | null;
};

export function getComboSpec(chain: number): ComboSpec {
  if (chain >= 8) return { tier: "cosmic", label: "COSMIC COMBO", motif: "✦", nextAt: null };
  if (chain >= 5) return { tier: "prism", label: "PRISM COMBO", motif: "◇", nextAt: 8 };
  if (chain >= 3) return { tier: "flame", label: "FLAME COMBO", motif: "▲", nextAt: 5 };
  if (chain >= 2) return { tier: "spark", label: "SPARK COMBO", motif: "✧", nextAt: 3 };
  return { tier: "signal", label: "SIGNAL LOCKED", motif: "+1", nextAt: 2 };
}
