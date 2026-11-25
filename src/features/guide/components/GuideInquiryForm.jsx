import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { INQUIRY_TYPES } from "@/hooks/guide.mappers";
import { firstErrors } from "@/hooks/guide.payloads";
import { useSendGuideInquiry } from "@/hooks/useGuideDirectory";
import { Select, TextArea, TextInput } from "./GuideFields";

const emptyForm = (user, type) => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  phone: [user?.phone_area, user?.phone_number].filter(Boolean).join(" "),
  type,
  message: "",
});

/**
 * Consulta a una publicación de la Guía. "Pedir presupuesto" = mismo formulario con
 * `type=budget` (prop `defaultType`). Precarga los datos del usuario logueado.
 */
export default function GuideInquiryForm({ slug, user, defaultType = "info" }) {
  const [form, setForm] = useState(() => emptyForm(user, defaultType));
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState("");
  const { mutateAsync, isPending } = useSendGuideInquiry(slug);

  useEffect(() => {
    setForm((f) => ({ ...f, type: defaultType }));
  }, [defaultType]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const res = await mutateAsync({ ...form, phone: form.phone || null });
      setSent(res?.message || "Tu consulta se envió.");
      setForm(emptyForm(user, defaultType));
    } catch (err) {
      setErrors(err.errors ? firstErrors(err.errors) : { message: err.message || "No pudimos enviar la consulta." });
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        <p className="font-bold text-emerald-800">{sent}</p>
        <button type="button" onClick={() => setSent("")} className="text-sm font-bold text-emerald-700 hover:underline">
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" aria-label="Formulario de consulta">
      <Select label="Tipo de consulta" value={form.type} onChange={set("type")} options={INQUIRY_TYPES} error={errors.type} />
      <TextInput label="Nombre" required value={form.name} onChange={set("name")} error={errors.name} />
      <TextInput label="Email" type="email" required value={form.email} onChange={set("email")} error={errors.email} />
      <TextInput label="Teléfono" value={form.phone} onChange={set("phone")} error={errors.phone} />
      <TextArea
        label="Mensaje"
        required
        value={form.message}
        onChange={set("message")}
        error={errors.message}
        placeholder={form.type === "budget" ? "Contá qué trabajo necesitás, dónde y para cuándo." : "Escribí tu consulta."}
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 transition-all active:scale-95"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {form.type === "budget" ? "Pedir presupuesto" : "Enviar consulta"}
      </button>
    </form>
  );
}
