/**
 * Placeholder photography helpers. All app data now comes from MySQL via
 * src/lib/repo/* — see db/schema.sql and scripts/seed.mjs.
 */

export type Level = "Pemula" | "Menengah" | "Mahir";

export function unsplash(id: string, w = 900) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;
}

const PHOTO_POOL = [
  "1466692476868-aef1dfb1e735", // seedlings in a seed tray
  "1471194402529-8e0f5a675de6", // cherry tomatoes ripening on the vine
  "1518006959466-0db0b6b4c1d0", // red chillies on the plant
  "1591857177593-aec16c2d8f60", // young staked tomato plant in a bed
  "1592841200221-a6898f307baa", // roma tomatoes on the plant, sunny
  "1615671524827-c1fe3973b648", // hand holding a seedling over trays
  "1629282980228-46b85d221086", // tending potted plants on a patio
  "1637795257839-896afee861fd", // potted chilli plants on a shelf
  "1649255756520-923ff309df99", // seedlings in peat pots
  "1650223154381-cef156da1851", // pepper seedlings in tray cells
  "1650223154483-ccdef5d0e19d", // chilli seedlings on a windowsill
  "1686278895718-26a2331d7297", // tomatoes on the vine
  "1710663497561-b98b13c09aeb", // chilli plant in flower with small fruit
  "1745063537934-e6bf484d72eb", // watering can and pots on a balcony
  "1770982698901-defbee226738", // green chillies hanging on the plant
  "1777383504207-8aa285dd2f20", // raised planters on a patio
];

export function photo(seed: string, lock: number, w = 900) {
  let h = lock * 2654435761;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return unsplash(PHOTO_POOL[Math.abs(h) % PHOTO_POOL.length], w);
}
