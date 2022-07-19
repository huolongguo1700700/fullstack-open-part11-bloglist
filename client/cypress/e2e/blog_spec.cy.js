describe('Blog app', () => {
  beforeEach(function () {
    cy.request('POST', 'http://localhost:3001/api/testing/reset')
    const user = {
      name: 'root1',
      username: 'root1',
      password: 'root1'
    }
    cy.request('POST', 'http://localhost:3001/api/users/', user)

    const user2 = {
      name: 'testing',
      username: 'testing',
      password: 'testing'
    }
    cy.request('POST', 'http://localhost:3001/api/users/', user2)

    cy.visit('http://localhost:3000')
  })

  it('login form can be opened', function () {
    cy.visit('http://localhost:3000')
    cy.contains('login').click()
  })

  describe('login', function () {
    it('succeeds with correct credentials', function() {
      cy.contains('login').click()
      cy.get('#username').type('root1')
      cy.get('#password').type('root1')
      cy.get('#login-button').click()
      cy.contains('root1 logged-in')
    })

    it('fails with wrong credentials', function() {
      cy.contains('login').click()
      cy.get('#username').type('root1')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.get('#error').should('contain', 'Wrong credentials')
      cy.get('#error').should('have.css', 'color', 'rgb(255, 0, 0)')
    })
  })

  describe('when logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'root1', password: 'root1' })
    })

    it('a new blog can be created', function () {
      cy.contains('new blog').click()
      cy.get('input[name="title"]').type('Test Title')
      cy.get('input[name="author"]').type('Test Author')
      cy.get('input[name="url"]').type('Test URL')
      cy.get('button[type="submit"]').click()

      cy.contains('A new blog Test Title by Test Author added')
    })

    describe('when a blog existed', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'Dump Title',
          author: 'Dump Author',
          likes: 0,
          url: 'Dump URL'
        })
      })

      it('user can like a blog', function () {
        cy.contains('view').click()
        cy.get('#noLikes').should('contain', 0)
        cy.get('#like-btn').click()
        cy.get('#noLikes').should('contain', 1)
      })

      it('user can delete a blog', function () {
        cy.contains('view').click()
        cy.contains('remove').click()
        cy.on('window:confirm', function (text) {
          expect(text).to.contains('Remove Dump Title by Dump Author')
          return true
        })
        cy.contains('Dump Title Dump Author').should('not.exist')
      })

      it('different user delete blog', function() {
        cy.contains('logout').click()
        cy.login({ username: 'testing', password: 'testing' })
        cy.contains('view').click()
        cy.contains('remove').click()
        cy.on('window:confirm', function (text) {
          expect(text).to.contains('Remove Dump Title by Dump Author')
          return true
        })
        cy.contains('Unauthorized')
      })

      it('multiple blogs ordered by likes', function () {
        cy.createBlog({
          title: 'Most Like Title',
          author: 'Most Like Author',
          likes: 20,
          url: 'Dump URL'
        })

        cy.createBlog({
          title: 'Second-most like Title',
          author: 'Second-most like Author',
          likes: 10,
          url: 'Dump URL'
        })

        cy.get('.blog').eq(0).should('contain', 'Most Like Title')
        cy.get('.blog').eq(1).should('contain', 'Second-most like Title')
        cy.get('.blog').eq(2).should('contain', 'Dump Title')
      })
    })
  })
})

