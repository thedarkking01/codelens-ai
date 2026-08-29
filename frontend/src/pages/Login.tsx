import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '../context/useAuth'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f14]">

      {/* Left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-gradient-to-br from-[#0f1520] via-[#0b0f14] to-[#0d1219] p-12 lg:flex">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">CodeLens AI</span>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Repository Intelligence
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
              Understand any<br />codebase instantly.
            </h2>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Explore architecture, search code semantically, and ask AI
              questions about your entire repository.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Semantic Search', desc: 'Find code by meaning' },
              { label: 'AI Chat', desc: 'Ask about your codebase' },
              { label: 'Architecture', desc: 'Visualize dependencies' },
              { label: 'Code Review', desc: 'AI-powered insights' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
              >
                <p className="text-sm font-medium text-slate-200">{feature.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          © 2025 CodeLens AI. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">CodeLens AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-slate-400">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                  className="border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-slate-600 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className="border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-slate-600 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full gap-2 bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}
