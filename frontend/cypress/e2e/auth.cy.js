// ============================================================
// TC-AUTH-01 -> TC-AUTH-05: Authentication (Xác thực)
// ============================================================

describe('Authentication E2E Tests', () => {

  beforeEach(() => {
    cy.clearLocalStorage()
  })

  // TC-AUTH-01: Đăng nhập thành công
  it('TC-AUTH-01: Đăng nhập thành công với tài khoản hợp lệ', () => {
    cy.login('testuser', '12345678')

    // Chuyển hướng về trang chủ /
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // accessToken xuất hiện trong Local Storage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('accessToken')).to.exist
    })
  })

  // TC-AUTH-02: Đăng nhập thất bại - sai mật khẩu
  it('TC-AUTH-02: Đăng nhập thất bại khi nhập sai mật khẩu', () => {
    cy.visit('/login')
    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    // Snackbar hiển thị lỗi
    cy.get('.MuiAlert-message').should('contain', 'Đăng nhập thất bại')

    // Vẫn ở trang /login
    cy.url().should('include', '/login')
  })

  // TC-AUTH-03: Đăng nhập thất bại - bỏ trống form
  it('TC-AUTH-03: Đăng nhập thất bại khi bỏ trống form', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').click()

    // Snackbar hiển thị yêu cầu nhập đầy đủ
    cy.get('.MuiAlert-message').should('contain', 'Vui lòng nhập đầy đủ thông tin')
    cy.url().should('include', '/login')
  })

  // TC-AUTH-04: Đăng nhập thất bại - chỉ nhập username
  it('TC-AUTH-04: Đăng nhập thất bại khi chỉ nhập username, bỏ trống password', () => {
    cy.visit('/login')
    cy.get('input[name="username"]').type('testuser')
    // Bỏ trống password
    cy.get('button[type="submit"]').click()

    // Hiển thị thông báo lỗi yêu cầu nhập đầy đủ
    cy.get('.MuiAlert-message').should('contain', 'Vui lòng nhập đầy đủ thông tin')
    cy.url().should('include', '/login')
  })

  // TC-AUTH-05: Đăng xuất thành công
  it('TC-AUTH-05: Đăng xuất thành công sau khi đã đăng nhập', () => {
    // Đăng nhập trước
    cy.login('testuser', '12345678')
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Click nút đăng xuất trên Header
    cy.get('[data-testid="logout-btn"]').click()

    // Sau khi đăng xuất: chuyển hướng về /login, accessToken bị xóa
    cy.url().should('include', '/login')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('accessToken')).to.be.null
    })
  })
})
