import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import './App.css'

function Header() {
  return (
    <header className="hh-header">
      <div className="hh-header-content">
        <img src="/src/assets/react.svg" alt="Logo" className="hh-logo" />
        <h1>HobbyHub</h1>
        <nav>
          <Link to="/" className="hh-nav-link">Home</Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="hh-footer">
      <div>
        HobbyHub &copy; {new Date().getFullYear()} &mdash; Made with ❤️ by Aryan Patel
      </div>
    </footer>
  )
}

function PostForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState('')

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    let finalImage = imageUrl
    if (preview) finalImage = preview
    onCreate({ title, content, imageUrl: finalImage })
    setTitle('')
    setContent('')
    setImageUrl('')
    setImageFile(null)
    setPreview('')
  }

  return (
    <form className="hh-card hh-form" onSubmit={handleSubmit}>
      <h2>Create a New Post</h2>
      <input
        className="hh-input"
        placeholder="Title (required)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        className="hh-input"
        placeholder="Content (optional)"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <input
        className="hh-input"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
      />
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>Or upload an image:</label>
        <input
          type="file"
          accept="image/*"
          className="hh-input"
          style={{ padding: 0, marginTop: 8 }}
          onChange={handleFileChange}
        />
        {preview && (
          <img src={preview} alt="Preview" style={{ maxWidth: 180, marginTop: 12, borderRadius: 8, boxShadow: "0 2px 8px #eee" }} />
        )}
      </div>
      <button type="submit" className="hh-btn hh-btn-primary">Create</button>
    </form>
  )
}

function Feed({ posts, onSort, sortBy, onSearch, search }) {
  return (
    <div className="hh-card">
      <h2>Posts Feed</h2>
      <input
        className="hh-input"
        placeholder="Search by title"
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
      <div className="hh-sort-btns">
        <button
          className={`hh-btn ${sortBy === 'createdAt' ? 'hh-btn-active' : ''}`}
          onClick={() => onSort('createdAt')}
        >
          Sort by Time
        </button>
        <button
          className={`hh-btn ${sortBy === 'upvotes' ? 'hh-btn-active' : ''}`}
          onClick={() => onSort('upvotes')}
        >
          Sort by Upvotes
        </button>
      </div>
      <ul className="hh-post-list">
        {posts.map(post => (
          <li key={post.id} className="hh-post-card">
            <Link to={`/post/${post.id}`} className="hh-post-title">
              {post.title}
            </Link>
            <div className="hh-post-meta">
              {new Date(post.createdAt).toLocaleString()} &nbsp;|&nbsp; <span className="hh-post-upvotes">Upvotes: {post.upvotes}</span>
            </div>
          </li>
        ))}
      </ul>
      {posts.length === 0 && <div className="hh-empty">No posts yet. Create one above!</div>}
    </div>
  )
}

function PostPage({ posts, onUpvote, onComment, onDelete, onEdit }) {
  const { id } = useParams()
  const post = posts.find(p => p.id === id)
  const [comment, setComment] = useState('')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post?.title || '')
  const [editContent, setEditContent] = useState(post?.content || '')
  const [editImageUrl, setEditImageUrl] = useState(post?.imageUrl || '')
  const navigate = useNavigate()

  if (!post) return <div className="hh-card">Post not found</div>

  function handleEdit(e) {
    e.preventDefault()
    onEdit(post.id, { title: editTitle, content: editContent, imageUrl: editImageUrl })
    setEditing(false)
  }

  return (
    <div className="hh-card hh-post-detail">
      <button onClick={() => navigate(-1)} className="hh-btn hh-btn-secondary">← Back</button>
      {editing ? (
        <form onSubmit={handleEdit}>
          <input className="hh-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
          <textarea className="hh-input" value={editContent} onChange={e => setEditContent(e.target.value)} />
          <input className="hh-input" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} />
          <button type="submit" className="hh-btn hh-btn-primary">Save</button>
          <button type="button" className="hh-btn hh-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <h2 className="hh-post-title">{post.title}</h2>
          <div className="hh-post-content">{post.content}</div>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="" className="hh-post-image" />
          )}
          <div className="hh-post-meta">
            {new Date(post.createdAt).toLocaleString()} &nbsp;|&nbsp; <span className="hh-post-upvotes">Upvotes: {post.upvotes}</span>
          </div>
          <button onClick={() => onUpvote(post.id)} className="hh-btn hh-btn-primary">Upvote</button>
          <button onClick={() => setEditing(true)} className="hh-btn hh-btn-secondary">Edit</button>
          <button onClick={() => { onDelete(post.id); navigate('/') }} className="hh-btn hh-btn-danger">Delete</button>
        </>
      )}
      <h3 className="hh-comments-title">Comments</h3>
      <ul className="hh-comments-list">
        {post.comments.map((c, i) => (
          <li key={i} className="hh-comment">{c}</li>
        ))}
      </ul>
      <form onSubmit={e => { e.preventDefault(); onComment(post.id, comment); setComment('') }}>
        <input
          className="hh-input"
          placeholder="Add comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <button type="submit" className="hh-btn hh-btn-primary">Comment</button>
      </form>
    </div>
  )
}

function App() {
  const [posts, setPosts] = useState([])
  const [sortBy, setSortBy] = useState('createdAt')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  function handleCreate({ title, content, imageUrl }) {
    setLoading(true)
    setTimeout(() => {
      setPosts([
        {
          id: Math.random().toString(36).slice(2),
          title,
          content,
          imageUrl,
          createdAt: Date.now(),
          upvotes: 0,
          comments: [],
        },
        ...posts,
      ])
      setLoading(false)
    }, 800) // simulate network delay
  }

  function handleUpvote(id) {
    setPosts(posts => posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
  }

  function handleComment(id, comment) {
    setPosts(posts => posts.map(p => p.id === id ? { ...p, comments: [...p.comments, comment] } : p))
  }

  function handleDelete(id) {
    setPosts(posts => posts.filter(p => p.id !== id))
  }

  function handleEdit(id, { title, content, imageUrl }) {
    setPosts(posts => posts.map(p => p.id === id ? { ...p, title, content, imageUrl } : p))
  }

  let filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
  filtered = [...filtered].sort((a, b) =>
    sortBy === 'createdAt'
      ? b.createdAt - a.createdAt
      : b.upvotes - a.upvotes
  )

  return (
    <Router>
      <Header />
      <main className="hh-main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <PostForm onCreate={handleCreate} />
                {loading ? (
                  <div className="hh-loading">
                    <div className="hh-spinner"></div>
                  </div>
                ) : (
                  <Feed
                    posts={filtered}
                    onSort={setSortBy}
                    sortBy={sortBy}
                    onSearch={setSearch}
                    search={search}
                  />
                )}
              </>
            }
          />
          <Route
            path="/post/:id"
            element={
              <PostPage
                posts={posts}
                onUpvote={handleUpvote}
                onComment={handleComment}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

export default App
