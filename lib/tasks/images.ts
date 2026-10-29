import type { QueryClient } from "@tanstack/react-query"
import {
  tasksApi,
  TASK_IMAGE_MAX_BYTES,
  TASK_IMAGE_MIME,
  type ApiTaskImage,
} from "@/lib/api/tasks"
import { ALL_TASKS_QUERY_KEY, TASK_IMAGES_QUERY_KEY, TASK_QUERY_KEY, TASKS_QUERY_KEY } from "./store"

/**
 * Ảnh trong form tạo/sửa task. `key` ổn định cho kéo-thả + theo dõi tiến trình:
 * ảnh đã lưu dùng id server, ảnh mới dùng id tạm sinh ở client.
 */
export type TaskImageItem =
  | { kind: "existing"; key: string; id: string; url: string }
  | { kind: "new"; key: string; file: File; previewUrl: string }

/** Thứ tự cuối cùng người dùng muốn + ảnh đã lưu bị bỏ ra. */
export interface TaskImagePlan {
  items: TaskImageItem[]
  removedIds: string[]
}

export type ImageProgressFn = (key: string, fraction: number) => void

export function existingToItems(images: ApiTaskImage[]): TaskImageItem[] {
  return images.map((img) => ({ kind: "existing", key: img.id, id: img.id, url: img.url }))
}

/** Lỗi kiểm tra phía client (khớp giới hạn của Worker) — null nếu hợp lệ. */
export function validateImageFile(file: File): "badType" | "tooLarge" | null {
  if (!TASK_IMAGE_MIME.includes(file.type)) return "badType"
  if (file.size > TASK_IMAGE_MAX_BYTES) return "tooLarge"
  return null
}

/**
 * Đồng bộ ảnh của task theo plan: xoá ảnh bị bỏ → upload ảnh mới (tuần tự, có tiến trình)
 * → lưu thứ tự. Ảnh upload lỗi không chặn các ảnh khác; trả về key của các ảnh lỗi.
 */
export async function syncTaskImages(
  taskId: string,
  plan: TaskImagePlan,
  onProgress?: ImageProgressFn,
): Promise<{ failedKeys: string[] }> {
  const failedKeys: string[] = []

  for (const id of plan.removedIds) {
    await tasksApi.deleteImage(taskId, id).catch(() => {
      // Ảnh có thể đã bị người khác xoá — bỏ qua
    })
  }

  const finalIds: string[] = []
  for (const item of plan.items) {
    if (item.kind === "existing") {
      finalIds.push(item.id)
      continue
    }
    try {
      const res = await tasksApi.uploadImage(taskId, item.file, (f) => onProgress?.(item.key, f))
      const created = res.items[0]
      if (created) finalIds.push(created.id)
    } catch {
      failedKeys.push(item.key)
    }
  }

  if (finalIds.length > 0) {
    // Server yêu cầu đúng toàn bộ ảnh hiện có → lấy danh sách thật rồi ghép thứ tự
    // (phòng trường hợp người khác vừa thêm ảnh: ảnh lạ được đẩy xuống cuối).
    const current = (await tasksApi.images(taskId)).items.map((i) => i.id)
    const ordered = [
      ...finalIds.filter((id) => current.includes(id)),
      ...current.filter((id) => !finalIds.includes(id)),
    ]
    const changed = ordered.some((id, i) => id !== current[i])
    if (changed) await tasksApi.reorderImages(taskId, ordered)
  }

  return { failedKeys }
}

/**
 * Gọi SAU khi task đã lưu: không bao giờ throw. Nếu đồng bộ lỗi bất ngờ (mạng, xoá/sắp
 * xếp thất bại) thì coi mọi ảnh mới là lỗi → dialog báo lỗi thay vì cho bấm Lưu lại
 * (bấm lại ở chế độ tạo mới sẽ sinh task trùng).
 */
export async function saveTaskImages(
  taskId: string,
  plan: TaskImagePlan,
  onProgress?: ImageProgressFn,
): Promise<{ failedKeys: string[] }> {
  try {
    return await syncTaskImages(taskId, plan, onProgress)
  } catch (e) {
    console.error("Đồng bộ ảnh task thất bại:", e)
    return { failedKeys: plan.items.filter((i) => i.kind === "new").map((i) => i.key) }
  }
}

/** Làm mới cache liên quan sau khi đổi ảnh (danh sách task, chi tiết, ảnh, Dashboard). */
export function invalidateTaskImageQueries(
  queryClient: QueryClient,
  taskId: string,
  projectId: string,
) {
  queryClient.invalidateQueries({ queryKey: TASK_IMAGES_QUERY_KEY(taskId) })
  queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY(taskId) })
  queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY(projectId) })
  queryClient.invalidateQueries({ queryKey: ALL_TASKS_QUERY_KEY })
}
