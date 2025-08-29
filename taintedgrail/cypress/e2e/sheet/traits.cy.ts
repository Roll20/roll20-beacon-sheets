describe("Sheet Traits", ()=>{
    beforeEach(() => {
        cy.visit("/sheet");
        cy.get(".taintedgrail__traits").should("exist");
      });

    describe('When I add a trait', () => {
        it("should default correct values", ()=>{
            cy.get(`[data-testid='test-add-trait-btn']`).click();
            cy.get(`[data-testid='test-trait-header']`, { timeout: 500 }).should('contain.text', 'New Skill 1');
            cy.get(`[data-testid='test-trait-header']`).click();
            cy.get(`[data-testid='test-trait-name-label']`).should('contain.text', 'Name');
            cy.get(`[data-testid='test-trait-name-input']`).should('have.value', 'New Skill 1');
            cy.get(`[data-testid='test-trait-type-label']`).should('contain.text', 'Type');
            cy.get(`[data-testid='test-trait-type-input']`).should('have.value', 'skill');
            cy.get(`[data-testid='test-trait-description']`).should('have.text', '');
        })
    })
})
