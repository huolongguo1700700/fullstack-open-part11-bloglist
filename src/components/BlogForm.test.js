import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('right details when a new blog is created', async () => {
  const createBlogMock = jest.fn()

  render(<BlogForm addBlog={createBlogMock} />)
  const input = screen.getAllByRole('textbox')
  const title = input[0]
  const author = input[1]
  const url = input[2]
  const sendButton = screen.getByText('create')

  const user = userEvent.setup()
  await user.type(title, 'Test Title')
  await user.type(author, 'Test Author')
  await user.type(url, 'Test url')
  await user.click(sendButton)

  expect(createBlogMock.mock.calls).toHaveLength(1)
  expect(createBlogMock.mock.calls[0][0].title).toBe('Test Title')
  expect(createBlogMock.mock.calls[0][0].author).toBe('Test Author')
  expect(createBlogMock.mock.calls[0][0].url).toBe('Test url')
})