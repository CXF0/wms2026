import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/types/business'

const LEVEL: Record<UserRole, number> = {
  base_staff: 1, base_leader: 1, driver: 1,
  inspector: 2, picker: 2, packer: 2, logistics: 2,
  inspector_patrol: 2, supply_mgr: 2,
  zone_sup: 3,
  region_mgr: 4,
  admin: 5,
}

export function useRole() {
  const s = useUserStore()
  const is = (r: UserRole | UserRole[]) => {
    if (!s.role) return false
    return Array.isArray(r) ? r.includes(s.role) : s.role === r
  }
  const atLeast = (r: UserRole) => (LEVEL[s.role!] ?? 0) >= LEVEL[r]
  return { is, atLeast, role: computed(() => s.role), isAdmin: computed(() => s.role === 'admin') }
}
