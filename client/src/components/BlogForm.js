import React, { useState } from 'react'

export default ({ addBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const onAddBlog = (e) => {
    e.preventDefault()

    const newBlog = {
      title: title,
      author: author,
      url: url,
      likes: 0
    }

    addBlog(newBlog)
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <form onSubmit={onAddBlog}>
        <h2>create new</h2>
        <p>title: <input type='text' value={title} onChange={(e) => setTitle(e.target.value)} name='title'/></p>
        <p>author: <input type='text' value={author} onChange={(e) => setAuthor(e.target.value)} name='author'/></p>
        <p>url: <input type='text' value={url} onChange={(e) => setUrl(e.target.value)} name='url'/></p>
        <button type='submit'>create</button>
      </form>
    </div>
  )
}