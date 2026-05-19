"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  projectsApi,
  type ApiProject,
  type ProjectCreateInput,
  type ProjectUpdateInput,
} from "@/lib/api/projects"
import { useAuth } from "@/lib/auth/context"

export const PROJECTS_QUERY_KEY = ["projects"] as const
export const PROJECT_QUERY_KEY = (id: string) => ["projects", id] as const

export function useProjects() {
  const { user, verified, loading: authLoading } = useAuth()
  const enabled = !authLoading && !!user && verified

  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => (await projectsApi.list()).items,
    enabled,
  })
}

export function useProject(id: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: PROJECT_QUERY_KEY(id ?? ""),
    queryFn: () => projectsApi.get(id!),
    enabled: !authLoading && !!user && verified && !!id,
    // Render ngay từ list cache nếu có — refetch nền nếu stale.
    placeholderData: () => {
      if (!id) return undefined
      const list = queryClient.getQueryData<ApiProject[]>(PROJECTS_QUERY_KEY)
      return list?.find((p) => p.id === id)
    },
    staleTime: 5 * 60_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectCreateInput) => projectsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ProjectUpdateInput }) =>
      projectsApi.update(id, patch),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
      queryClient.setQueryData(PROJECT_QUERY_KEY(data.id), data)
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
      queryClient.removeQueries({ queryKey: PROJECT_QUERY_KEY(id) })
    },
  })
}

export type { ApiProject as Project } from "@/lib/api/projects"
