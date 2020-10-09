context('Actions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login')
  })

  it('logs in', () => {
    cy.get('#username-input').type('joey@example.com')
    cy.get('#password-input').type('password')
    cy.get('.button').click()
  })
})
