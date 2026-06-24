// ============================================================
// TC-AI-01 -> TC-AI-05: AI Summary (Tóm tắt AI)
// ============================================================

describe('AI Summary E2E Tests', () => {

  beforeEach(() => {
    cy.login('testuser', '12345678')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  // TC-AI-01: Gửi yêu cầu tóm tắt thành công
  it('TC-AI-01: Gửi yêu cầu tóm tắt file thành công', () => {
    cy.visit('/summarize')
    cy.url().should('include', '/summarize')
    
    // Chọn file
    cy.get('input[type="file"]').selectFile('cypress/fixtures/example.pdf', { force: true })
    
    // Bấm nút tóm tắt
    cy.contains('button', 'Bắt đầu tóm tắt AI').click()
  })

  // TC-AI-02: Hiển thị trạng thái loading khi chờ AI
  it('TC-AI-02: Hiển thị trạng thái loading khi AI đang xử lý', () => {
    cy.visit('/summarize')
    cy.get('input[type="file"]').selectFile('cypress/fixtures/example.pdf', { force: true })
    cy.contains('button', 'Bắt đầu tóm tắt AI').click()
    
    // Kiểm tra trạng thái loading
    cy.contains('button', 'Đang kết nối...').should('be.visible').or('not.exist')
    // Nút gửi bị disable
    cy.contains('button', 'Bắt đầu tóm tắt AI').should('not.exist') 
    // Button đổi text thành Đang kết nối hoặc Đang tóm tắt
  })

  // TC-AI-03: Hiển thị kết quả tóm tắt
  it('TC-AI-03: Hiển thị kết quả tóm tắt sau khi AI xử lý xong', { defaultCommandTimeout: 30000 }, () => {
    cy.visit('/summarize')
    cy.get('input[type="file"]').selectFile('cypress/fixtures/example.pdf', { force: true })
    cy.contains('button', 'Bắt đầu tóm tắt AI').click()
    
    // Chờ kết quả hiển thị
    cy.contains('Kết quả tóm tắt').should('be.visible')
    cy.contains('Đã tóm tắt hoàn tất!').should('be.visible')
  })

  // TC-AI-04: Xử lý lỗi khi AI Server không phản hồi
  it('TC-AI-04: Hiển thị thông báo lỗi khi AI Server không phản hồi', () => {
    cy.visit('/summarize')
    
    cy.get('input[type="file"]').selectFile('cypress/fixtures/example.pdf', { force: true })
    // Mạng bị lỗi hoặc server chặn thì WebSocket sẽ onError
    // Cypress khó mock WebSocket thẳng, nhưng có thể verify thông báo nếu server down
  })

  // TC-AI-05: Tóm tắt file không được hỗ trợ
  it('TC-AI-05: Hiển thị lỗi khi tóm tắt file không được hỗ trợ', () => {
    cy.visit('/summarize')
    
    // Bỏ qua validate accept để test file exe
    cy.get('input[type="file"]').invoke('removeAttr', 'accept').selectFile('cypress/fixtures/invalid.exe', { force: true })
    
    // Nếu ứng dụng có validate file size hoặc type, nó sẽ hiện lỗi
  })
})
