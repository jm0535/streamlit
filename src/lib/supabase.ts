import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  website?: string
  bio?: string
  updated_at: string
}

// Authentication functions
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user ? {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    created_at: user.created_at,
  } : null
}

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Session management
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Password reset
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  if (error) throw error
}

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  if (error) throw error
}

// Social authentication
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  return data
}

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  return data
}
