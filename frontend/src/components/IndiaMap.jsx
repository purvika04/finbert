import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { name: "Delhi / NCR", coordinates: [77.2090, 28.6139], risk: "Moderate", concentration: "24%", color: "#EF9F27", banks: ["Punjab National Bank", "Bank of Baroda", "Delhi Co-op"] },
  { name: "Mumbai (Maharashtra)", coordinates: [72.8777, 19.0760], risk: "Safe", concentration: "31%", color: "#1D9E75", banks: ["HDFC Bank", "ICICI Bank", "State Bank of India"] },
  { name: "Pune (Maharashtra)", coordinates: [73.8567, 18.5204], risk: "Safe", concentration: "12%", color: "#1D9E75", banks: ["Bank of Maharashtra", "Cosmos Bank"] },
  { name: "Ahmedabad (Gujarat)", coordinates: [72.5714, 23.0225], risk: "Safe", concentration: "15%", color: "#1D9E75", banks: ["Gujarat State Co-op", "Axis Bank"] },
  { name: "Jaipur (Rajasthan)", coordinates: [75.7873, 26.9124], risk: "Moderate", concentration: "9%", color: "#EF9F27", banks: ["AU Small Finance", "Rajasthan Marudhara"] },
  { name: "Lucknow (UP)", coordinates: [80.9462, 26.8467], risk: "Caution", concentration: "11%", color: "#E24B4A", banks: ["Baroda UP Bank", "Prathama UP Gramin"] },
  { name: "Patna (Bihar)", coordinates: [85.1376, 25.5941], risk: "High", concentration: "8%", color: "#E24B4A", banks: ["Dakshin Bihar Gramin", "Bihar State Co-op"] },
  { name: "Kolkata (West Bengal)", coordinates: [88.3639, 22.5726], risk: "Caution", concentration: "18%", color: "#EF9F27", banks: ["UCO Bank", "Bandhan Bank", "Allahabad Bank"] },
  { name: "Guwahati (Assam)", coordinates: [91.7362, 26.1445], risk: "Moderate", concentration: "5%", color: "#EF9F27", banks: ["Assam Gramin Vikash", "North East SFB"] },
  { name: "Bhopal (Madhya Pradesh)", coordinates: [77.4126, 23.2599], risk: "Safe", concentration: "7%", color: "#1D9E75", banks: ["Madhyanchal Gramin", "Central Bank of India"] },
  { name: "Hyderabad (Telangana)", coordinates: [78.4867, 17.3850], risk: "Moderate", concentration: "14%", color: "#EF9F27", banks: ["Telangana State Co-op", "Andhra Bank (merged)"] },
  { name: "Bangalore (Karnataka)", coordinates: [77.5946, 12.9716], risk: "Safe", concentration: "22%", color: "#1D9E75", banks: ["Canara Bank", "Karnataka Bank", "Ujjivan SFB"] },
  { name: "Chennai (Tamil Nadu)", coordinates: [80.2707, 13.0827], risk: "High", concentration: "19%", color: "#E24B4A", banks: ["Indian Bank", "Indian Overseas Bank", "Tamilnad Mercantile"] },
  { name: "Kochi (Kerala)", coordinates: [76.2673, 9.9312], risk: "Caution", concentration: "16%", color: "#EF9F27", banks: ["Federal Bank", "South Indian Bank", "Kerala Gramin"] },
  { name: "Chandigarh (Punjab/Haryana)", coordinates: [76.7794, 30.7333], risk: "Moderate", concentration: "10%", color: "#EF9F27", banks: ["Punjab & Sind Bank", "Haryana State Co-op"] }
];

export default function IndiaMap() {
  const [tooltipData, setTooltipData] = useState(null);

  return (
    <div className="relative w-full h-[400px] bg-[#0A0D18]/50 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 800,
          center: [80, 22] // Center on India
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isIndia = geo.properties.name === "India";
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isIndia ? "#1D9E7520" : "#ffffff05"}
                  stroke={isIndia ? "#1D9E7580" : "#ffffff10"}
                  strokeWidth={isIndia ? 1 : 0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: isIndia ? "#1D9E7540" : "#ffffff05", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              );
            })
          }
        </Geographies>
        {markers.map((marker) => (
          <Marker 
            key={marker.name} 
            coordinates={marker.coordinates}
            onMouseEnter={() => setTooltipData(marker)}
            onMouseLeave={() => setTooltipData(null)}
          >
            <g style={{ cursor: "pointer", outline: "none" }}>
              <circle r={5} fill={marker.color} className="animate-pulse" />
              <circle r={10} fill={marker.color} opacity={0.3} />
              {/* We remove the fixed text label to avoid overlap, and rely purely on the tooltip */}
            </g>
          </Marker>
        ))}
      </ComposableMap>
      
      {tooltipData && (
        <div className="absolute top-4 right-4 bg-[#04060C]/95 backdrop-blur-md border border-white/10 text-white font-mono p-4 rounded-lg shadow-xl w-64 pointer-events-none z-10 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tooltipData.color }} />
            <div className="font-bold text-sm">{tooltipData.name}</div>
          </div>
          <div className="text-xs text-slate-400 mb-1">Risk Level: <span style={{ color: tooltipData.color }}>{tooltipData.risk}</span></div>
          <div className="text-xs text-slate-400 mb-3">Concentration: <span className="text-white">{tooltipData.concentration}</span></div>
          
          <div className="text-xs font-bold text-slate-300 mb-1 border-b border-white/10 pb-1">Key Banks in Region:</div>
          <ul className="text-xs text-slate-400 space-y-1 mt-2">
            {tooltipData.banks.map(bank => (
              <li key={bank} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                {bank}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
