import { useEffect, useState } from "react";

interface Props {
  onScore: (score: number) => void;
}

const P = "Poppins, sans-serif";

const SORT_ITEMS = [
  { id: "dog", label: "Dog 🐕", category: "animals" },
  { id: "cat", label: "Cat 🐱", category: "animals" },
  { id: "bird", label: "Bird 🐦", category: "animals" },
  { id: "car", label: "Car 🚗", category: "vehicles" },
  { id: "bus", label: "Bus 🚌", category: "vehicles" },
  { id: "plane", label: "Plane ✈️", category: "vehicles" },
];

const BINS = [
  {
    id: "animals",
    label: "Animals 🐾",
    color: "#27ae60",
  },
  {
    id: "vehicles",
    label: "Vehicles 🚗",
    color: "#1565C0",
  },
];

export default function DragDropSorting({ onScore }: Props) {
  const [binContents, setBinContents] = useState<Record<string, string[]>>({
    animals: [],
    vehicles: [],
  });

  const [wrongBin, setWrongBin] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const allSorted = Object.values(binContents).flat();

  const score = allSorted.filter((id) => {
    const item = SORT_ITEMS.find((i) => i.id === id);

    if (!item) return false;

    const currentBin = Object.entries(binContents).find(([, items]) =>
      items.includes(id)
    )?.[0];

    return item.category === currentBin;
  }).length;

  useEffect(() => {
    onScore(score);
  }, [score]);

  const placeItem = (itemId: string, binId: string) => {
    const item = SORT_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    if (item.category === binId) {
      setBinContents((prev) => ({ ...prev, [binId]: [...prev[binId], itemId] }));
      setSelectedItem(null);
    } else {
      setWrongBin(binId);
      setTimeout(() => setWrongBin(null), 700);
    }
  };

  const handleDrop = (binId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    placeItem(e.dataTransfer.getData("itemId"), binId);
  };

  const sortedIds = new Set(Object.values(binContents).flat());

  return (
    <div
      style={{
        width: "100%",
        fontFamily: P,
      }}
    >
      <div style={{fontSize:12,color:"#607D8B",fontWeight:700,marginBottom:12}}>Tap an item, then tap its group on mobile. Drag-and-drop also works on desktop.</div>
      {/* bins */}

      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        {BINS.map((bin) => (
          <div
            key={bin.id}
            onClick={() => selectedItem && placeItem(selectedItem, bin.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(bin.id, e)}
            style={{
              flex: 1,
              minHeight: 150,
              maxWidth: 220,
              borderRadius: 20,
              border: `3px dashed ${
                wrongBin === bin.id ? "#E53935" : bin.color
              }`,
              background:
                wrongBin === bin.id
                  ? "#FFEBEE"
                  : `${bin.color}18`,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: bin.color,
              }}
            >
              {bin.label}
            </span>

            {binContents[bin.id].map((id) => {
              const item = SORT_ITEMS.find((i) => i.id === id)!;

              return (
                <div
                  key={id}
                  style={{
                    background: `${bin.color}33`,
                    borderRadius: 12,
                    padding: "8px 10px",
                    fontWeight: 600,
                  }}
                >
                  {item.label} ✅
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* draggable items */}

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {SORT_ITEMS.map((item) => {
          const placed = sortedIds.has(item.id);

          return (
            <div
              key={item.id}
              draggable={!placed}
              onClick={() => !placed && setSelectedItem(item.id)}
              onDragStart={(e) => e.dataTransfer.setData("itemId", item.id)}
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                background: "white",
                fontWeight: 700,
                cursor: placed ? "default" : "pointer",
                border: selectedItem === item.id ? "3px solid #1565C0" : "2px solid #CFD8DC",
                touchAction: "manipulation",
                opacity: placed ? 0.25 : 1,
                transform: placed ? "scale(.9)" : "scale(1)",
                transition: ".2s",
                boxShadow: "0 2px 8px rgba(0,0,0,.08)",
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}