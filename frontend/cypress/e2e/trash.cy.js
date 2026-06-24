// ============================================================
// TC-TRASH-01 -> TC-TRASH-04: Trash (Thùng rác)
// ============================================================

describe('Trash E2E Tests', () => {

  beforeEach(() => {
    cy.login('testuser', '12345678')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  // TC-TRASH-01: Hiển thị danh sách đã xóa
  it('TC-TRASH-01: Hiển thị danh sách tài liệu đã xóa trong thùng rác', () => {
    cy.visit('/trash')
    cy.url().should('include', '/trash')
    cy.get('body').should('not.be.empty')
    // Kiểm tra hiển thị text Tổng số mục
    cy.contains(/Tổng: \d+ mục/).should('be.visible')
  })

  // TC-TRASH-02: Khôi phục tài liệu đã xóa
  it('TC-TRASH-02: Khôi phục tài liệu đã xóa từ thùng rác', () => {
    cy.visit('/trash')
    
    // Đợi danh sách load
    cy.wait(500)

    cy.get('body').then($body => {
      if ($body.find('table tbody tr').length > 0) {
        // Có item -> Mở context menu (nhấn chuột phải) của file đầu tiên
        cy.get('table tbody tr').first().rightclick()
        // Chọn Khôi phục
        cy.contains('button', 'Khôi phục').click()
        // Kiểm tra thông báo
        cy.contains('Khôi phục thành công').should('be.visible')
      }
    })
  })

  // TC-TRASH-03: Xóa vĩnh viễn tài liệu
  it('TC-TRASH-03: Xóa vĩnh viễn tài liệu khỏi thùng rác', () => {
    cy.visit('/trash')
    
    // Đợi danh sách load
    cy.wait(500)

    cy.get('body').then($body => {
      if ($body.find('table tbody tr').length > 0) {
        // Có item -> Mở context menu
        cy.get('table tbody tr').first().rightclick()
        // Chọn Xóa vĩnh viễn
        cy.contains('button', 'Xóa vĩnh viễn').click()
        // Kiểm tra thông báo
        cy.contains('Đã xóa vĩnh viễn').should('be.visible')
      }
    })
  })

  // TC-TRASH-04: Thùng rác trống
  it('TC-TRASH-04: Hiển thị trạng thái trống khi thùng rác không có file', () => {
    cy.visit('/trash')
    // Nếu không có file thì sẽ hiện 'Thùng rác trống'
    cy.get('body').then($body => {
      if ($body.find('table tbody tr').length === 0) {
        cy.contains('Thùng rác trống').should('be.visible')
        cy.contains('Không có file hoặc thư mục nào đã xóa.').should('be.visible')
      }
    })
  })
})
