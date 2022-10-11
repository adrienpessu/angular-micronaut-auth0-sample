Cypress.env()


describe('Nominal test', () => {
  it('passes', () => {
    cy.visit('http://localhost:4200');

    cy.get('body').then($body => {
      if ($body.find('button#login').length) {
        cy.get('button#login').click();

        cy.url({timeout: 35000}).then(url => {
          if (url.indexOf(".eu.auth0.com") > -1) {
            cy.url({timeout: 35000}).should('contain', 'state=');
            cy.get('#username')
              .invoke('attr', 'value', Cypress.env('AUTH_USERNAME'),)
              .should('have.attr', 'value', Cypress.env('AUTH_USERNAME'),);
            cy.get('#password').invoke('attr', 'value', Cypress.env('AUTH_PASSWORD'),)
              .should('have.attr', 'value', Cypress.env('AUTH_PASSWORD'),)
            cy.get('button[type=submit][value=default]').click()
            cy.url({timeout: 35000}).should('contain', '4200')
          }

          cy.get('div#greatings', {timeout: 35000})
            .should('have.text', Cypress.env('AUTH_USERNAME'));
          cy.get('button#api').click();
          cy.get('code#apiResult', {timeout: 35000}).should('contain', 'adrien');
        });



      }
    });
  })
})
