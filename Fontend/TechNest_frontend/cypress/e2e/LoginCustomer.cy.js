describe('Customer Login and Profile Access', () => {
  it('logs in as customer and sees profile info', () => {
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173/login');

    // Login form
    cy.get('input[placeholder="Username"]').type('hristo24');
    cy.get('input[placeholder="Password"]').type('mySecret123');
    cy.contains('button', 'Log In').click();


    // Wait for redirect and navigate to profile page
    cy.url().should('not.include', '/login');
    cy.visit('http://localhost:5173/profile');

    // Ensure profile page loads
    cy.contains('h1', 'My Profile');
    cy.get('.profile-card').should('exist');

    // Validate at least one user detail
    cy.get('.profile-row .label').contains('Username:');
    cy.get('.profile-row .value').should('not.be.empty');
  });
});
