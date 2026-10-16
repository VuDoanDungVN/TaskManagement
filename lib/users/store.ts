"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  usersApi,
  type AdminUserUpdateInput,
  type ApiUser,
  type UserCreateInput,
  type UserUpdateInput,
} from "@/lib/api/users"
import { useAuth } from "@/lib/auth/context"

export const ME_QUERY_KEY = ["users", "me"] as const
export const USERS_INFINITE_QUERY_KEY = (pageSize: number, search: string) =>
  ["users", "infinite", pageSize, search] as const
export const USER_TEAMS_QUERY_KEY = (id: string) => ["users", id, "teams"] as const
export const USER_PROJECTS_QUERY_KEY = (id: string) => ["users", id, "projects"] as const

export function useMe() {
  const { user, verified, loading } = useAuth()
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => usersApi.me(),
    enabled: !loading && !!user && verified,
  })
}

/** True nếu user đang đăng nhập là admin hệ thống (suy ra từ /users/me, không gọi thừa). */
export function useIsAdmin(): boolean {
  const { data } = useMe()
  return data?.role === "admin"
}

/** Vai trò hiện tại + trạng thái tải — dùng khi cần phân biệt "chưa biết" với "không phải admin". */
export function useRole() {
  const { data, isLoading, error } = useMe()
  return { isAdmin: data?.role === "admin", isLoading: isLoading || (!data && !error), error }
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: UserUpdateInput) => usersApi.updateMe(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(ME_QUERY_KEY, data)
    },
  })
}

/**
 * Danh sách TẤT CẢ user với cuộn vô hạn (keyset pagination) + tìm kiếm.
 * - `search` đã được debounce ở component để tránh gọi API thừa.
 * - keepPreviousData: giữ dữ liệu trang trước khi đổi từ khóa/tải trang → UI không nhấp nháy.
 */
export function useInfiniteUsers(pageSize = 20, search = "") {
  const { user, verified, loading: authLoading } = useAuth()
  const enabled = !authLoading && !!user && verified

  return useInfiniteQuery({
    queryKey: USERS_INFINITE_QUERY_KEY(pageSize, search),
    queryFn: ({ pageParam }) =>
      usersApi.list({ limit: pageSize, cursor: pageParam ?? undefined, search: search || undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

/**
 * Nhóm mà 1 user thuộc về — chỉ fetch khi dialog mở (`enabled`) để tránh query thừa.
 */
export function useUserTeams(id: string | null | undefined, enabled = true) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: USER_TEAMS_QUERY_KEY(id ?? ""),
    queryFn: async () => (await usersApi.teams(id!)).items,
    enabled: !authLoading && !!user && verified && !!id && enabled,
    staleTime: 30_000,
  })
}

/** Admin: cập nhật user (tên + vai trò). Invalidate danh sách để đồng bộ. */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AdminUserUpdateInput }) =>
      usersApi.update(id, patch),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "infinite"] })
      // Nếu admin tự sửa mình → cập nhật cache /me
      const me = queryClient.getQueryData<ApiUser>(ME_QUERY_KEY)
      if (me && me.id === data.id) queryClient.setQueryData(ME_QUERY_KEY, data)
    },
  })
}

/** Admin: tạo tài khoản (Firebase + D1) và gán dự án ban đầu. */
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserCreateInput) => usersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "infinite"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

/** Admin: sinh lại link đặt mật khẩu + gửi email. */
export function useResendSetupLink() {
  return useMutation({ mutationFn: (id: string) => usersApi.resendSetupLink(id) })
}

/** Dự án user được gán — chỉ fetch khi dialog mở. */
export function useUserProjects(id: string | null | undefined, enabled = true) {
  const { user, verified, loading: authLoading } = useAuth()
  return useQuery({
    queryKey: USER_PROJECTS_QUERY_KEY(id ?? ""),
    queryFn: async () => (await usersApi.projects(id!)).items,
    enabled: !authLoading && !!user && verified && !!id && enabled,
  })
}

/** Admin: đặt lại toàn bộ danh sách dự án của user. */
export function useSetUserProjects() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, projectIds }: { id: string; projectIds: string[] }) =>
      usersApi.setProjects(id, projectIds),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: USER_PROJECTS_QUERY_KEY(vars.id) })
      queryClient.invalidateQueries({ queryKey: ["users", "infinite"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

/** Admin: thêm user vào nhóm. */
export function useAddUserToTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      teamId,
      role,
    }: {
      id: string
      teamId: string
      role?: "admin" | "member"
    }) => usersApi.addToTeam(id, { teamId, role }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY(vars.id) })
      queryClient.invalidateQueries({ queryKey: ["users", "infinite"] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
  })
}

/** Admin: gỡ user khỏi nhóm. */
export function useRemoveUserFromTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, teamId }: { id: string; teamId: string }) =>
      usersApi.removeFromTeam(id, teamId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: USER_TEAMS_QUERY_KEY(vars.id) })
      queryClient.invalidateQueries({ queryKey: ["users", "infinite"] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
  })
}

export type { ApiUser as User } from "@/lib/api/users"
