import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import LoginPage from '@/components/auth/LoginPage'
import AppShell from '@/components/layout/AppShell'
import WelcomePage from '@/components/layout/WelcomePage'
import ChapterPage from '@/components/textbook/ChapterPage'
import ProgressPage from '@/components/layout/ProgressPage'
import AcknowledgementsPage from '@/components/layout/AcknowledgementsPage'
import KnowledgeGraphPage from '@/components/knowledge/KnowledgeGraphPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Keying ChapterPage by id guarantees complete remount on chapter transition,
// preventing any state bleeding or cross-page editor overwrites!
function ChapterRouteWrapper() {
  const { id } = useParams<{ id: string }>()
  return <ChapterPage key={id} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<WelcomePage />} />
        <Route path="chapter/:id" element={<ChapterRouteWrapper />} />
        <Route path="graph" element={<KnowledgeGraphPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="acknowledgements" element={<AcknowledgementsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


