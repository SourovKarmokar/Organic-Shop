import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FolderPlus } from "lucide-react";

export default function QuickShortcuts() {
  const navigate = useNavigate();

  const shortcuts = [
    { label: "নতুন প্রোডাক্ট", icon: <Plus className="w-4 h-4" />, path: "/admin/products" },
    { label: "ইনভয়েস তৈরি", icon: <FileText className="w-4 h-4" />, path: "/admin/orders" },
    { label: "ক্যাটাগরি যোগ", icon: <FolderPlus className="w-4 h-4" />, path: "/admin/categories" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {shortcuts.map((s) => (
        <Button key={s.label} variant="outline" size="sm" className="gap-2" onClick={() => navigate(s.path)}>
          {s.icon}
          {s.label}
        </Button>
      ))}
    </div>
  );
}
