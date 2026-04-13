// ─────────────────────────────────────────────────────────────────────────────
// Velora Commerce — Supabase Database Types
// Reflects the schema in supabase/migrations/001_initial_schema.sql
// In production, regenerate with: npx supabase gen types typescript --project-id <id>
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user'
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'
export type CouponType = 'percentage' | 'fixed'

export type LocaleCode = 'en' | 'uz' | 'ru'

export interface ProductTranslation {
  title: string
  description: string
  slug: string
}

export interface CategoryTranslation {
  name: string
  description?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          updated_at?: string
        }
      }

      categories: {
        Row: {
          id: string
          slug: string
          parent_id: string | null
          image: string | null
          sort_order: number
          is_active: boolean
          translations: Record<LocaleCode, CategoryTranslation>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          parent_id?: string | null
          image?: string | null
          sort_order?: number
          is_active?: boolean
          translations?: Record<LocaleCode, CategoryTranslation>
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          parent_id?: string | null
          image?: string | null
          sort_order?: number
          is_active?: boolean
          translations?: Record<LocaleCode, CategoryTranslation>
          updated_at?: string
        }
      }

      products: {
        Row: {
          id: string
          sku: string
          price: number
          compare_price: number | null
          stock: number
          images: string[]
          category_id: string | null
          brand: string | null
          tags: string[]
          is_active: boolean
          is_featured: boolean
          translations: Record<LocaleCode, ProductTranslation>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          price: number
          compare_price?: number | null
          stock?: number
          images?: string[]
          category_id?: string | null
          brand?: string | null
          tags?: string[]
          is_active?: boolean
          is_featured?: boolean
          translations?: Record<LocaleCode, ProductTranslation>
          created_at?: string
          updated_at?: string
        }
        Update: {
          sku?: string
          price?: number
          compare_price?: number | null
          stock?: number
          images?: string[]
          category_id?: string | null
          brand?: string | null
          tags?: string[]
          is_active?: boolean
          is_featured?: boolean
          translations?: Record<LocaleCode, ProductTranslation>
          updated_at?: string
        }
      }

      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          price: number
          stock: number
          attributes: Record<string, string>
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          price: number
          stock?: number
          attributes?: Record<string, string>
          created_at?: string
        }
        Update: {
          sku?: string
          price?: number
          stock?: number
          attributes?: Record<string, string>
        }
      }

      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          session_id?: string | null
          updated_at?: string
        }
      }

      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
        }
        Update: {
          quantity?: number
        }
      }

      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: never
      }

      orders: {
        Row: {
          id: string
          user_id: string
          status: OrderStatus
          payment_status: PaymentStatus
          subtotal: number
          discount: number
          total: number
          shipping_address: Record<string, string>
          coupon_code: string | null
          stripe_payment_intent_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          subtotal: number
          discount?: number
          total: number
          shipping_address?: Record<string, string>
          coupon_code?: string | null
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          payment_status?: PaymentStatus
          stripe_payment_intent_id?: string | null
          notes?: string | null
          updated_at?: string
        }
      }

      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          title: string
          image: string | null
          price: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          title: string
          image?: string | null
          price: number
          quantity: number
          created_at?: string
        }
        Update: never
      }

      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          comment: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: number
          comment?: string | null
          is_approved?: boolean
          updated_at?: string
        }
      }

      coupons: {
        Row: {
          id: string
          code: string
          type: CouponType
          value: number
          min_order_amount: number | null
          max_uses: number | null
          used_count: number
          is_active: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          type: CouponType
          value: number
          min_order_amount?: number | null
          max_uses?: number | null
          used_count?: number
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          code?: string
          type?: CouponType
          value?: number
          min_order_amount?: number | null
          max_uses?: number | null
          used_count?: number
          is_active?: boolean
          expires_at?: string | null
        }
      }

      payments: {
        Row: {
          id: string
          order_id: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_charge_id: string | null
          amount: number
          currency: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_charge_id?: string | null
          amount: number
          currency?: string
          status: string
          created_at?: string
        }
        Update: {
          stripe_charge_id?: string | null
          status?: string
        }
      }

      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }

      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string
          street: string
          city: string
          state: string | null
          country: string
          postal_code: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          full_name: string
          phone: string
          street: string
          city: string
          state?: string | null
          country: string
          postal_code: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          label?: string
          full_name?: string
          phone?: string
          street?: string
          city?: string
          state?: string | null
          country?: string
          postal_code?: string
          is_default?: boolean
          updated_at?: string
        }
      }
    }

    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
