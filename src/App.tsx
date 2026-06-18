import { useMemo } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import AmbientSound from './components/AmbientSound'
import CoverScreen from './screens/CoverScreen'
import DeclinedScreen from './screens/DeclinedScreen'
import EnteringScreen from './screens/EnteringScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import RallyScreen from './screens/RallyScreen'
import { useRallyConnection } from './hooks/useRallyConnection'
import type { JoinRequest, JoinResponse, Participant } from './types'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { participants, currentUser, currentUserId, status, restoring, join, leave } =
    useRallyConnection()

  const existingHandles = useMemo(
    () => participants.map((p) => p.handle),
    [participants],
  )

  const handleJoin = async (data: JoinRequest): Promise<JoinResponse> => {
    const result = await join(data)
    // Pass the participant through navigation state so /entering renders it
    // immediately, without waiting for currentUser state to commit.
    if (result.ok) {
      navigate('/entering', { state: { participant: result.participant } })
    }
    return result
  }

  const handleLeave = () => {
    leave()
    navigate('/')
  }

  // The participant for the entering screen: prefer nav state (set synchronously
  // on join), fall back to live currentUser (e.g. on a refresh of /entering).
  const enteringParticipant =
    (location.state as { participant?: Participant } | null)?.participant ??
    currentUser

  // While we verify a stored join against the server, hold instead of flashing
  // the cover/join flow (and then bouncing the user to the rally).
  const splash = (
    <main className="flex flex-1 items-center justify-center">
      <span
        className="size-6 animate-spin rounded-full border-2 border-white/15 border-t-brand"
        aria-label="Loading"
      />
    </main>
  )

  return (
    <div className="flex min-h-svh flex-col [&>*]:animate-screen-enter">
      <Routes>
        <Route
          path="/"
          element={
            restoring ? (
              splash
            ) : currentUser ? (
              <Navigate to="/rally" replace />
            ) : (
              <CoverScreen
                onAttend={() => navigate('/join')}
                onDecline={() => navigate('/declined')}
                onViewRally={() => navigate('/rally')}
              />
            )
          }
        />
        <Route
          path="/join"
          element={
            restoring ? (
              splash
            ) : currentUser ? (
              <Navigate to="/rally" replace />
            ) : (
              <OnboardingScreen
                existingHandles={existingHandles}
                onJoin={handleJoin}
                onBack={() => navigate('/')}
              />
            )
          }
        />
        <Route
          path="/entering"
          element={
            enteringParticipant ? (
              <EnteringScreen
                participant={enteringParticipant}
                onEntered={() => navigate('/rally')}
              />
            ) : (
              <Navigate to="/join" replace />
            )
          }
        />
        <Route
          path="/rally"
          element={
            restoring ? (
              splash
            ) : (
              <RallyScreen
                participants={participants}
                currentUserId={currentUserId}
                connectionStatus={status}
                onLeave={handleLeave}
                onAttend={() => navigate('/join')}
              />
            )
          }
        />
        <Route
          path="/declined"
          element={<DeclinedScreen onBack={() => navigate('/')} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AmbientSound />
    </div>
  )
}

export default App
