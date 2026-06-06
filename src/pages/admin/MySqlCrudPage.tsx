import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "boolean" | "date" | "select";
  options?: string[];
};

type Props = {
  title: string;
  resource: string;
  fields: Field[];
  columns: Field[];
  readOnly?: boolean;
};

type Row = Record<string, any>;

function emptyForm(fields: Field[]) {
  return Object.fromEntries(fields.map((field) => [field.key, field.type === "boolean" ? true : ""]));
}

export default function MySqlCrudPage({ title, resource, fields, columns, readOnly = false }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Row>(() => emptyForm(fields));
  const [editing, setEditing] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const visibleFields = useMemo(() => fields, [fields]);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await adminApi<Row[]>(`/api/admin/resources/${resource}`);
      setRows(data);
    } catch (error) {
      toast({
        title: "Data load failed",
        description: error instanceof Error ? error.message : "Could not load data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [resource]);

  const setValue = (key: string, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const startEdit = (row: Row) => {
    setEditing(row);
    setForm(Object.fromEntries(visibleFields.map((field) => [field.key, row[field.key] ?? (field.type === "boolean" ? false : "")])));
  };

  const reset = () => {
    setEditing(null);
    setForm(emptyForm(visibleFields));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (editing) {
        await adminApi(`/api/admin/resources/${resource}/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await adminApi(`/api/admin/resources/${resource}`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      toast({ title: "Saved", description: `${title} data updated.` });
      reset();
      fetchRows();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save data.",
        variant: "destructive",
      });
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete this ${title} item?`)) return;

    try {
      await adminApi(`/api/admin/resources/${resource}/${row.id}`, { method: "DELETE" });
      toast({ title: "Deleted", description: "Item removed." });
      fetchRows();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete item.",
        variant: "destructive",
      });
    }
  };

  const renderInput = (field: Field) => {
    const value = form[field.key] ?? "";

    if (field.type === "textarea") {
      return <Textarea value={value} onChange={(event) => setValue(field.key, event.target.value)} rows={3} />;
    }

    if (field.type === "boolean") {
      return (
        <select
          value={value ? "true" : "false"}
          onChange={(event) => setValue(field.key, event.target.value === "true")}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(event) => setValue(field.key, event.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <Input
        type={field.type || "text"}
        value={value}
        onChange={(event) => setValue(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)}
      />
    );
  };

  const displayValue = (row: Row, key: string) => {
    const value = row[key];
    if (typeof value === "boolean" || value === 0 || value === 1) {
      if (key.startsWith("is_") || key.startsWith("show_")) return value ? "Yes" : "No";
    }
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {!readOnly && (
          <Button className="gap-2 bg-[#d64901] hover:bg-[#b93f00]" onClick={reset}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        )}
      </div>

      {!readOnly && (
        <Card className="border-[#e3e6de]">
          <CardHeader>
            <CardTitle className="text-base">{editing ? "Edit Item" : "Add New Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
              {visibleFields.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}>
                  <Label>{field.label}</Label>
                  {renderInput(field)}
                </div>
              ))}
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                {editing && (
                  <Button type="button" variant="outline" className="gap-2" onClick={reset}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#e3e6de]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-[#f7f8f6] text-left text-[#617066]">
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-medium">
                      {column.label}
                    </th>
                  ))}
                  {!readOnly && <th className="px-4 py-3 text-right font-medium">Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      {columns.map((column) => (
                        <td key={column.key} className="max-w-[260px] truncate px-4 py-3">
                          {displayValue(row, column.key)}
                        </td>
                      ))}
                      {!readOnly && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => remove(row)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
