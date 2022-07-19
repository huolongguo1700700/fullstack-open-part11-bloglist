import React, { useState } from 'react'

export default ({ blog, updateLikes, removeBlog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [view, setView] = useState(false)

  const onUpdateLike = async () => {
    const updatingBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id
    }

    updateLikes(updatingBlog)
  }

  return (
    <div className='blog' style={blogStyle}>
      <p>{blog.title} {blog.author}
        <button onClick={() => setView(!view)}>{view ? 'hide' : 'view'}</button>
      </p>
      {
        view
        && <div>
          <p>{blog.url}</p>
          <p id='noLikes'>{blog.likes} <button id='like-btn' onClick={onUpdateLike}>like</button></p>
          <p>{blog.author}</p>
          <button onClick={() => removeBlog(blog.id)}>remove</button>
        </div>
      }
    </div>
  )
}
