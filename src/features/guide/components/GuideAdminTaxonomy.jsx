import React, { useState } from "react";
import { Plus } from "lucide-react";
import Loader from "@/common/components/Loader";
import { useToast } from "@/hooks/useToast";
import { useGuideAdminTaxonomy } from "@/hooks/useGuideAdmin";
import { inputClass } from "./GuideFields";

/** ABM de categorías y rubros de la Guía (admin): crear, renombrar, activar/desactivar. No se borran. */
export default function GuideAdminTaxonomy() {
  const toast = useToast();
  const { categories, isLoading, saveCategory, saveTrade, isSaving } = useGuideAdminTaxonomy();
  const [newCategory, setNewCategory] = useState("");

  const run = async (fn, ok) => {
    try {
      await fn();
      toast.success(ok);
      return true;
    } catch (err) {
      toast.error(err.message || "No pudimos guardar.");
      return false;
    }
  };

  const rename = (item, save) => {
    const name = window.prompt("Nuevo nombre:", item.name);
    if (name?.trim() && name.trim() !== item.name) run(() => save({ id: item.id, name: name.trim() }), "Nombre actualizado.");
  };

  if (isLoading) return <Loader inline className="py-12" />;

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (newCategory.trim() && (await run(() => saveCategory({ name: newCategory.trim() }), "Categoría creada."))) setNewCategory("");
        }}
        className="flex gap-2"
      >
        <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nueva categoría" className={inputClass} />
        <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50">
          <Plus className="w-4 h-4" /> Crear
        </button>
      </form>

      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} busy={isSaving} run={run} rename={rename} saveCategory={saveCategory} saveTrade={saveTrade} />
      ))}
    </div>
  );
}

function CategoryCard({ category, busy, run, rename, saveCategory, saveTrade }) {
  const [newTrade, setNewTrade] = useState("");
  const toggleClass = (active) => `text-xs font-bold ${active ? "text-red-600" : "text-emerald-700"} hover:underline`;

  return (
    <section className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 ${category.active ? "border-slate-100" : "border-dashed border-slate-300 opacity-70"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900">
          {category.name} <span className="text-xs font-semibold text-slate-400">· {category.listingsCount} publicaciones</span>
        </h3>
        <div className="flex gap-4">
          <button type="button" onClick={() => rename(category, saveCategory)} className="text-xs font-bold text-blue-600 hover:underline">Renombrar</button>
          <button type="button" disabled={busy} onClick={() => run(() => saveCategory({ id: category.id, active: !category.active }), category.active ? "Categoría desactivada." : "Categoría activada.")} className={toggleClass(category.active)}>
            {category.active ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-slate-100">
        {category.trades.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 py-2">
            <span className={`text-sm font-semibold ${t.active ? "text-slate-700" : "text-slate-400 line-through"}`}>
              {t.name} <span className="text-xs text-slate-400 no-underline">({t.listingsCount})</span>
            </span>
            <span className="flex gap-4">
              <button type="button" onClick={() => rename(t, saveTrade)} className="text-xs font-bold text-blue-600 hover:underline">Renombrar</button>
              <button type="button" disabled={busy} onClick={() => run(() => saveTrade({ id: t.id, active: !t.active }), t.active ? "Rubro desactivado." : "Rubro activado.")} className={toggleClass(t.active)}>
                {t.active ? "Desactivar" : "Activar"}
              </button>
            </span>
          </li>
        ))}
      </ul>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (newTrade.trim() && (await run(() => saveTrade({ name: newTrade.trim(), category_id: category.id }), "Rubro creado."))) setNewTrade("");
        }}
        className="flex gap-2"
      >
        <input value={newTrade} onChange={(e) => setNewTrade(e.target.value)} placeholder={`Nuevo rubro en ${category.name}`} className={inputClass} />
        <button type="submit" disabled={busy} className="px-4 rounded-xl border border-slate-200 text-sm font-bold disabled:opacity-50">Agregar</button>
      </form>
    </section>
  );
}
