"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { commentsApi, type ApiComment } from "@/lib/api/comments"
import { useAuth } from "@/lib/auth/context"

export const TASK_COMMENTS_QUERY_KEY = (taskId: string) =>
  ["task-comments", taskId] as const

export function useTaskComments(taskId: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: TASK_COMMENTS_QUERY_KEY(taskId ?? ""),
    queryFn: async () => (await commentsApi.listByTask(taskId!)).items,
    enabled: !authLoading && !!user && verified && !!taskId,
  })
}

// Khi comment thay đổi, list bình luận + commentCount trên task list/detail đều cần refresh.
function invalidateAfterCommentChange(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: string,
) {
  queryClient.invalidateQueries({ queryKey: TASK_COMMENTS_QUERY_KEY(taskId) })
  // Tasks list theo từng project: ["tasks", projectId] — partial match từ prefix.
  queryClient.invalidateQueries({ queryKey: ["tasks"] })
  // Task detail: ["task", taskId]
  queryClient.invalidateQueries({ queryKey: ["task", taskId] })
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => commentsApi.create(taskId, body),
    onSuccess: () => invalidateAfterCommentChange(queryClient, taskId),
  })
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      commentsApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_COMMENTS_QUERY_KEY(taskId) })
    },
  })
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => commentsApi.remove(id),
    onSuccess: () => invalidateAfterCommentChange(queryClient, taskId),
  })
}

export type { ApiComment as TaskComment } from "@/lib/api/comments"
