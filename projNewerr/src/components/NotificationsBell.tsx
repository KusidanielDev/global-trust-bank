"use client";
import { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";

type Notif = { id: string; title: string; body: string; read: boolean; createdAt: string };

export default function NotificationsBell(){
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    const res = await fetch("/api/notifications", { cache: "no-store" });
    const json = await res.json();
    setItems(json || []);
    setLoading(false);
  }

  useEffect(()=>{ if (open) load(); }, [open]);

  async function markAll(){
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ action: "markAllRead" })});
    load();
  }

  const unread = items.filter(i=>!i.read).length;

  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="p-2 rounded-md text-blue-50 hover:text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 relative">
        <BellIcon className="h-6 w-6" />
        {unread>0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full bg-red-600 text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded-xl shadow-lg border z-50">
          <div className="p-3 flex items-center justify-between border-b">
            <div className="font-semibold">Notifications</div>
            <button onClick={markAll} className="text-sm text-blue-700 hover:underline">Mark all read</button>
          </div>
          <div className="max-h-80 overflow-auto">
            {loading && <div className="p-4 text-sm">Loading…</div>}
            {!loading && items.length===0 && <div className="p-4 text-sm text-gray-700">No notifications.</div>}
            {!loading && items.map(n=>(
              <div key={n.id} className={"p-3 border-b " + (n.read? "bg-white" : "bg-blue-50")}>
                <div className="text-sm font-semibold">{n.title}</div>
                <div className="text-xs text-gray-700">{n.body}</div>
                <div className="text-[10px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
