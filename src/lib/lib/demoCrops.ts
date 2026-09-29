export type Crop = {
  id: string;
  name: string;
  variety: string;
  field: string;
  area: string;
  plantingDate: string;
  harvestDate: string;
  growthStage: string;
  irrigation: string;
};

export const DEMO_CROPS: Crop[] = [
  {
    id: "demo-maize",
    name: "Maize",
    variety: "DHM 117",
    field: "Field A",
    area: "2",
    plantingDate: "2026-07-15",
    harvestDate: "2026-10-15",
    growthStage: "Vegetative",
    irrigation: "Drip",
  },
  {
    id: "demo-cotton",
    name: "Cotton",
    variety: "RCH 659",
    field: "Field B",
    area: "1.5",
    plantingDate: "2026-06-25",
    harvestDate: "2026-11-20",
    growthStage: "Flowering",
    irrigation: "Drip",
  },
  {
    id: "demo-paddy",
    name: "Paddy",
    variety: "BPT 5204",
    field: "Field C",
    area: "1",
    plantingDate: "2026-07-05",
    harvestDate: "2026-10-20",
    growthStage: "Vegetative",
    irrigation: "Flood",
  },
  {
    id: "demo-chilli",
    name: "Chilli",
    variety: "Teja",
    field: "Field D",
    area: "0.7",
    plantingDate: "2026-08-20",
    harvestDate: "2026-12-20",
    growthStage: "Vegetative",
    irrigation: "Drip",
  },
  {
    id: "demo-groundnut",
    name: "Groundnut",
    variety: "Kadiri 6",
    field: "Field E",
    area: "1",
    plantingDate: "2026-07-10",
    harvestDate: "2026-10-10",
    growthStage: "Flowering",
    irrigation: "Rainfed",
  },
];