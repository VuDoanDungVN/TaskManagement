"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AlertCircle, GripVertical, ImagePlus, Star, X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { TASK_IMAGE_LIMIT, TASK_IMAGE_MIME } from "@/lib/api/tasks"
import { validateImageFile, type TaskImageItem } from "@/lib/tasks/images"

interface TaskImagesFieldProps {
  items: TaskImageItem[]
  onChange: (items: TaskImageItem[]) => void
  /** Ảnh đã lưu bị người dùng bỏ (để xoá trên server khi Lưu). */
  onRemoveExisting: (id: string) => void
  /** Tiến trình upload theo key (0–1); có giá trị = đang/đã upload. */
  progress?: Record<string, number>
  /** Key các ảnh upload thất bại. */
  failedKeys?: string[]
  disabled?: boolean
}

let tempSeq = 0
const newKey = () => `new-${Date.now()}-${++tempSeq}`

/**
 * Chọn nhiều ảnh + kéo-thả sắp xếp. Ảnh đầu tiên là ảnh đại diện.
 * Desktop: kéo bằng chuột. Mobile: giữ 0,3s rồi kéo (tránh nhầm với cuộn trang),
 * hoặc bấm ☆ trên ảnh để đặt làm đại diện.
 */
export default function TaskImagesField({
  items,
  onChange,
  onRemoveExisting,
  progress = {},
  failedKeys = [],
  disabled = false,
}: TaskImagesFieldProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Giải phóng object URL xem trước khi ảnh mới bị bỏ / component unmount
  const previews = useRef(new Set<string>())
  useEffect(() => {
    const live = new Set(items.filter((i) => i.kind === "new").map((i) => (i as { previewUrl: string }).previewUrl))
    for (const url of previews.current) {
      if (!live.has(url)) URL.revokeObjectURL(url)
    }
    previews.current = live
  }, [items])
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), [])

  const remaining = TASK_IMAGE_LIMIT - items.length

  function addFiles(list: FileList | File[]) {
    const files = Array.from(list)
    const errs: string[] = []
    const accepted: TaskImageItem[] = []
    for (const f of files) {
      const problem = validateImageFile(f)
      if (problem === "badType") errs.push(t("taskImages.badType", { name: f.name }))
      else if (problem === "tooLarge") errs.push(t("taskImages.tooLarge", { name: f.name }))
      else accepted.push({ kind: "new", key: newKey(), file: f, previewUrl: URL.createObjectURL(f) })
    }
    if (accepted.length > remaining) {
      errs.push(t("taskImages.tooMany", { count: Math.max(remaining, 0) }))
      accepted.splice(remaining).forEach((i) => i.kind === "new" && URL.revokeObjectURL(i.previewUrl))
    }
    setErrors(errs)
    if (accepted.length) onChange([...items, ...accepted])
  }

  function remove(item: TaskImageItem) {
    if (item.kind === "existing") onRemoveExisting(item.id)
    onChange(items.filter((i) => i.key !== item.key))
  }

  function makeCover(key: string) {
    const idx = items.findIndex((i) => i.key === key)
    if (idx > 0) onChange(arrayMove(items, idx, 0))
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.key === active.id)
    const to = items.findIndex((i) => i.key === over.id)
    if (from >= 0 && to >= 0) onChange(arrayMove(items, from, to))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {t("taskImages.label")}{" "}
          <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
            ({items.length}/{TASK_IMAGE_LIMIT})
          </span>
        </label>
        {items.length > 1 && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 text-right">{t("taskImages.hint")}</span>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.key)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {items.map((item, index) => (
              <SortableTile
                key={item.key}
                item={item}
                isCover={index === 0}
                progress={progress[item.key]}
                failed={failedKeys.includes(item.key)}
                disabled={disabled}
                onRemove={() => remove(item)}
                onMakeCover={() => makeCover(item.key)}
              />
            ))}

            {remaining > 0 && !disabled && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
                }}
                className={cn(
                  "aspect-square rounded-lg border-2 border-dashed",
                  "flex flex-col items-center justify-center gap-1 text-center px-1",
                  "text-zinc-500 dark:text-zinc-400 transition-colors",
                  dragOver
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                )}
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[11px] font-medium">{t("taskImages.add")}</span>
                <span className="text-[10px] hidden sm:block">{t("taskImages.addHint")}</span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={TASK_IMAGE_MIME.join(",")}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files)
          e.target.value = "" // cho phép chọn lại cùng file
        }}
      />

      {remaining <= 0 && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t("taskImages.limitReached", { count: TASK_IMAGE_LIMIT })}
        </p>
      )}
      {errors.map((err) => (
        <p key={err} className="text-[11px] text-red-600 dark:text-red-400 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 mt-px shrink-0" />
          {err}
        </p>
      ))}
    </div>
  )
}

function SortableTile({
  item,
  isCover,
  progress,
  failed,
  disabled,
  onRemove,
  onMakeCover,
}: {
  item: TaskImageItem
  isCover: boolean
  progress?: number
  failed: boolean
  disabled: boolean
  onRemove: () => void
  onMakeCover: () => void
}) {
  const { t } = useI18n()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled,
  })
  const src = item.kind === "existing" ? item.url : item.previewUrl
  const uploading = progress !== undefined && progress < 1 && !failed

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "group/tile relative aspect-square rounded-lg overflow-hidden touch-manipulation",
        "border bg-zinc-100 dark:bg-zinc-800",
        isCover ? "border-amber-400 ring-1 ring-amber-400" : "border-zinc-200 dark:border-zinc-700",
        failed && "border-red-500 ring-1 ring-red-500",
        isDragging ? "z-20 shadow-xl opacity-90 cursor-grabbing" : !disabled && "cursor-grab",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="w-full h-full object-cover select-none pointer-events-none" />

      {isCover ? (
        <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-400 text-[10px] font-semibold text-zinc-900">
          <Star className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">{t("taskImages.cover")}</span>
        </span>
      ) : (
        !disabled && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onMakeCover}
            title={t("taskImages.setCover")}
            aria-label={t("taskImages.setCover")}
            className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
        )
      )}

      {!disabled && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          title={t("taskImages.remove")}
          aria-label={t("taskImages.remove")}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {!disabled && (
        <span className="absolute bottom-1 left-1 hidden sm:flex w-5 h-5 rounded bg-black/40 text-white items-center justify-center opacity-0 group-hover/tile:opacity-100 transition-opacity">
          <GripVertical className="w-3.5 h-3.5" />
        </span>
      )}

      {uploading && (
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
          <div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  )
}
