import { api } from "./client"

interface UploadAvatarResult {
  avatarKey: string
  avatarUrl: string
}

interface UploadThumbnailResult {
  thumbnailKey: string
  thumbnailUrl: string
}

function buildFormData(file: File): FormData {
  const fd = new FormData()
  fd.append("file", file)
  return fd
}

export const uploadsApi = {
  avatar: (file: File) => api.upload<UploadAvatarResult>("/uploads/avatar", buildFormData(file)),

  projectThumbnail: (projectId: string, file: File) =>
    api.upload<UploadThumbnailResult>(
      `/uploads/projects/${encodeURIComponent(projectId)}/thumbnail`,
      buildFormData(file),
    ),

  taskThumbnail: (taskId: string, file: File) =>
    api.upload<UploadThumbnailResult>(
      `/uploads/tasks/${encodeURIComponent(taskId)}/thumbnail`,
      buildFormData(file),
    ),
}
