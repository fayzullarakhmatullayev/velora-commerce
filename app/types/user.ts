// ─────────────────────────────────────────────
// Velora Commerce — User Types
// ─────────────────────────────────────────────

export type UserRole = 'admin' | 'user'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  phone?: string
  role: UserRole
  createdAt: string
}

export interface Address {
  id: string
  userId: string
  label: string // e.g. "Home", "Work"
  fullName: string
  phone: string
  street: string
  city: string
  state?: string
  country: string
  postalCode: string
  isDefault: boolean
}
