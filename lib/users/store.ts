"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usersApi, type ApiUser, type UserUpdateInput } from "@/lib/api/users"
import { useAuth } from "@/lib/auth/context"

export const ME_QUERY_KEY = ["users", "me"] as const

export function useMe() {
  const { user, verified, loading } = useAuth()
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => usersApi.me(),
    enabled: !loading && !!user && verified,
  })
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

export type { ApiUser as User } from "@/lib/api/users"
