
"use client";

import { useEffect, useState } from "react";
import { Building2, ImagePlus, X } from "lucide-react";

interface Props {
  value: File | null;
  onChange: (file: File | null) => void;
}

const MAX_SIZE = 2 * 1024 * 1024;

export function OrganizationLogoUpload({
  value,
  onChange,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleFile(file?: File) {
    if (!file) return;

    if (
      !["image/png", "image/jpeg", "image/webp"].includes(
        file.type
      )
    ) {
      setError("Only PNG, JPG, or WebP files are allowed.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Logo must be smaller than 2MB.");
      return;
    }

    setError("");
    onChange(file);
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-[#211C32]">
        Organization logo
        <span className="ml-1 font-normal text-[#9792A8]">
          (optional)
        </span>
      </label>

      <div className="flex items-center gap-4">
        <label className="flex min-h-[100px] flex-1 cursor-pointer items-center justify-center gap-4 rounded-xl border border-dashed border-[#D2C8E5] bg-[#FCFAFF] px-4 transition hover:border-[#9160EF] hover:bg-[#F8F2FF]">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <div className="rounded-xl bg-[#F2EAFF] p-3 text-[#9160EF]">
            <ImagePlus size={22} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#211C32]">
              Upload logo
            </p>
            <p className="mt-1 text-xs text-[#77718E]">
              PNG, JPG or WebP (max 2MB)
            </p>
          </div>
        </label>

        <div className="relative flex size-[100px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#DDCFFF] bg-[#F2EAFF]">
          {preview ? (
            // Blob URLs are generated locally from the selected file.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Organization logo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 size={35} className="text-[#9160EF]" />
          )}

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setError("");
              }}
              aria-label="Remove organization logo"
              className="absolute right-1 top-1 rounded-full bg-white p-1 text-slate-600 shadow"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
