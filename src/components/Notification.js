import React from 'react'
import './Notification.css'

export default ({ message, classes }) => {
  if (!message) return null

  return (
    <div id='error' className={classes}>
      {message}
    </div>
  )
}