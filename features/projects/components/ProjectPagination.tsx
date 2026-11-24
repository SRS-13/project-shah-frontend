"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ProjectListResponse } from "../projectApi";

interface Props {
  meta: ProjectListResponse["meta"];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

export function ProjectPagination({
  meta,
  onPageChange,
  onLimitChange,
  disabled,
}: Props) {
  const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } = meta;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;

  const end = Math.min(page * limit, total);

  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#EAE5F1] bg-white px-4 py-3">
      <p className="text-sm text-[#827B94]">
        Showing{" "}
        <span className="font-medium text-[#17152B]">
          {start}–{end}
        </span>{" "}
        of {total} projects
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Projects per page"
          value={limit}
          disabled={disabled}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-9 rounded-lg border border-[#DED9E8] bg-white px-2 text-xs text-[#69647C]"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={disabled || !hasPreviousPage}
            onClick={() => onPageChange(page - 1)}
            className="size-9 rounded-lg"
          >
            <ChevronLeft size={17} />
          </Button>

          {pages.map((value, index) => (
            <div key={value} className="flex items-center gap-1">
              {index > 0 && value - pages[index - 1] > 1 && (
                <span className="px-1 text-[#827B94]">...</span>
              )}

              <button
                type="button"
                disabled={disabled}
                aria-current={page === value ? "page" : undefined}
                onClick={() => onPageChange(value)}
                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium ${
                  page === value
                    ? "bg-[#9160EF] text-white"
                    : "text-[#77718E] hover:bg-[#F0E7FF]"
                }`}
              >
                {value}
              </button>
            </div>
          ))}

          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={disabled || !hasNextPage}
            onClick={() => onPageChange(page + 1)}
            className="size-9 rounded-lg"
          >
            <ChevronRight size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}
