"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  teamsApi,
  type ApiTeam,
  type InviteCreateInput,
  type InviteRole,
  type TeamCreateInput,
  type TeamUpdateInput,
} from "@/lib/api/teams"
import { useAuth } from "@/lib/auth/context"

export const TEAMS_QUERY_KEY = ["teams"] as const
export const TEAMS_INFINITE_QUERY_KEY = (pageSize: number) =>
  ["teams", "infinite", pageSize] as const
export const TEAM_QUERY_KEY = (id: string) => ["teams", id] as const
export const TEAM_MEMBERS_QUERY_KEY = (id: string) => ["teams", id, "members"] as const
export const TEAM_INVITES_QUERY_KEY = (id: string) => ["teams", id, "invites"] as const
export const TEAM_PROJECTS_QUERY_KEY = (id: string) => ["teams", id, "projects"] as const

export function useTeams() {
  const { user, verified, loading: authLoading } = useAuth()
  const enabled = !authLoading && !!user && verified

  return useQuery({
    queryKey: TEAMS_QUERY_KEY,
    queryFn: async () => (await teamsApi.list()).items,
    enabled,
  })
}

/**
 * Danh sách nhóm với cuộn vô hạn (keyset pagination).
 * Mỗi trang tải `pageSize` nhóm; chỉ fetch trang sau khi cần → tối ưu hiệu suất.
 */
export function useInfiniteTeams(pageSize = 20) {
  const { user, verified, loading: authLoading } = useAuth()
  const enabled = !authLoading && !!user && verified

  return useInfiniteQuery({
    queryKey: TEAMS_INFINITE_QUERY_KEY(pageSize),
    queryFn: ({ pageParam }) =>
      teamsApi.list({ limit: pageSize, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  })
}

/**
 * Admin: danh sách tất cả nhóm cho dialog "thêm vào nhóm".
 * Chỉ fetch khi dialog mở (`enabled`) và có debounce search ở component → không gọi thừa.
 */
export const ALL_TEAMS_QUERY_KEY = (search: string) =>
  ["teams", "all", search] as const

export function useAllTeams(search = "", enabled = true) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: ALL_TEAMS_QUERY_KEY(search),
    queryFn: async () => (await teamsApi.allList(search || undefined)).items,
    enabled: !authLoading && !!user && verified && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useTeam(id: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: TEAM_QUERY_KEY(id ?? ""),
    queryFn: () => teamsApi.get(id!),
    enabled: !authLoading && !!user && verified && !!id,
    placeholderData: () => {
      if (!id) return undefined
      const list = queryClient.getQueryData<ApiTeam[]>(TEAMS_QUERY_KEY)
      return list?.find((t) => t.id === id)
    },
    staleTime: 5 * 60_000,
  })
}

export function useTeamMembers(id: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: TEAM_MEMBERS_QUERY_KEY(id ?? ""),
    queryFn: async () => (await teamsApi.members(id!)).items,
    enabled: !authLoading && !!user && verified && !!id,
  })
}

export function useTeamInvites(id: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: TEAM_INVITES_QUERY_KEY(id ?? ""),
    queryFn: async () => (await teamsApi.invites(id!)).items,
    enabled: !authLoading && !!user && verified && !!id,
  })
}

export function useTeamProjects(id: string | null | undefined) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: TEAM_PROJECTS_QUERY_KEY(id ?? ""),
    queryFn: async () => (await teamsApi.projects(id!)).items,
    enabled: !authLoading && !!user && verified && !!id,
  })
}

export function useAssignProject(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => teamsApi.assignProject(teamId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_PROJECTS_QUERY_KEY(teamId) })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

export function useUnassignProject(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => teamsApi.unassignProject(teamId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_PROJECTS_QUERY_KEY(teamId) })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TeamCreateInput) => teamsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TeamUpdateInput }) =>
      teamsApi.update(id, patch),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
      queryClient.setQueryData(TEAM_QUERY_KEY(data.id), data)
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teamsApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
      queryClient.removeQueries({ queryKey: TEAM_QUERY_KEY(id) })
    },
  })
}

export function useInviteMembers(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteCreateInput) => teamsApi.invite(teamId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_INVITES_QUERY_KEY(teamId) })
    },
  })
}

export function useCancelInvite(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => teamsApi.cancelInvite(teamId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_INVITES_QUERY_KEY(teamId) })
    },
  })
}

export function useSetMemberRole(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: InviteRole }) =>
      teamsApi.setMemberRole(teamId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_MEMBERS_QUERY_KEY(teamId) })
    },
  })
}

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => teamsApi.removeMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_MEMBERS_QUERY_KEY(teamId) })
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
    },
  })
}

export type { ApiTeam as Team } from "@/lib/api/teams"
