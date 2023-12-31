'use client' // * necessary
import authCredentials from '@/app/users/login/authenticateCredentials'
import signUpUser from '@/app/users/signup/signupuser'
import postReview from '@/app/champions/[name]/reviews/new/postReview'
import decodeJwt from './decodeJwt'
import { createContext, useContext, useEffect, useState } from 'react' // * creating the context

const AppContext = createContext({})

export const ContextProvider = ({ children }) => {
  const [msg, setMsg] = useState('') // * msg will store error messages when the password is wrong
  const [reviewMsg, setReviewMsg] = useState('') // * Same this as above, but with Reviews
  const [userInfo, setUserInfo] = useState('') // * used to store user information
  const token = localStorage.getItem('token')
  const [champion, setChampion] = useState('') // *
  const championFromToken = localStorage.getItem('champion')

  useEffect(() => {
    if (championFromToken) {
      setChampion(championFromToken)
    }
  }, [championFromToken])

  useEffect(() => { // ! Does not work as expected !!!!
    if (token) { // * if token exists. decode the token and assign the username value to userInfo
      setUserInfo(decodeJwt(token))
    }
  }, [token]) // * without this useEffect the state wont update after redirecting the user to homepage

  const submitLogin = async (e) => { // * logging in an already existing user
    e.preventDefault()
    localStorage.removeItem('token') // * deletes the token, if it exists
    const data = Object.fromEntries(new FormData(e.target))
    const result = await authCredentials(data.username, data.password)

    if (result.length > 200) {
      localStorage.setItem('token', result) // * store token
      setUserInfo(decodeJwt(result))
      window.location.href = '/'
    } else {
      setMsg(result)
    }
  }

  const submitSignUp = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    const result = await signUpUser(data.username, data.email, data.password)

    setMsg(result)
  }

  const addReview = async (e, name, heartCount) => { // * Passing the champion name as argument
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    const ratingInt = parseInt(heartCount)
    const result = await postReview(name, token, ratingInt, data.reviewTitle, data.reviewText)

    setReviewMsg(result)
  }

  return (
    <AppContext.Provider value={{ userInfo, msg, setMsg, submitLogin, submitSignUp, addReview, reviewMsg, champion }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
