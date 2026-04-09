describe('AgroNexus AI — Flujo de Trabajo Agrícola', () => {
  beforeEach(() => {
    // Interceptar llamadas a la API para evitar dependencia de red
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        user: { id: 'user-1', email: 'test@agronexus.ai' }
      }
    }).as('loginRequest');

    cy.intercept('GET', '**/api/zones/', {
      statusCode: 200,
      body: []
    }).as('getZones');

    cy.intercept('GET', '**/api/dashboard/latest*', {
      statusCode: 200,
      body: { sensor_data: { temperature: 24, humidity: 60 } }
    }).as('getLatest');
  });

  it('debería permitir al usuario iniciar sesión y crear una zona', () => {
    // 1. Login
    cy.visit('/login');
    
    // Usamos selectores CSS normales o de Ionic
    cy.get('ion-input[type="email"]').find('input').type('test@agronexus.ai', { force: true });
    cy.get('ion-input[type="password"]').find('input').type('password123', { force: true });
    
    cy.get('ion-button.premium-btn').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/tabs/home');

    // 2. Navegación a Control de Sistema
    cy.get('ion-item').contains('System').click();
    cy.url().should('include', '/tabs/control');

    // 3. Gestión de Zonas
    cy.intercept('POST', '**/api/zones/', {
      statusCode: 201,
      body: { id: 'zone-new', name: 'Invernadero Beta', crop_type: 'Tomate' }
    }).as('createZone');

    // Abrir modal de infraestructura
    cy.get('ion-button').contains('Configure Infrastructure').click();
    
    // Entrar en modo creación
    cy.get('ion-button').contains('Add New Zone').click();

    // Llenar formulario
    cy.get('ion-input[placeholder*="Greenhouse"]').find('input').type('Invernadero Beta', { force: true });
    cy.get('ion-input[placeholder*="Strawberry"]').find('input').type('Tomate Hidropónico', { force: true });

    cy.get('ion-button').contains('Create Infrastructure').click();

    cy.wait('@createZone');

    // Verificar que aparece en la lista
    cy.get('.zone-name').should('contain', 'Invernadero Beta');
    cy.get('.zone-crop').should('contain', 'Tomate');
  });
});
