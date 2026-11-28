import React from "react";
import { ChevronDown, Download } from "lucide-react";
import {
  FORMAT_RULES,
  GUIDE_STEPS,
  OPTIONAL_COLUMNS,
  REQUIRED_COLUMNS,
  WHAT_HAPPENS,
} from "../csvImportGuide";

const Section = ({ title, children, defaultOpen = false }) => (
  <details open={defaultOpen} className="group rounded-xl border border-slate-200 bg-white">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-slate-800">
      {title}
      <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
    </summary>
    <div className="px-4 pb-4 text-sm text-slate-600">{children}</div>
  </details>
);

const ColumnTable = ({ columns }) => (
  <table className="w-full text-left text-xs">
    <tbody>
      {columns.map((col) => (
        <tr key={col.name} className="border-t border-slate-100 align-top">
          <td className="py-1.5 pr-3 font-mono font-semibold text-slate-800 break-words">{col.name}</td>
          <td className="py-1.5 text-slate-600">{col.hint}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const BulletList = ({ items }) => (
  <ul className="list-disc space-y-1 pl-5">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

/** Mini-guía para preparar el CSV: pasos, columnas, reglas y qué pasa al importar. */
export default function CsvImportGuide({ templateUrl }) {
  return (
    <div className="space-y-3">
      <ol className="grid gap-2 sm:grid-cols-2">
        {GUIDE_STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
              {i + 1}
            </span>
            <span className="text-sm">
              <span className="block font-bold text-slate-800">{step.title}</span>
              <span className="text-slate-500">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <a
        href={templateUrl}
        download
        className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-600 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors"
      >
        <Download className="w-4 h-4" /> Descargar plantilla
      </a>

      <Section title={`Columnas obligatorias (${REQUIRED_COLUMNS.length})`} defaultOpen>
        <ColumnTable columns={REQUIRED_COLUMNS} />
      </Section>
      <Section title="Columnas opcionales">
        <ColumnTable columns={OPTIONAL_COLUMNS} />
      </Section>
      <Section title="Reglas del archivo">
        <BulletList items={FORMAT_RULES} />
      </Section>
      <Section title="¿Qué pasa cuando importás?">
        <BulletList items={WHAT_HAPPENS} />
      </Section>
    </div>
  );
}
