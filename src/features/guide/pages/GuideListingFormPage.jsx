import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, Loader2, Pencil, Save, Send } from "lucide-react";
import Loader from "@/common/components/Loader";
import { useToast } from "@/hooks/useToast";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useGuideCategories } from "@/hooks/useGuideDirectory";
import { useMyGuideAdvertiser } from "@/hooks/useGuideAdvertiser";
import { useGuidePhotos, useMyGuideListing, useSaveGuideListing } from "@/hooks/useGuideListings";
import { buildListingPreview, firstErrors, listingToForm } from "@/hooks/guide.payloads";
import GuideListingDetail from "../components/GuideListingDetail";
import GuideListingForm from "../components/GuideListingForm";
import GuidePhotoManager from "../components/GuidePhotoManager";
import { GUIDE_PANEL_PATH } from "../components/GuidePublishCta";

/**
 * Alta (`/dashboard/guia/publicaciones/nueva`) y edición (`.../:id/editar`) de una publicación
 * de la Guía, con vista previa de la ficha antes de enviar.
 */
export default function GuideListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: advertiser, isLoading: loadingAdvertiser } = useMyGuideAdvertiser();
  const { data: categories = [] } = useGuideCategories();
  const { data: listing, isLoading: loadingListing } = useMyGuideListing(id);
  const { save, isSaving } = useSaveGuideListing(id);
  const photosApi = useGuidePhotos(id);

  const [form, setForm] = useState(() => listingToForm(null));
  const [pending, setPending] = useState([]); // [{ file, url }]
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  useDocumentMeta(id ? "Editar publicación — InfoCasa Guía" : "Nueva publicación — InfoCasa Guía");

  useEffect(() => {
    if (listing) setForm(listingToForm(listing));
  }, [listing]);

  // Libera las URLs de vista previa de las fotos nuevas al salir de la página.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const savedPhotos = listing?.photos ?? [];
  const previewListing = useMemo(
    () => buildListingPreview(form, { advertiser, categories, photos: [...savedPhotos, ...pending] }),
    [form, advertiser, categories, savedPhotos, pending]
  );

  if (loadingAdvertiser || (id && loadingListing)) return <Loader />;
  if (!advertiser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="font-bold text-slate-800">Primero creá tu perfil de anunciante.</p>
        <Link to={GUIDE_PANEL_PATH} className="inline-block mt-4 font-bold text-blue-600 hover:underline">Ir al panel de la Guía</Link>
      </div>
    );
  }

  const submit = async (asDraft) => {
    setErrors({});
    try {
      const { message } = await save({ form, newFiles: pending.map((p) => p.file), asDraft });
      setPending([]);
      toast.success(message || "Guardamos tu publicación.");
      navigate(`${GUIDE_PANEL_PATH}&guia=publicaciones`);
    } catch (err) {
      setErrors(firstErrors(err.errors));
      setPreview(false);
      toast.error(err.message || "Revisá los datos marcados.");
    }
  };

  const photoAction = async (fn) => {
    try {
      await fn();
    } catch (err) {
      toast.error(err.message || "No pudimos actualizar las fotos.");
    }
  };

  const photos = (
    <GuidePhotoManager
      saved={savedPhotos}
      pending={pending}
      busy={photosApi.isBusy}
      onAdd={(files) => setPending((p) => [...p, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))])}
      onRemovePending={(i) => setPending((p) => {
        URL.revokeObjectURL(p[i]?.url);
        return p.filter((_, idx) => idx !== i);
      })}
      onReorder={(ids) => photoAction(() => photosApi.reorder(ids))}
      onDelete={(photoId) => photoAction(() => photosApi.remove(photoId))}
    />
  );

  const isDraft = !listing || listing.status === "draft";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{id ? "Editar publicación" : "Nueva publicación"}</h1>
          <p className="text-sm text-slate-500">InfoCasa Guía · gratis</p>
        </div>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          {preview ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {preview ? "Seguir editando" : "Vista previa"}
        </button>
      </div>

      {listing?.status === "rejected" && listing.rejectionReason && (
        <p className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-semibold text-red-700">
          Motivo del rechazo: {listing.rejectionReason}. Corregilo y volvé a enviarla.
        </p>
      )}
      {listing && !isDraft && (
        <p className="text-xs text-amber-700">Al guardar cambios, la publicación vuelve a revisión antes de mostrarse.</p>
      )}

      {preview ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Así se va a ver tu ficha</p>
          <GuideListingDetail listing={previewListing} preview />
        </div>
      ) : (
        <GuideListingForm form={form} setForm={setForm} errors={errors} categories={categories} advertiser={advertiser} photos={photos} />
      )}

      <div className="sticky bottom-4 flex flex-col sm:flex-row justify-end gap-3 bg-white/90 backdrop-blur rounded-2xl border border-slate-100 p-4 shadow-lg">
        {isDraft && (
          <button type="button" disabled={isSaving} onClick={() => submit(true)} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <Save className="w-4 h-4" /> Guardar borrador
          </button>
        )}
        <button type="button" disabled={isSaving} onClick={() => submit(false)} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isDraft ? "Enviar publicación" : "Guardar y enviar a revisión"}
        </button>
      </div>
    </div>
  );
}
