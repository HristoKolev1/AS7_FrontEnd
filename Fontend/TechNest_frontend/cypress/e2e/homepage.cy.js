describe('Generic Frontend Smoke Test', () => {
  it('loads the homepage successfully', () => {
    cy.visit('http://localhost:5173')
    cy.document().should('exist')
    cy.title().should('not.be.empty')
  })
})