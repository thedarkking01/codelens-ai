import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail, Sparkles, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '../context/useAuth'

export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
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
      await register({ name, email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
              Get started for free
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
              Your AI-powered<br />code companion.
            </h2>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Import any GitHub repository and start exploring with AI in seconds.
              No setup required.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { step: '01', text: 'Create your account' },
              { step: '02', text: 'Import a GitHub repository' },
              { step: '03', text: 'Ask AI anything about your code' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <span className="font-mono text-xs text-violet-500">{item.step}</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-sm text-slate-400">{item.text}</span>
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
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Start exploring your codebase with AI.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-slate-400">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  minLength={3}
                  maxLength={50}
                  required
                  disabled={isSubmitting}
                  className="border-white/[0.08] bg-white/[0.03] pl-10 text-white placeholder:text-slate-600 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                />
              </div>
            </div>

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
                  placeholder="Min. 8 characters"
                  minLength={8}
                  maxLength={100}
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
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}
