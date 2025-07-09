import { useState } from "react";

// Updated for Vercel deployment - using simple CSV parsing
interface PricingInputs {
  garment: string;
  size: string;
  colorCount: number;
  qty: number;
}

const garmentTypes = [
  { label: "T-Shirt", value: "tshirt" },
  { label: "Hoodie", value: "hoodie" },
  { label: "Long Sleeve", value: "longsleeve" },
  { label: "Tank Top", value: "tanktop" },
  // Add more as needed
];

const imprintSizes = [
  { label: "A6 (Small/Tag)", value: "A6" },
  { label: "A5 (Left Chest)", value: "A5" },
  { label: "A4 (Full Front)", value: "A4" },
  { label: "A3 (Oversize)", value: "A3" },
  { label: "A2 (Jumbo) ", value: "A2" },
];

const colorCounts = Array.from({ length: 10 }, (_, i) => i + 1);
const qtyBreaks = [1, 5, 10, 15, 20, 25, 50, 75, 100, 250, 750, 1000, 2500, 5000, 7500, 10000];

function getClosestQty(qty: number) {
  let closest = qtyBreaks[0];
  for (let i = 1; i < qtyBreaks.length; i++) {
    if (Math.abs(qty - qtyBreaks[i]) < Math.abs(qty - closest)) {
      closest = qtyBreaks[i];
    }
  }
  return closest;
}

// Simple CSV parser function
function parseCSV(csvText: string): string[][] {
  return csvText
    .trim()
    .split('\n')
    .map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));
}

export default function PricingForm() {
  const [inputs, setInputs] = useState<PricingInputs>({
    garment: "tshirt",
    size: "A4",
    colorCount: 1,
    qty: 12,
  });
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePrice = async (inputs: PricingInputs) => {
    setLoading(true);
    setError(null);
    setPrice(null);
    try {
      // Build CSV path
      const csvPath = `/pricer/standard/standard-new-${inputs.colorCount}color.csv`;
      // Fetch CSV file
      const response = await fetch(csvPath);
      if (!response.ok) throw new Error("CSV not found");
      const csvText = await response.text();
      // Parse CSV using simple parser
      const rows = parseCSV(csvText);
      const [header, ...dataRows] = rows;
      // Find row for imprint size
      const row = dataRows.find(r => r[0].replace(/\s/g, "") === inputs.size);
      if (!row) throw new Error("Imprint size not found");
      // Find closest quantity break
      const closestQty = getClosestQty(inputs.qty);
      const qtyIdx = header.findIndex(h => h.replace(/\s/g, "") === String(closestQty));
      if (qtyIdx === -1) throw new Error("Quantity break not found");
      // Parse price (remove $ and commas)
      const priceStr = row[qtyIdx]?.replace(/[^\d.]/g, "");
      const priceNum = priceStr ? parseFloat(priceStr) : null;
      if (!priceNum) throw new Error("Price not found");
      setPrice(priceNum);
    } catch (e: any) {
      setError(e.message || "Error calculating price");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (field: keyof PricingInputs, value: any) => {
    const updated = { ...inputs, [field]: value };
    setInputs(updated);
    calculatePrice(updated);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded shadow max-w-xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold mb-2">Screen Print Instant Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Garment Type</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={inputs.garment}
            onChange={e => onChange("garment", e.target.value)}
          >
            {garmentTypes.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Imprint Size</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={inputs.size}
            onChange={e => onChange("size", e.target.value)}
          >
            {imprintSizes.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Number of Colors</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={inputs.colorCount}
            onChange={e => onChange("colorCount", Number(e.target.value))}
          >
            {colorCounts.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Quantity</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-2 py-1"
            value={inputs.qty}
            onChange={e => onChange("qty", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="mt-6 text-xl font-semibold min-h-[2.5rem]">
        {loading ? (
          <span className="text-blue-500">Calculating...</span>
        ) : error ? (
          <span className="text-red-500">{error}</span>
        ) : price !== null ? (
          <>Estimated Price per Piece: <span className="text-green-600">${price.toFixed(2)}</span></>
        ) : (
          <span className="text-gray-500">Select options to see price</span>
        )}
      </div>
      <div className="text-sm text-gray-400 mt-2">All prices are estimates and subject to final review.</div>
    </div>
  );
}
