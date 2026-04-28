import React, { useState } from 'react'

function Auth({ user, setUser }) {
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (!isLogin && password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        const endpoint = isLogin ? '/login' : '/signup'
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                if (!isLogin) {
                    const loginResponse = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    })
                    const loginData = await loginResponse.json()
                    if (loginData.success) {
                        setUser({ username: loginData.username })
                    }
                } else {
                    setUser({ username: data.username })
                }
                setUsername('')
                setPassword('')
                setConfirmPassword('')
            } else {
                setError(data.error || 'Authentication failed')
            }
        } catch (error) {
            setError('Connection error. Make sure server is running on port 3000')
        }
    }

    const handleLogout = async () => {
        await fetch('/logout', { method: 'POST' })
        setUser(null)
    }

    if (user) {
        return (
            <div className="auth-bar">
                <span>Welcome, {user.username}!</span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        )
    }

    return (
        <div className="auth-bar">
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                {!isLogin && (
                <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                />
                )}
                {error && <p className="auth-error">{error}</p>}
                <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
                <button type="button" onClick={() => {setIsLogin(!isLogin)
                    setConfirmPassword('')
                    setError('')
                }}>
                    {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
                </button>
            </form>
        </div>
    )
}

export default Auth