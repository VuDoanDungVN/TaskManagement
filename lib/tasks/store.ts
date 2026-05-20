"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  tasksApi,
  type ApiTask,
  type TaskCreateInput,
  type TaskUpdateInput,
} from "@/lib/api/tasks"
import { useAuth } from "@/lib/auth/context"
import { PROJECTS_QUERY_KEY } from "@/lib/projects/store"

export const TASKS_QUERY_KEY = (projectId: string) => ["tasks", projectId] as const
export const TASK_QUERY_KEY = (id: string) => ["task", id] as const
export const ALL_TASKS_QUERY_KEY = ["tasks", "all"] as const

export function useTasks(projectId: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: TASKS_QUERY_KEY(projectId ?? ""),
    queryFn: async () => (await tasksApi.listByProject(projectId!)).items,
    enabled: !authLoading && !!user && verified && !!projectId,
  })
}

/** Lấy toàn bộ task của user (cho Dashboard) — staleTime 60s, cache 10 phút mặc định. */
export function useAllTasks() {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: ALL_TASKS_QUERY_KEY,
    queryFn: async () => (await tasksApi.listAll()).items,
    enabled: !authLoading && !!user && verified,
    staleTime: 60_000,
  })
}

export function useTask(id: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: TASK_QUERY_KEY(id ?? ""),
    queryFn: () => tasksApi.get(id!),
    enabled: !authLoading && !!user && verified && !!id,
    // Khi click task từ trang list, task đã có trong cache ["tasks", projectId].
    // Scan mọi list đang cache để render ngay, tránh loading spinner.
    placeholderData: () => {
      if (!id) return undefined
      const lists = queryClient.getQueriesData<ApiTask[]>({ queryKey: ["tasks"] })
      for (const [, list] of lists) {
        const t = list?.find((x) => x.id === id)
        if (t) return t
      }
      return undefined
    },
    staleTime: 5 * 60_000,
  })
}

function invalidateAffected(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY(projectId) })
  queryClient.invalidateQueries({ queryKey: ALL_TASKS_QUERY_KEY }) // Dashboard
  queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY }) // stats changed
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskCreateInput) => tasksApi.create(input),
    onSuccess: (task) => invalidateAffected(queryClient, task.projectId),
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TaskUpdateInput }) =>
      tasksApi.update(id, patch),
    onSuccess: (data) => {
      invalidateAffected(queryClient, projectId)
      queryClient.setQueryData(TASK_QUERY_KEY(data.id), data)
    },
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: (_data, id) => {
      invalidateAffected(queryClient, projectId)
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEY(id) })
    },
  })
}

export type { ApiTask as Task } from "@/lib/api/tasks"
