import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import OAuthCallbackPage from '../pages/OAuthCallbackPage'
import SplashPage from '../pages/SplashPage'
import HomePage from '../pages/HomePage'
import ApiTestPage from '../pages/ApiTestPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import PasswordResetPage from '../pages/PasswordResetPage'
import OnboardingPage from '../pages/OnboardingPage'
import WatchPage from '../pages/WatchPage'
import DictionaryPage from '../pages/DictionaryPage'
import QuizPage from '../pages/QuizPage'
import ShopPage from '../pages/ShopPage'
import MyPage from '../pages/MyPage'
import AuthProvider from '../auth/AuthProvider'
import RequireAuth from '../auth/RequireAuth'
import AppLayout from '../components/AppLayout'
import OfflineNotice from '../components/OfflineNotice'

export default function AppRouter() {
 return <BrowserRouter><AuthProvider><OfflineNotice/><Routes>
  <Route path="/oauth/callback" element={<OAuthCallbackPage/>}/>
  <Route path="/splash" element={<SplashPage/>}/>
  <Route path="/login" element={<LoginPage/>}/>
  <Route path="/signup" element={<SignupPage/>}/>
  <Route path="/password-reset" element={<PasswordResetPage/>}/>
  <Route element={<RequireAuth allowIncomplete/>}><Route path="/onboarding" element={<OnboardingPage/>}/></Route>
  <Route element={<RequireAuth/>}><Route element={<AppLayout/>}>
   <Route path="/" element={<HomePage/>}/>
   <Route path="/watch/:gameId" element={<WatchPage/>}/>
   <Route path="/dictionary" element={<DictionaryPage/>}/>
   <Route path="/quiz" element={<QuizPage/>}/>
   <Route path="/shop" element={<ShopPage/>}/>
   <Route path="/mypage" element={<MyPage/>}/>
  </Route></Route>
  <Route path="/api-test" element={<ApiTestPage/>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes></AuthProvider></BrowserRouter>
}
