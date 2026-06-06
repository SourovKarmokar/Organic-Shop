import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ShippingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { const { data } = await supabase.from("shipping_charges").select("*").order("created_at"); setItems(data || []); };

  const save = async () => {
    if (editItem.id) { await supabase.from("shipping_charges").update(editItem).eq("id", editItem.id); }
    else { await supabase.from("shipping_charges").insert(editItem); }
    toast({ title: "সেভ হয়েছে" });
    setDialogOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">শিপিং চার্জ</h1>
        <Button onClick={() => { setEditItem({ area_name: "", charge: 0, is_active: true }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> নতুন</Button>
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left py-3 px-4">এলাকা</th>
            <th className="text-left py-3 px-4">চার্জ</th>
            <th className="text-left py-3 px-4">অ্যাকশন</th>
          </tr></thead>
          <tbody>{items.map((i) => (
            <tr key={i.id} className="border-b">
              <td className="py-2 px-4">{i.area_name}</td>
              <td className="py-2 px-4">৳{i.charge}</td>
              <td className="py-2 px-4 flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setEditItem(i); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("shipping_charges").delete().eq("id", i.id); fetch(); }}><Trash2 className="w-4 h-4" /></Button>
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
              <div><Label>এলাকা</Label><Input value={editItem.area_name} onChange={(e) => setEditItem({ ...editItem, area_name: e.target.value })} /></div>
              <div><Label>চার্জ (৳)</Label><Input type="number" value={editItem.charge} onChange={(e) => setEditItem({ ...editItem, charge: Number(e.target.value) })} /></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button><Button onClick={save}>সেভ</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
