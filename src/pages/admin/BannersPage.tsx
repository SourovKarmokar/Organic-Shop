import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { const { data } = await supabase.from("banners").select("*").order("sort_order"); setBanners(data || []); };

  const save = async () => {
    const payload = { ...editItem };
    if (editItem.id) { await supabase.from("banners").update(payload).eq("id", editItem.id); }
    else { await supabase.from("banners").insert(payload); }
    toast({ title: "সেভ হয়েছে" });
    setDialogOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ব্যানার ম্যানেজমেন্ট</h1>
        <Button onClick={() => { setEditItem({ title: "", image_url: "", redirect_url: "", is_active: true, sort_order: 0 }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> নতুন</Button>
      </div>
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4">ছবি</th>
              <th className="text-left py-3 px-4">টাইটেল</th>
              <th className="text-left py-3 px-4">স্ট্যাটাস</th>
              <th className="text-left py-3 px-4">অ্যাকশন</th>
            </tr></thead>
            <tbody>{banners.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="py-2 px-4"><img src={b.image_url} alt="" className="w-24 h-12 rounded object-cover" /></td>
                <td className="py-2 px-4">{b.title || '-'}</td>
                <td className="py-2 px-4"><span className={`text-xs px-2 py-1 rounded ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="py-2 px-4 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditItem(b); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("banners").delete().eq("id", b.id); fetch(); }}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? "এডিট" : "নতুন ব্যানার"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div><Label>টাইটেল</Label><Input value={editItem.title || ''} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} /></div>
              <div><Label>ইমেজ URL *</Label><Input value={editItem.image_url} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} /></div>
              <div><Label>রিডাইরেক্ট URL</Label><Input value={editItem.redirect_url || ''} onChange={(e) => setEditItem({ ...editItem, redirect_url: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editItem.is_active} onCheckedChange={(v) => setEditItem({ ...editItem, is_active: v })} /><Label>Active</Label></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button><Button onClick={save}>সেভ</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
