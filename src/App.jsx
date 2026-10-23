import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
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
        <Route path="resources" element={<Resources />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
