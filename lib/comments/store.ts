"use client"

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { commentsApi, type ApiComment } from "@/lib/api/comments"
import type { ApiTask } from "@/lib/api/tasks"
import type { ApiUser } from "@/lib/api/users"
import { useAuth } from "@/lib/auth/context"
import { ME_QUERY_KEY } from "@/lib/users/store"
import { TASK_QUERY_KEY, TASKS_QUERY_KEY } from "@/lib/tasks/store"

export const TASK_COMMENTS_QUERY_KEY = (taskId: string) =>
  ["task-comments", taskId] as const

export function useTaskComments(taskId: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: TASK_COMMENTS_QUERY_KEY(taskId ?? ""),
    queryFn: async () => (await commentsApi.listByTask(taskId!)).items,
    enabled: !authLoading && !!user && verified && !!taskId,
    // Comment cập nhật bằng optimistic + setQueryData → ít cần refetch nền.
    staleTime: 5 * 60_000,
  })
}

/**
 * Cập nhật commentCount của 1 task trong **cả** cache detail (["task", id]) và
 * trong list (["tasks", projectId]) chỉ bằng setQueryData — không refetch.
 */
function bumpCommentCount(
  queryClient: QueryClient,
  taskId: string,
  delta: number,
) {
  if (delta === 0) return
  const task = queryClient.getQueryData<ApiTask>(TASK_QUERY_KEY(taskId))
  if (task) {
    const updated: ApiTask = {
      ...task,
      commentCount: Math.max(0, task.commentCount + delta),
    }
    queryClient.setQueryData(TASK_QUERY_KEY(taskId), updated)
    queryClient.setQueryData<ApiTask[]>(
      TASKS_QUERY_KEY(task.projectId),
      (list) =>
        list?.map((t) =>
          t.id === taskId
            ? { ...t, commentCount: Math.max(0, t.commentCount + delta) }
            : t,
        ),
    )
    return
  }
  // Fallback: chưa có task detail trong cache — scan mọi list ["tasks", *]
  const lists = queryClient.getQueriesData<ApiTask[]>({ queryKey: ["tasks"] })
  for (const [key, list] of lists) {
    if (!list) continue
    if (!list.some((t) => t.id === taskId)) continue
    queryClient.setQueryData<ApiTask[]>(
      key,
      list.map((t) =>
        t.id === taskId
          ? { ...t, commentCount: Math.max(0, t.commentCount + delta) }
          : t,
      ),
    )
  }
}

/**
 * Tạo entry optimistic cho 1 comment mới — chỉ chạy khi không có file đính kèm
 * (file cần upload → để server trả về rồi mới gắn vào cache).
 */
function buildOptimisticComment(
  queryClient: QueryClient,
  taskId: string,
  body: string,
  parentId: string | null,
  tempId: string,
): ApiComment | null {
  const me = queryClient.getQueryData<ApiUser>(ME_QUERY_KEY)
  if (!me) return null

  const list = queryClient.getQueryData<ApiComment[]>(TASK_COMMENTS_QUERY_KEY(taskId))
  let flattenedParentId: string | null = null
  let replyTo: ApiComment["replyTo"] = null
  if (parentId && list) {
    const target = list.find((c) => c.id === parentId)
    if (target) {
      // Server sẽ flatten về root, client làm cùng cho khớp.
      flattenedParentId = target.parentId ?? target.id
      replyTo = {
        id: target.id,
        authorId: target.author.id,
        authorDisplayName: target.author.displayName,
        authorEmail: target.author.email,
      }
    } else {
      flattenedParentId = parentId
    }
  }

  const now = Date.now()
  return {
    id: tempId,
    taskId,
    body,
    parentId: flattenedParentId,
    replyTo,
    attachments: [],
    createdAt: now,
    updatedAt: now,
    author: {
      id: me.id,
      email: me.email,
      displayName: me.displayName,
      avatarUrl: me.avatarUrl,
    },
  }
}

interface CreateCommentVars {
  body: string
  parentId?: string | null
  files?: File[]
}

interface CreateContext {
  prev: ApiComment[] | undefined
  tempId: string | null
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation<ApiComment, Error, CreateCommentVars, CreateContext>({
    mutationFn: ({ body, parentId, files }) =>
      commentsApi.create(taskId, {
        body,
        parentId: parentId ?? null,
        files,
      }),
    onMutate: async ({ body, parentId, files }) => {
      // Có file → bỏ optimistic, đợi server trả về (preview ảnh blob phức tạp).
      if (files && files.length > 0) {
        return { prev: undefined, tempId: null }
      }
      await queryClient.cancelQueries({ queryKey: TASK_COMMENTS_QUERY_KEY(taskId) })
      const prev = queryClient.getQueryData<ApiComment[]>(TASK_COMMENTS_QUERY_KEY(taskId))
      const tempId = `__optimistic_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const optimistic = buildOptimisticComment(
        queryClient,
        taskId,
        body,
        parentId ?? null,
        tempId,
      )
      if (!optimistic) return { prev, tempId: null }
      queryClient.setQueryData<ApiComment[]>(
        TASK_COMMENTS_QUERY_KEY(taskId),
        (old) => [...(old ?? []), optimistic],
      )
      return { prev, tempId }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(TASK_COMMENTS_QUERY_KEY(taskId), ctx.prev)
      }
    },
    onSuccess: (real, _vars, ctx) => {
      // Thay temp bằng comment thật từ server. Nếu không có temp (case có file),
      // append real vào list.
      queryClient.setQueryData<ApiComment[]>(
        TASK_COMMENTS_QUERY_KEY(taskId),
        (old) => {
          if (!old) return [real]
          if (ctx?.tempId && old.some((c) => c.id === ctx.tempId)) {
            return old.map((c) => (c.id === ctx.tempId ? real : c))
          }
          // Phòng trường hợp đã có id trùng (refetch race)
          if (old.some((c) => c.id === real.id)) return old
          return [...old, real]
        },
      )
      bumpCommentCount(queryClient, taskId, +1)
    },
  })
}

interface UpdateCommentVars {
  id: string
  body: string
}

interface UpdateContext {
  prev: ApiComment[] | undefined
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation<ApiComment, Error, UpdateCommentVars, UpdateContext>({
    mutationFn: ({ id, body }) => commentsApi.update(id, body),
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: TASK_COMMENTS_QUERY_KEY(taskId) })
      const prev = queryClient.getQueryData<ApiComment[]>(TASK_COMMENTS_QUERY_KEY(taskId))
      const now = Date.now()
      queryClient.setQueryData<ApiComment[]>(
        TASK_COMMENTS_QUERY_KEY(taskId),
        (old) => old?.map((c) => (c.id === id ? { ...c, body, updatedAt: now } : c)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(TASK_COMMENTS_QUERY_KEY(taskId), ctx.prev)
      }
    },
    onSuccess: (real) => {
      queryClient.setQueryData<ApiComment[]>(
        TASK_COMMENTS_QUERY_KEY(taskId),
        (old) => old?.map((c) => (c.id === real.id ? real : c)),
      )
    },
  })
}

interface DeleteContext {
  prev: ApiComment[] | undefined
  removedCount: number
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation<{ ok: true }, Error, string, DeleteContext>({
    mutationFn: (id) => commentsApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASK_COMMENTS_QUERY_KEY(taskId) })
      const prev = queryClient.getQueryData<ApiComment[]>(TASK_COMMENTS_QUERY_KEY(taskId))
      let removedCount = 0
      const next = prev?.filter((c) => {
        // Xoá comment đích + mọi reply có parentId === id (server cascade)
        if (c.id === id || c.parentId === id) {
          removedCount += 1
          return false
        }
        return true
      })
      if (next) {
        queryClient.setQueryData(TASK_COMMENTS_QUERY_KEY(taskId), next)
      }
      return { prev, removedCount }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(TASK_COMMENTS_QUERY_KEY(taskId), ctx.prev)
      }
    },
    onSuccess: (_data, _id, ctx) => {
      bumpCommentCount(queryClient, taskId, -(ctx?.removedCount ?? 0))
    },
  })
}

export type { ApiComment as TaskComment } from "@/lib/api/comments"
