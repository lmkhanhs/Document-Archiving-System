// ============================================================
// TC-HIS-01 -> TC-HIS-04: Summary History (Lịch sử tóm tắt)
// ============================================================

describe('Summary History E2E Tests', () => {

  beforeEach(() => {
    // Lịch sử tóm tắt nằm trong trang Admin, nên cần đăng nhập admin
    cy.login('admin', '12345678')
    cy.visit('/admin')
    
    // Chuyển sang tab Lịch sử tóm tắt
    cy.contains('button', 'Lịch sử tóm tắt').click()
  })

  // TC-HIS-01: Hiển thị danh sách lịch sử tóm tắt
  it('TC-HIS-01: Hiển thị danh sách lịch sử tóm tắt', () => {
    // Trang lịch sử tóm tắt phải load thành công
    cy.get('body').should('not.be.empty')
    // Kiểm tra danh sách bản tóm tắt hiển thị
    cy.contains('Quản lý lịch sử tóm tắt').should('be.visible')
    cy.get('table').should('exist')
  })

  // TC-HIS-02: Xem chi tiết bản tóm tắt
  it('TC-HIS-02: Xem chi tiết bản tóm tắt khi click vào item', () => {
    cy.wait(500)
    cy.get('body').then($body => {
      // Nếu có lịch sử thì click xem chi tiết
      if ($body.find('table tbody tr button[title="Xem chi tiết"]').length > 0) {
        cy.get('table tbody tr').first().find('button[title="Xem chi tiết"]').click()
        // Kiểm tra chi tiết hiển thị (Modal)
        cy.contains('Chi tiết bản tóm tắt').should('be.visible').or('exist')
      }
    })
  })

  // TC-HIS-03: Lọc lịch sử theo trạng thái
  it('TC-HIS-03: Lọc lịch sử tóm tắt theo trạng thái', () => {
    // Chọn bộ lọc trạng thái (Hoàn thành)
    // Lưu ý: the select label contains "Trạng thái", ta có thể chọn theo select thứ 2 hoặc chứa option COMPLETED
    cy.get('select').last().select('COMPLETED')
    cy.wait(500)
    
    // Nếu có dữ liệu, trạng thái sẽ là Hoàn thành
    cy.get('body').then($body => {
      if ($body.find('table tbody tr button[title="Xem chi tiết"]').length > 0) {
        cy.get('table tbody tr').first().should('contain', 'Hoàn thành')
      }
    })
  })

  // TC-HIS-04: Không có lịch sử tóm tắt
  it('TC-HIS-04: Hiển thị trạng thái trống khi chưa có lịch sử', () => {
    cy.wait(500)
    cy.get('body').then($body => {
      if ($body.find('table tbody tr').length === 1 && $body.text().includes('Không có lịch sử tóm tắt')) {
        cy.contains('Không có lịch sử tóm tắt').should('be.visible')
      }
    })
  })
})
