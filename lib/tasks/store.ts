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

export function useTasks(projectId: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: TASKS_QUERY_KEY(projectId ?? ""),
    queryFn: async () => (await tasksApi.listByProject(projectId!)).items,
    enabled: !authLoading && !!user && verified && !!projectId,
  })
}

function invalidateAffected(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY(projectId) })
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
    onSuccess: () => invalidateAffected(queryClient, projectId),
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => invalidateAffected(queryClient, projectId),
  })
}

export type { ApiTask as Task } from "@/lib/api/tasks"
