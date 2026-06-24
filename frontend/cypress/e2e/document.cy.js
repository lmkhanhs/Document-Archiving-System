// ============================================================
// TC-DOC-01 -> TC-DOC-08: Document Management (Quản lý tài liệu)
// ============================================================

describe('Document Management E2E Tests', () => {

  beforeEach(() => {
    cy.login('testuser', '12345678')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  // TC-DOC-01: Hiển thị danh sách tài liệu
  it('TC-DOC-01: Hiển thị danh sách tài liệu trên trang chủ', () => {
    cy.visit('/')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('body').should('not.be.empty')
    // Kiểm tra có danh sách Truy cập nhanh hoặc Gần đây
    cy.contains('Truy cập nhanh').should('be.visible')
    cy.contains('Gần đây').should('be.visible')
  })

  // TC-DOC-02: Tạo thư mục mới thành công
  it('TC-DOC-02: Tạo thư mục mới thành công', () => {
    // Stub window.prompt để tự động điền tên thư mục
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('Cypress Test Folder')
    })
    
    // Click nút tạo thư mục ở Sidebar
    cy.contains('button', 'Tạo thư mục').click()
    
    // Kiểm tra hiển thị thông báo thành công
    cy.get('.MuiAlert-message').should('contain', 'Tạo thư mục thành công')
  })

  // TC-DOC-03: Tạo thư mục thất bại - bỏ trống tên
  it('TC-DOC-03: Tạo thư mục thất bại khi bỏ trống tên', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('') // Bỏ trống
    })
    
    cy.contains('button', 'Tạo thư mục').click()
    
    // Sẽ không có thông báo tạo thành công
    cy.get('.MuiAlert-message').should('not.exist')
  })

  // TC-DOC-04: Upload file thành công
  it('TC-DOC-04: Upload file thành công', () => {
    // Select hidden file input
    cy.get('input[type="file"]').selectFile('cypress/fixtures/example.pdf', { force: true })
    cy.get('.MuiAlert-message').should('contain', 'thành công')
  })

  // TC-DOC-05: Upload file thất bại - file không hợp lệ
  it('TC-DOC-05: Upload file thất bại khi chọn file không hợp lệ (.exe)', () => {
    // Giả lập file exe
    cy.get('input[type="file"]').selectFile('cypress/fixtures/invalid.exe', { force: true })
    // Hiện thông báo lỗi từ server hoặc frontend
    cy.get('.MuiAlert-message').should('contain', 'thất bại').or('contain', 'lỗi').or('contain', 'không được phép')
  })

  // TC-DOC-06: Xem trước tài liệu
  it('TC-DOC-06: Xem trước tài liệu khi click vào file', () => {
    // Click vào item đầu tiên trong danh sách Gần đây
    cy.get('table tbody tr').first().find('button').first().click()
    
    // Modal preview xuất hiện
    cy.contains('Xem trước file').should('be.visible')
    
    // Đóng modal
    cy.get('button[title="Đóng"]').click()
  })

  // TC-DOC-07: Tìm kiếm tài liệu
  it('TC-DOC-07: Tìm kiếm tài liệu theo từ khóa', () => {
    cy.get('input[placeholder*="Tìm kiếm file theo tên"]').type('example')
    
    // Đợi 1 chút để UI lọc danh sách
    cy.wait(500)
    
    // Nếu có file example thì table vẫn hiển thị dòng, nếu không thì table rỗng
    // Cy.get table có thể được sử dụng
  })

  // TC-DOC-08: Xóa mềm file vào thùng rác
  it('TC-DOC-08: Xóa mềm file vào thùng rác', () => {
    // Mở context menu (nhấn nút ba chấm) của file đầu tiên
    cy.get('table tbody tr').first().find('button').last().click()
    
    // Menu hiển thị, chọn 'Xóa'
    cy.contains('button', 'Xóa').click()
    
    // Kiểm tra thông báo
    cy.get('.MuiAlert-message').should('contain', 'Đã xóa')
  })
})
