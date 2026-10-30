import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function formatPostDate(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState('login');

  async function loadFeed(accessToken, nextCursor = null) {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ limit: '10' });
      if (nextCursor) query.set('cursor', nextCursor);
      const response = await fetch(`${API}/api/feed?${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Could not load feed');
      setPosts((current) => nextCursor ? [...current, ...data.data.items] : data.data.items);
      setCursor(data.data.nextCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${API}/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Could not authenticate');

      if (authMode === 'register') {
        setAuthMode('login');
        setName('');
        setPassword('');
        setSuccessMessage('Account created. Please sign in.');
        setLoading(false);
        return;
      }

      setToken(data.data.accessToken);
      await loadFeed(data.data.accessToken);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="/">pulse<span>.</span></a><div className="avatar">D</div></header>
    {!token ? <section className="intro"><p className="eyebrow">YOUR COMMUNITY</p><h1>{authMode === 'login' ? 'Sign in' : 'Create account'}</h1><p className="subhead">{authMode === 'login' ? 'Use your account credentials to view your feed.' : 'Create an account to join the community.'}</p>
      <form className="login-form" onSubmit={submitAuth}>
        {authMode === 'register' && <label>Name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>}
        <label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={authMode === 'register' ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <div className="notice">{error}</div>}
        {successMessage && <div className="notice" role="status">{successMessage}</div>}
        <button className="more" type="submit" disabled={loading}>{loading ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button>
        <button className="auth-switch" type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); setSuccessMessage(''); }}>
          {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}
        </button>
      </form>
    </section> : <>
      <section className="intro"><p className="eyebrow">YOUR COMMUNITY</p><h1>For you</h1><p className="subhead">The latest from people you follow.</p></section>
      <section className="feed" aria-label="Personalized feed">
        {error && <div className="notice">{error}<button onClick={() => loadFeed(token)}>Try again</button></div>}
        {!loading && !error && posts.length === 0 && <div className="empty">Nothing here yet. Follow a few creators to get your feed started.</div>}
        {posts.map((post) => <article className="post" key={post.id}>
          <div className="post-avatar">{post.authorName?.[0] || '?'}</div>
          <div className="post-content"><div className="post-meta"><strong>{post.authorName}</strong><span>@{post.authorId}</span><span>·</span><time>{formatPostDate(post.createdAt)}</time></div>
            <p>{post.text}</p><div className="post-footer"><span>♡ &nbsp;{post.likes}</span><span className="score">Recommended for you</span></div>
          </div>
        </article>)}
        {loading && <p className="loading">Loading your feed…</p>}
        {!loading && cursor && <button className="more" onClick={() => loadFeed(token, cursor)}>Load more</button>}
      </section>
      <footer>Ranked from recent posts and community activity</footer>
    </>}
  </main>;
}
