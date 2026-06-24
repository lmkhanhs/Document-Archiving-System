// ============================================================
// TC-NAV-01 -> TC-NAV-05: Navigation & Security
// ============================================================
describe('Navigation & Security E2E Tests', () => {
  it('TC-NAV-01: Chặn truy cập khi chưa đăng nhập', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('TC-NAV-02: Điều hướng trang Settings', () => {
    cy.login('testuser', '12345678')
    cy.visit('/')
    
    // Sử dụng Sidebar để điều hướng
    cy.contains('button', 'Cài đặt').click()
    
    cy.url().should('include', '/settings')
    cy.get('body').should('not.be.empty')
  })

  it('TC-NAV-03: Điều hướng trang Trash', () => {
    cy.login('testuser', '12345678')
    cy.visit('/')
    
    // Sử dụng Sidebar để điều hướng
    cy.contains('button', 'Thùng rác').click()
    
    cy.url().should('include', '/trash')
    cy.get('body').should('not.be.empty')
  })

  it('TC-NAV-04: User thường bị chặn truy cập Admin', () => {
    cy.login('testuser', '12345678')
    cy.visit('/admin')
    cy.url().should('not.include', '/admin')
  })

  it('TC-NAV-05: Redirect sau khi đăng nhập', () => {
    cy.clearLocalStorage()
    cy.visit('/settings')
    cy.url().should('include', '/login')
    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    // TODO: Kiểm tra redirect về /settings nếu app hỗ trợ
  })
})
