import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Resource = "brands" | "colors" | "sizes";
type Row = {
  id: string;
  name: string;
  logo_url?: string | null;
  hex_code?: string | null;
  value?: string | null;
};

type Props = {
  resource: Resource;
  title: string;
};

const config = {
  brands: {
    fields: ["name", "logo_url"] as const,
    headers: ["নাম", "লোগো", "অ্যাকশন"],
    empty: { name: "", logo_url: "" },
  },
  colors: {
    fields: ["name", "hex_code"] as const,
    headers: ["নাম", "কালার", "অ্যাকশন"],
    empty: { name: "", hex_code: "#000000" },
  },
  sizes: {
    fields: ["name", "value"] as const,
    headers: ["নাম", "ভ্যালু", "অ্যাকশন"],
    empty: { name: "", value: "" },
  },
};

export default function ProductOptionPage({ resource, title }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const setup = config[resource];

  const fetchRows = async () => {
    setRows(await adminApi<Row[]>(`/api/admin/resources/${resource}`));
  };

  useEffect(() => {
    fetchRows();
  }, [resource]);

  const orderedRows = useMemo(() => rows.slice().sort((a, b) => a.name.localeCompare(b.name)), [rows]);

  const save = async () => {
    if (!editing?.name) return;
    if (editing.id) {
      await adminApi(`/api/admin/resources/${resource}/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
    } else {
      await adminApi(`/api/admin/resources/${resource}`, { method: "POST", body: JSON.stringify(editing) });
    }
    setEditing(null);
    fetchRows();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete ${row.name}?`)) return;
    await adminApi(`/api/admin/resources/${resource}/${row.id}`, { method: "DELETE" });
    fetchRows();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#253029]">{title}</h1>
        <Button onClick={() => setEditing(setup.empty)} className="gap-2 bg-[#d64901] hover:bg-[#b83f00]">
          <Plus className="h-4 w-4" />
          নতুন
        </Button>
      </div>

      <section className="overflow-hidden rounded-md border border-[#dfe5dc] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-[#f6f8f5] text-[#253029]">
            <tr>
              {setup.headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderedRows.length ? (
              orderedRows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-[#fbfcfa]">
                  <td className="px-4 py-4">{row.name}</td>
                  <td className="px-4 py-4">
                    {resource === "brands" && (row.logo_url ? <img src={row.logo_url} alt={row.name} className="h-10 w-10 rounded object-cover" /> : "-")}
                    {resource === "colors" && (
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-10 rounded border" style={{ backgroundColor: row.hex_code || "#fff" }} />
                        <span>{row.hex_code || "-"}</span>
                      </div>
                    )}
                    {resource === "sizes" && (row.value || "-")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-4">
                      <button onClick={() => setEditing(row)} className="text-[#253029] hover:text-[#d64901]" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(row)} className="text-red-500 hover:text-red-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-12 text-center text-[#60756a]">No data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? `${title} এডিট` : `নতুন ${title}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div>
                <Label>নাম</Label>
                <Input value={editing.name || ""} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
              </div>
              {resource === "brands" && (
                <div>
                  <Label>Logo URL</Label>
                  <Input value={editing.logo_url || ""} onChange={(event) => setEditing({ ...editing, logo_url: event.target.value })} />
                </div>
              )}
              {resource === "colors" && (
                <div>
                  <Label>HEX Code</Label>
                  <Input value={editing.hex_code || ""} onChange={(event) => setEditing({ ...editing, hex_code: event.target.value })} />
                </div>
              )}
              {resource === "sizes" && (
                <div>
                  <Label>ভ্যালু</Label>
                  <Input value={editing.value || ""} onChange={(event) => setEditing({ ...editing, value: event.target.value })} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save} className="bg-[#d64901] hover:bg-[#b83f00]">Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
