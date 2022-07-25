import React, { useState, useEffect, useRef } from 'react'
import { Blog, BlogForm, Notification, LoginForm, Togglable } from './components'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [message, setMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService
      .getAll().then(initialBlogs => {
        setBlogs(initialBlogs)
      })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('blogLoginToken')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = (event) => {
    event.preventDefault()

    loginService.login({
      username: username,
      password: password
    }).then(res => {
      window.localStorage.setItem(
        'blogLoginToken', JSON.stringify(res)
      )

      blogService.setToken(res.token)
      setUser(res)
      setUsername('')
      setPassword('')
    }).catch(() => {
      setMessage({
        message: 'Wrong credentials',
        classes: 'error'
      })

      setTimeout(() => {
        setMessage(null)
      }, 5000)
    })
  }

  const addBlog = (blogObj) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObj)
      .then(blog => {
        setBlogs(blogs.concat(blog))

        setMessage({
          message: `A new blog ${blogObj.title} by ${blogObj.author} added`,
          classes: 'success'
        })

        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch(err => {
        setMessage({
          message: err.response.data.error,
          classes: 'error'
        })

        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const updateLikes = (newObj) => {
    blogService
      .update(newObj.id, newObj)
      .then(blog => {
        setBlogs(blogs.map(b => b.id === blog.id ? blog : b))

        setMessage({
          message: `Blog ${blog.title} update success`,
          classes: 'success'
        })

        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch(err => {
        setMessage({
          message: err.response.data.error,
          classes: 'error'
        })

        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const deleteBlog = (id) => {
    const blog = blogs.find(b => b.id === id)
    if (!blog) return

    if (window.confirm(`Remove ${blog.title} by ${blog.author}`)){
      blogService.deleteBlog(id)
        .then(() => {
          setBlogs(blogs.filter(b => b.id !== id))
          setMessage({
            message: `Remove blog ${blog.title} update success`,
            classes: 'success'
          })

          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(err => {
          setMessage({
            message: err.response.data.error,
            classes: 'error'
          })

          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
    }
  }

  const loginForm = () => (
    <Togglable buttonLabel='login'>
      { message && <Notification message={message.message} classes={message.classes} />}
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  const blogForm = () => (
    <Togglable buttonLabel='new blog' ref={blogFormRef}>
      <BlogForm blogs={blogs} addBlog={addBlog} />
    </Togglable>
  )

  return (
    <div>
      {
        user === null ?
          loginForm() :
          <div>
            { message && <Notification message={message.message} classes={message.classes} />}
            <p>
              {user.name} logged-in
              <button onClick={() => {
                window.localStorage.removeItem('blogLoginToken')
                setUser(null)
              }}>logout</button>
            </p>
            {blogForm()}
            <br />
            <div>
              {
                blogs
                  .sort((a, b) => b.likes - a.likes)
                  .map(blog => <Blog
                    key={blog.id}
                    blog={blog}
                    updateLikes={updateLikes}
                    removeBlog={deleteBlog} />)
              }
            </div>
          </div>
      }
    </div>
  )
}

export default App
