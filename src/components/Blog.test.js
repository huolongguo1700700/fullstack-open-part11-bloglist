import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  let component
  const blog = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 18,
    user: '62b232f50cb85741a0110c4d'
  }

  const mockHandlerUpdate = jest.fn()
  const mockHandlerRemove = jest.fn()

  beforeEach(() => {
    component = render(
      <Blog
        blog={blog}
        removeBlog={mockHandlerRemove}
        updateLikes={mockHandlerUpdate}
      />
    )
  })

  test('renders content', () => {
    const element = component.getByText('Canonical string reduction Edsger W. Dijkstra')
    expect(element).toBeDefined()
  })

  test('default content', () => {
    const defaultBlogContent = component.container.querySelector('.blog')

    expect(defaultBlogContent).toHaveTextContent(blog.title)
    expect(defaultBlogContent).toHaveTextContent(blog.author)
    expect(defaultBlogContent).not.toHaveTextContent(blog.url)
    expect(defaultBlogContent).not.toHaveTextContent(blog.likes)
  })

  test('url and likes are shown when view button clicked', async () => {
    const user = userEvent.setup()
    const button = component.getByText('view')
    await user.click(button)
    const defaultBlogContent = component.container.querySelector('.blog')

    expect(defaultBlogContent).toHaveTextContent(blog.url)
    expect(defaultBlogContent).toHaveTextContent(blog.likes)
  })

  test('button like clicked twice', async () => {
    const user = userEvent.setup()

    // viewing the hidden part
    const viewButton = component.getByText('view')
    await user.click(viewButton)

    const likeButton = component.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockHandlerUpdate.mock.calls).toHaveLength(2)

  })
})