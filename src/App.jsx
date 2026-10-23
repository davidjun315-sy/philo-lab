import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { RequireAdmin, RequireLogin, RequireStudent } from './components/RouteGuards'
import Home from './pages/Home'
import Classes from './pages/Classes'
import SubjectPage from './pages/SubjectPage'
import TopicPage from './pages/TopicPage'
import Philosophers from './pages/Philosophers'
import PhilosopherDetail from './pages/PhilosopherDetail'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Club from './pages/Club'
import Resources from './pages/Resources'
import Login from './pages/Login'
import MyPage from './pages/MyPage'
import ChangePassword from './pages/ChangePassword'
import TestResultConnect from './pages/TestResultConnect'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminClasses from './pages/admin/AdminClasses'
import AdminContent from './pages/admin/AdminContent'
import AdminClubs from './pages/admin/AdminClubs'
import AdminVisibility from './pages/admin/AdminVisibility'
import AdminBackup from './pages/admin/AdminBackup'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/:subjectId" element={<SubjectPage />} />
        <Route path="classes/:subjectId/:topicId" element={<TopicPage />} />
        <Route path="philosophers" element={<Philosophers />} />
        <Route path="philosophers/:id" element={<PhilosopherDetail />} />
        <Route path="games" element={<Games />} />
        <Route path="games/:id" element={<GameDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="club" element={<Club />} />
        <Route path="club/:year" element={<Club />} />
        <Route path="club/:year/:clubId" element={<Club />} />
        <Route path="resources" element={<Resources />} />

        <Route path="login" element={<Login />} />
        <Route path="connect/test-result" element={<TestResultConnect />} />
        <Route path="my" element={<RequireStudent><MyPage /></RequireStudent>} />
        <Route path="my/password" element={<RequireLogin><ChangePassword /></RequireLogin>} />

        <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="lessons" element={<AdminContent type="lessons" />} />
          <Route path="philosophers" element={<AdminContent type="philosophers" />} />
          <Route path="games" element={<AdminContent type="games" />} />
          <Route path="projects" element={<AdminContent type="projects" />} />
          <Route path="clubs" element={<AdminClubs />} />
          <Route path="resources" element={<AdminContent type="resources" />} />
          <Route path="questions" element={<AdminContent type="questions" />} />
          <Route path="visibility" element={<AdminVisibility />} />
          <Route path="backup" element={<AdminBackup />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
