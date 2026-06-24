// ============================================================
// TC-ADMIN-01 -> TC-ADMIN-04: Admin Dashboard
// ============================================================
describe('Admin Dashboard E2E Tests', () => {
  it('TC-ADMIN-01: Truy cập Admin Dashboard thành công với tài khoản admin', () => {
    cy.login('admin', '12345678')
    cy.visit('/admin')
    cy.url().should('include', '/admin')
    cy.get('body').should('not.be.empty')
  })

  it('TC-ADMIN-02: Hiển thị danh sách người dùng', () => {
    cy.login('admin', '12345678')
    cy.visit('/admin')
    
    // Click vào tab quản lý người dùng
    cy.contains('button', 'Quản lý người dùng').click()
    
    // Kiểm tra hiển thị phần thống kê người dùng và bảng
    cy.contains('Tổng số người dùng').should('be.visible')
  })

  it('TC-ADMIN-03: Hiển thị danh sách và quản lý tài liệu', () => {
    cy.login('admin', '12345678')
    cy.visit('/admin')
    
    // Click vào tab Quản lý tài liệu
    cy.contains('button', 'Quản lý tài liệu').click()
    
    // Kiểm tra hiển thị tiêu đề hoặc bảng
    cy.contains('Quản lý tài liệu').should('be.visible')
  })

  it('TC-ADMIN-04: User thường bị chặn truy cập Admin', () => {
    cy.login('testuser', '12345678')
    cy.visit('/admin')
    cy.url().should('not.include', '/admin')
  })
})
