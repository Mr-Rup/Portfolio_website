/**
 * Universal CRUD & Reordering Abstraction Hook (`useCrud.ts`)
 * -------------------------------------------------------------
 * Abstract state management hook handling Create, Read, Update, Delete,
 * Drag-and-Drop Reordering, and Visibility Toggles across any domain entity.
 */

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { arrayMove } from "@dnd-kit/sortable";

export interface CrudConfig<T> {
  fetchData: () => Promise<T[]>;
  createItem: (item: T) => Promise<boolean | any>;
  updateItem: (id: string, item: T) => Promise<boolean | any>;
  deleteItem: (id: string) => Promise<boolean>;
  reorderItems?: (items: { id: string; order: number }[]) => Promise<boolean>;
  emptyForm: T;
  transformPayload?: (formData: any) => any;
  successMessage?: string;
  errorMessage?: string;
  idField?: string;
}

export function useCrud<T extends Record<string, any>>({
  fetchData,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  emptyForm,
  transformPayload,
  successMessage = "Saved successfully!",
  errorMessage = "Failed to save.",
  idField = "_id"
}: CrudConfig<T>) {
  const [data, setData] = useState<T[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<T>(emptyForm);

  const loadData = async () => {
    const res = await fetchData();
    const sorted = Array.isArray(res) 
      ? [...res].sort((a, b) => ((a.order || 0) - (b.order || 0))) 
      : [];
    setData(sorted);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleDirectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = transformPayload ? transformPayload(formData) : { ...formData };
      let success = false;
      
      if (editingId) {
        success = await updateItem(editingId, payload);
      } else {
        if (!payload.order) {
          payload.order = data.length * 10;
        }
        success = await createItem(payload);
      }

      if (success !== false) {
        toast.success(successMessage);
        loadData();
        handleCancelEdit();
      } else {
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    const success = await deleteItem(id);
    if (success) {
      toast.success("Deleted successfully!");
      loadData();
    } else {
      toast.error("Failed to delete.");
    }
  };

  const handleEdit = (item: T) => {
    setEditingId(item[idField] as string);
    setFormData({ ...emptyForm, ...item });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData(emptyForm);
  };

  const handleDragEnd = async (event: any) => {
    if (!reorderItems) return;
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex((item) => item[idField] === active.id);
    const newIndex = data.findIndex((item) => item[idField] === over.id);

    const newArray = arrayMove(data, oldIndex, newIndex);
    const reordered = newArray.map((item, index) => ({
      ...item,
      order: (index + 1) * 10,
    }));

    setData(reordered);

    const itemsToUpdate = reordered.map((item) => ({
      id: item[idField] as string,
      order: item.order,
    }));

    const success = await reorderItems(itemsToUpdate);
    if (success) {
      toast.success("Order updated!");
    } else {
      toast.error("Failed to update order");
    }
  };

  const toggleVisibility = async (item: T) => {
    const updated = { ...item, isShow: !item.isShow };
    const success = await updateItem(item[idField] as string, updated);
    if (success) {
      toast.success(updated.isShow ? "Visible to public" : "Hidden from public");
      loadData();
    } else {
      toast.error("Failed to update visibility");
    }
  };

  return {
    data,
    showForm,
    setShowForm,
    editingId,
    formData,
    setFormData,
    handleChange,
    handleDirectChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    handleDragEnd,
    toggleVisibility,
  };
}
