describe('Admin Login and Dashboard Access', () => {
  it('logs in as admin and accesses the admin dashboard', () => {
    // Ensure a clean state
    cy.clearLocalStorage();

    // Visit login page
    cy.visit('http://localhost:5173/login');

    // Fill in admin credentials
    cy.get('input[placeholder="Username"]').type('adminuser');
    cy.get('input[placeholder="Password"]').type('Admin@123');
    cy.contains('button', 'Log In').click();

    // Ensure redirect away from login (adjust if your app redirects somewhere else)
    cy.url().should('not.include', '/login');

    // Navigate to the admin dashboard
    cy.visit('http://localhost:5173/admin');

    // Confirm dashboard loaded
    cy.contains('Admin Dashboard'); // Adjust this to actual heading/text in your dashboard
    cy.url().should('include', '/admin');
  });
});
