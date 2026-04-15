"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createClient } from "@/lib/supabase/client";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/lead-statuses";

interface DoorKnock {
  id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: LeadStatus;
  notes: string | null;
  lead_id: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  homeowner_name: string;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  status: LeadStatus;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

// Full lead form — only shown for "Inspection" status
function InspectionForm({
  address,
  city,
  state,
  zip,
  lat,
  lng,
  onSave,
  onCancel,
}: {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  onSave: (data: { homeowner_name: string; phone: string; email: string; address: string; city: string; state: string; zip: string; notes: string; lat: number; lng: number }) => void;
  onCancel: () => void;
}) {
  const [homeownerName, setHomeownerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [formAddress, setFormAddress] = useState(address);
  const [formCity, setFormCity] = useState(city);
  const [formState, setFormState] = useState(state || "TX");
  const [formZip, setFormZip] = useState(zip);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave({ homeowner_name: homeownerName, phone, email, address: formAddress, city: formCity, state: formState, zip: formZip, notes, lat, lng });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-md bg-teal-50 p-2 text-xs font-medium text-teal-800">
        Inspection — Creating a full lead
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Homeowner Name *</label>
        <input type="text" required value={homeownerName} onChange={(e) => setHomeownerName(e.target.value)} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="John Smith" autoFocus />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Address</label>
        <input type="text" required value={formAddress} onChange={(e) => setFormAddress(e.target.value)} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600">City</label>
          <input type="text" required value={formCity} onChange={(e) => setFormCity(e.target.value)} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="w-16">
          <label className="block text-xs font-medium text-slate-600">State</label>
          <input type="text" value={formState} onChange={(e) => setFormState(e.target.value)} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="w-20">
          <label className="block text-xs font-medium text-slate-600">ZIP</label>
          <input type="text" value={formZip} onChange={(e) => setFormZip(e.target.value)} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600">Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="(555) 123-4567" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="john@email.com" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none" placeholder="Roof damage, missing shingles..." />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="flex-1 rounded bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save Inspection Lead"}</button>
        <button type="button" onClick={onCancel} className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  );
}

export default function CanvassingMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [doorKnocks, setDoorKnocks] = useState<DoorKnock[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // UI state
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number; lng: number; address: string; city: string; state: string; zip: string;
  } | null>(null);

  const supabase = createClient();

  // Fetch all door knocks
  const fetchDoorKnocks = useCallback(async () => {
    const { data } = await supabase
      .from("door_knocks")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDoorKnocks(data as DoorKnock[]);
  }, [supabase]);

  // Create marker element
  const createMarkerElement = (status: LeadStatus) => {
    const config = LEAD_STATUSES[status] || LEAD_STATUSES.new;
    const el = document.createElement("div");
    el.style.cssText = "width:32px;height:32px;border-radius:50%;background:" + config.color + ";border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;font-weight:700;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.3);";
    el.textContent = config.symbol;
    return el;
  };

  // Update markers on the map
  const updateMarkers = useCallback(() => {
    if (!map.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    doorKnocks.forEach((knock) => {
      const el = createMarkerElement(knock.status);
      const sc = LEAD_STATUSES[knock.status] || LEAD_STATUSES.new;

      let popupHtml = '<div style="font-family:system-ui,sans-serif;">'
        + '<div style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;color:white;background:' + sc.color + ';">' + sc.label + '</div>';

      if (knock.address) {
        popupHtml += '<div style="font-size:12px;color:#64748b;margin-top:6px;">' + knock.address + (knock.city ? ", " + knock.city : "") + (knock.state ? ", " + knock.state : "") + " " + (knock.zip || "") + '</div>';
      }
      if (knock.notes) {
        popupHtml += '<div style="font-size:12px;color:#475569;margin-top:6px;border-top:1px solid #e2e8f0;padding-top:6px;">' + knock.notes + '</div>';
      }
      if (knock.lead_id) {
        popupHtml += '<a href="/dashboard/canvassing/' + knock.lead_id + '" style="display:inline-block;margin-top:8px;font-size:12px;color:#2563eb;text-decoration:none;">View Lead &rarr;</a>';
      }
      popupHtml += '</div>';

      const popup = new mapboxgl.Popup({ offset: 20, maxWidth: "280px" }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([knock.longitude, knock.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [doorKnocks]);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    map.current = new mapboxgl.Map({ container: mapContainer.current, style: "mapbox://styles/mapbox/streets-v12", center: [-96.797, 32.7767], zoom: 14 });
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        map.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 16 });
      }, () => {});
    }

    map.current.on("load", () => setMapLoaded(true));

    map.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      try {
        const res = await fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/" + lng + "," + lat + ".json?access_token=" + mapboxgl.accessToken + "&types=address");
        const data = await res.json();
        let address = "", city = "", state = "", zip = "";
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          address = feature.address ? feature.address + " " + feature.text : feature.text || "";
          const context = feature.context || [];
          for (const ctx of context) {
            if (ctx.id.startsWith("place")) city = ctx.text;
            if (ctx.id.startsWith("region")) state = ctx.short_code?.replace("US-", "") || ctx.text;
            if (ctx.id.startsWith("postcode")) zip = ctx.text;
          }
        }
        setClickedLocation({ lat, lng, address, city, state, zip });
        setShowStatusPicker(true);
        setShowInspectionForm(false);
      } catch {
        setClickedLocation({ lat, lng, address: "", city: "", state: "TX", zip: "" });
        setShowStatusPicker(true);
        setShowInspectionForm(false);
      }
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => { if (mapLoaded) fetchDoorKnocks(); }, [mapLoaded, fetchDoorKnocks]);
  useEffect(() => { if (mapLoaded) updateMarkers(); }, [doorKnocks, mapLoaded, updateMarkers]);

  // Drop a pin (non-inspection) — just save status + location
  const handleDropPin = async (status: LeadStatus) => {
    if (!clickedLocation) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (status === "inspection") {
      setShowStatusPicker(false);
      setShowInspectionForm(true);
      return;
    }

    await supabase.from("door_knocks").insert({
      created_by: user.id,
      latitude: clickedLocation.lat,
      longitude: clickedLocation.lng,
      address: clickedLocation.address || null,
      city: clickedLocation.city || null,
      state: clickedLocation.state || null,
      zip: clickedLocation.zip || null,
      status,
      notes: null,
      lead_id: null,
    });

    setShowStatusPicker(false);
    setClickedLocation(null);
    await fetchDoorKnocks();
  };

  // Save inspection as both a lead and a door knock
  const handleSaveInspection = async (data: {
    homeowner_name: string; phone: string; email: string;
    address: string; city: string; state: string; zip: string;
    notes: string; lat: number; lng: number;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create the lead first
    const { data: lead, error: leadError } = await supabase.from("leads").insert({
      created_by: user.id,
      homeowner_name: data.homeowner_name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip || null,
      status: "inspection",
      notes: data.notes || null,
      source: "canvassing",
      latitude: data.lat,
      longitude: data.lng,
    }).select("id").single();

    if (leadError) return;

    // Create the door knock linked to the lead
    await supabase.from("door_knocks").insert({
      created_by: user.id,
      latitude: data.lat,
      longitude: data.lng,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      status: "inspection",
      notes: data.notes || null,
      lead_id: lead?.id || null,
    });

    setShowInspectionForm(false);
    setClickedLocation(null);
    await fetchDoorKnocks();
  };

  const closePanel = () => {
    setShowStatusPicker(false);
    setShowInspectionForm(false);
    setClickedLocation(null);
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-2 text-xs font-semibold text-slate-700">Tap the map to log a door</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(LEAD_STATUSES).map(([key, { label, color, symbol }]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ background: color }}>{symbol}</div>
              <span className="text-[11px] text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Door count */}
      <div className="absolute right-4 top-4 rounded-lg bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold text-slate-700">{doorKnocks.length} door{doorKnocks.length !== 1 ? "s" : ""} logged</p>
      </div>

      {/* Quick Status Picker — shows when you click the map */}
      {showStatusPicker && clickedLocation && (
        <div className="absolute right-4 top-16 w-72 rounded-xl bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Log this door</h3>
            <button onClick={closePanel} className="text-slate-400 hover:text-slate-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {clickedLocation.address && (
            <p className="mb-3 text-xs text-slate-500">{clickedLocation.address}, {clickedLocation.city}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LEAD_STATUSES).filter(([key]) => key !== "new").map(([key, { label, color }]) => (
              <button
                key={key}
                onClick={() => handleDropPin(key as LeadStatus)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inspection Lead Form — only shows when Inspection is selected */}
      {showInspectionForm && clickedLocation && (
        <div className="absolute right-4 top-16 w-80 max-h-[calc(100vh-120px)] overflow-y-auto rounded-xl bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Inspection Lead</h3>
            <button onClick={closePanel} className="text-slate-400 hover:text-slate-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <InspectionForm
            address={clickedLocation.address}
            city={clickedLocation.city}
            state={clickedLocation.state}
            zip={clickedLocation.zip}
            lat={clickedLocation.lat}
            lng={clickedLocation.lng}
            onSave={handleSaveInspection}
            onCancel={closePanel}
          />
        </div>
      )}
    </div>
  );
}