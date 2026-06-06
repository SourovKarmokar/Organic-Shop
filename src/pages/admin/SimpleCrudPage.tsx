import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Field {
  key: string;
  label: string;
  type?: string;
}

interface Props {
  title: string;
  table: string;
  fields: Field[];
  columns: Field[];
}

export default function SimpleCrudPage({ title, table, fields, columns }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, [table]);

  const fetchData = async () => {
    const { data } = await supabase.from(table as any).select("*").order("created_at", { ascending: false });
    setItems(data || []);
  };

  const save = async () => {
    const payload = { ...editItem };
    if (editItem.id) {
      await supabase.from(table as any).update(payload).eq("id", editItem.id);
    } else {
      delete payload.id;
      await supabase.from(table as any).insert(payload);
    }
    toast({ title: "সেভ হয়েছে" });
    setDialogOpen(false);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    await supabase.from(table as any).delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchData();
  };

  const newItem = () => {
    const empty: any = {};
    fields.forEach(f => { empty[f.key] = f.type === "number" ? 0 : ""; });
    setEditItem(empty);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={newItem}><Plus className="w-4 h-4 mr-1" /> নতুন</Button>
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            {columns.map(c => <th key={c.key} className="text-left py-3 px-4">{c.label}</th>)}
            <th className="text-left py-3 px-4">অ্যাকশন</th>
          </tr></thead>
          <tbody>{items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/30">
              {columns.map(c => <td key={c.key} className="py-2 px-4">{item[c.key] || '-'}</td>)}
              <td className="py-2 px-4 flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setEditItem(item); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" /></Button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? "এডিট" : "নতুন"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}><Label>{f.label}</Label><Input type={f.type || "text"} value={editItem[f.key] || ''} onChange={(e) => setEditItem({ ...editItem, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })} /></div>
              ))}
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button><Button onClick={save}>সেভ</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
