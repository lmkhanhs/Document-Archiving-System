// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  
  // Chờ cho đến khi URL thay đổi (đăng nhập thành công và bị chuyển hướng khỏi trang /login)
  // Việc này giúp tránh trường hợp Cypress chạy ngay lệnh cy.visit('/admin') khi API login còn đang chạy
  cy.url().should('not.include', '/login')
})
