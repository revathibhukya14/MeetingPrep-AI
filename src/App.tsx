import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Assistant } from './pages/Assistant'
import { Contacts } from './pages/Contacts'
import { ContactDetails } from './pages/ContactDetails'
import { Dashboard } from './pages/Dashboard'
import { MeetingPreparation } from './pages/MeetingPreparation'
import { Meetings } from './pages/Meetings'
import { Memories } from './pages/Memories'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:id" element={<ContactDetails />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/meetings/:id/prepare" element={<MeetingPreparation />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
