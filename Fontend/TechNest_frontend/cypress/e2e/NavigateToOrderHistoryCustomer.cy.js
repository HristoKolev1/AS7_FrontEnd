describe('Customer Login, Profile Access, and Order History', () => {
  it('logs in, navigates to profile, and views order history', () => {
    cy.clearLocalStorage();

    // Visit login page
    cy.visit('http://localhost:5173/login');

    // Login as customer
    cy.get('input[placeholder="Username"]').type('hristo24');
    cy.get('input[placeholder="Password"]').type('mySecret123');
    cy.contains('button', 'Log In').click();

    // Confirm login succeeded
    cy.url().should('not.include', '/login');

    // Navigate to profile page
    cy.visit('http://localhost:5173/profile');
    cy.contains('h1', 'My Profile');
    cy.get('.profile-card').should('exist');

    // Click "Order History" button
    cy.get('button.orders-btn').click();

    // Verify the order history page
    cy.url().should('include', '/profile/orders');
    cy.contains('Order History'); // Adjust if needed

    // Optionally check for presence of orders
  cy.get('table.orders-table').should('exist'); 
  });
});
