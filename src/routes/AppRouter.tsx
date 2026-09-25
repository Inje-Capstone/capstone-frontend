import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ApiTestPage from '../pages/ApiTestPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/api-test" element={<ApiTestPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter