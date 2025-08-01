import { createClient } from '@supabase/supabase-js'
import { PromptSession, SubmittedPrompt } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database functions
export async function submitPromptSession(session: PromptSession): Promise<SubmittedPrompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompt_sessions')
      .insert([{
        title: session.title,
        question: session.question,
        student_responses: session.student_responses,
        analysis_question: session.analysis_question || null,
        analysis_result: session.analysis_result || null,
        submitted_by: session.submitted_by || 'Anonymous',
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error submitting prompt session:', error)
      return null
    }

    return data as SubmittedPrompt
  } catch (error) {
    console.error('Error submitting prompt session:', error)
    return null
  }
}

export async function getSubmittedPrompts(): Promise<SubmittedPrompt[]> {
  try {
    const { data, error } = await supabase
      .from('prompt_sessions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching submitted prompts:', error)
      return []
    }

    return data as SubmittedPrompt[]
  } catch (error) {
    console.error('Error fetching submitted prompts:', error)
    return []
  }
}

export async function getPromptById(id: string): Promise<SubmittedPrompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompt_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching prompt by ID:', error)
      return null
    }

    return data as SubmittedPrompt
  } catch (error) {
    console.error('Error fetching prompt by ID:', error)
    return null
  }
} 