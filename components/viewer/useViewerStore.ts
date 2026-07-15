import { create } from "zustand";

export type DesignType = "none" | "logo" | "abstract" | "stripe" | "circuit" | "ai";
export type ViewType = "front" | "back" | "side";
export type SizeType = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface ViewerState {
  color: string;
  design: DesignType;
  view: ViewType;
  size: SizeType;
  quantity: number;
  customTextureUrl: string | null;
  customPrompt: string | null;
  history: string[];
  decalScale: number;
  decalPosY: number;
  decalPosX: number;
  decalTarget: "front" | "back";
  garmentType: "tshirt" | "hoodie";
  setColor: (c: string) => void;
  setDesign: (d: DesignType) => void;
  setView: (v: ViewType) => void;
  setSize: (s: SizeType) => void;
  setQuantity: (q: number) => void;
  setCustomTextureUrl: (url: string | null) => void;
  setCustomPrompt: (prompt: string | null) => void;
  addToHistory: (url: string) => void;
  setDecalScale: (s: number) => void;
  setDecalPosY: (y: number) => void;
  setDecalPosX: (x: number) => void;
  setDecalTarget: (t: "front" | "back") => void;
  setGarmentType: (t: "tshirt" | "hoodie") => void;
  resetDecalPlacement: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  color: "#ffffff",
  design: "none",
  view: "front",
  size: "M",
  quantity: 1,
  customTextureUrl: null,
  customPrompt: null,
  history: [],
  decalScale: 0.35,
  decalPosY: 0.05,
  decalPosX: 0.00,
  decalTarget: "front",
  garmentType: "tshirt",
  setColor: (color) => set({ color }),
  setDesign: (design) => set({ design }),
  setView: (view) => set({ view }),
  setSize: (size) => set({ size }),
  setQuantity: (quantity) => set({ quantity: Math.max(1, Math.min(99, quantity)) }),
  setCustomTextureUrl: (customTextureUrl) => set({ customTextureUrl }),
  setCustomPrompt: (customPrompt) => set({ customPrompt }),
  addToHistory: (url) => set((state) => ({ history: [url, ...state.history.filter((h) => h !== url)].slice(0, 12) })), // limit history to 12 items
  setDecalScale: (decalScale) => set({ decalScale }),
  setDecalPosY: (decalPosY) => set({ decalPosY }),
  setDecalPosX: (decalPosX) => set({ decalPosX }),
  setDecalTarget: (decalTarget) => set({ decalTarget }),
  setGarmentType: (garmentType) => set({ garmentType }),
  resetDecalPlacement: () => set({ decalScale: 0.35, decalPosY: 0.05, decalPosX: 0.00, decalTarget: "front" }),
}));
