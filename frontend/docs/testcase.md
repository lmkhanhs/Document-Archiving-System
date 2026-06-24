# Tài Liệu Quản Lý Test Case - Frontend

## 1. Mục đích tài liệu

Tài liệu này mô tả toàn bộ các kịch bản kiểm thử (Test Cases) cho phần Frontend của hệ thống **Quản lý tài liệu tích hợp AI tóm tắt văn bản**. Frontend được xây dựng bằng ReactJS và kiểm thử End-to-End (E2E) bằng Cypress.

File này **chỉ dùng để mô tả test case**, không chứa code Cypress. Lập trình viên sẽ dựa vào tài liệu này để triển khai code kiểm thử tương ứng.

---

## 2. Thông tin test chung

| Hạng mục | Giá trị |
| :--- | :--- |
| Công cụ kiểm thử | Cypress |
| Framework Frontend | ReactJS (Vite) |
| URL môi trường Dev | `http://localhost:5173` |
| URL Login | `/login` |
| URL Home | `/` |
| URL Trash | `/trash` |
| URL Settings | `/settings` |
| URL Admin | `/admin` |
| Username hợp lệ | `testuser` |
| Password hợp lệ | `12345678` |
| Username admin | `admin` |
| Password admin | `12345678` |
| Password sai | `wrongpassword` |
| Tên thư mục test | `Cypress Test Folder` |
| File upload mẫu | `cypress/fixtures/example.pdf` |
| File không hợp lệ | `cypress/fixtures/invalid.exe` |

---

## 3. Quy ước đặt tên Test Case ID

| Prefix | Nhóm chức năng | Ví dụ |
| :--- | :--- | :--- |
| `TC-AUTH` | Authentication (Xác thực) | TC-AUTH-01 |
| `TC-DOC` | Document Management (Quản lý tài liệu) | TC-DOC-01 |
| `TC-TRASH` | Trash (Thùng rác) | TC-TRASH-01 |
| `TC-AI` | AI Summary (Tóm tắt AI) | TC-AI-01 |
| `TC-HIS` | Summary History (Lịch sử tóm tắt) | TC-HIS-01 |
| `TC-NAV` | Navigation & Security (Điều hướng & Bảo mật) | TC-NAV-01 |
| `TC-ADMIN` | Admin Dashboard (Trang quản trị) | TC-ADMIN-01 |

---

## 4. Danh sách Test Case

### 4.1. Authentication (Xác thực)

| Test Case ID | Scenario | Preconditions | Steps | Input Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-AUTH-01 | Đăng nhập thành công | Chưa đăng nhập, DB có tài khoản `testuser` | 1. Mở `/login`<br>2. Nhập username<br>3. Nhập password<br>4. Click nút Login | Username: `testuser`<br>Password: `12345678` | Chuyển hướng về `/`, `accessToken` xuất hiện trong Local Storage, hiển thị thông báo thành công | High |
| TC-AUTH-02 | Đăng nhập thất bại - sai mật khẩu | Chưa đăng nhập | 1. Mở `/login`<br>2. Nhập username đúng<br>3. Nhập password sai<br>4. Click nút Login | Username: `testuser`<br>Password: `wrongpassword` | Ở lại trang `/login`, Snackbar hiển thị "Đăng nhập thất bại" | High |
| TC-AUTH-03 | Đăng nhập thất bại - bỏ trống form | Chưa đăng nhập | 1. Mở `/login`<br>2. Không nhập gì<br>3. Click nút Login | Username: (trống)<br>Password: (trống) | Ở lại trang `/login`, Snackbar hiển thị "Vui lòng nhập đầy đủ thông tin" | High |
| TC-AUTH-04 | Đăng nhập thất bại - chỉ nhập username | Chưa đăng nhập | 1. Mở `/login`<br>2. Nhập username<br>3. Bỏ trống password<br>4. Click nút Login | Username: `testuser`<br>Password: (trống) | Ở lại trang `/login`, hiển thị thông báo lỗi yêu cầu nhập đầy đủ | Medium |
| TC-AUTH-05 | Đăng xuất thành công | Đã đăng nhập thành công | 1. Click avatar/menu người dùng<br>2. Click "Đăng xuất" | N/A | Chuyển hướng về `/login`, `accessToken` bị xóa khỏi Local Storage | High |

---

### 4.2. Document Management (Quản lý tài liệu)

| Test Case ID | Scenario | Preconditions | Steps | Input Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-DOC-01 | Hiển thị danh sách tài liệu | Đã đăng nhập, có ít nhất 1 file trong DB | 1. Truy cập trang `/` | N/A | Danh sách tài liệu/thư mục hiển thị đúng trên giao diện | High |
| TC-DOC-02 | Tạo thư mục mới thành công | Đã đăng nhập | 1. Click nút tạo thư mục<br>2. Nhập tên thư mục<br>3. Click xác nhận | Tên thư mục: `Cypress Test Folder` | Thư mục mới xuất hiện trên giao diện, hiển thị thông báo thành công | High |
| TC-DOC-03 | Tạo thư mục thất bại - bỏ trống tên | Đã đăng nhập | 1. Click nút tạo thư mục<br>2. Bỏ trống tên<br>3. Click xác nhận | Tên thư mục: (trống) | Hiển thị lỗi validation yêu cầu nhập tên thư mục | Medium |
| TC-DOC-04 | Upload file thành công | Đã đăng nhập | 1. Click chức năng Upload<br>2. Chọn file hợp lệ<br>3. Xác nhận upload | File: `cypress/fixtures/example.pdf` | File xuất hiện trong danh sách, thông báo "Tải lên thành công" | High |
| TC-DOC-05 | Upload file thất bại - file không hợp lệ | Đã đăng nhập | 1. Click chức năng Upload<br>2. Chọn file .exe | File: `cypress/fixtures/invalid.exe` | Hiển thị thông báo lỗi định dạng không được phép | Medium |
| TC-DOC-06 | Xem trước tài liệu | Đã đăng nhập, có ít nhất 1 file | 1. Click vào tên file trong danh sách | N/A | Mở giao diện xem trước file (PDF viewer, ảnh, hoặc text) | High |
| TC-DOC-07 | Tìm kiếm tài liệu | Đã đăng nhập, có ít nhất 1 file | 1. Nhập từ khóa vào ô tìm kiếm<br>2. Kiểm tra kết quả | Từ khóa: `example` | Danh sách lọc hiển thị đúng các file có chứa từ khóa | Medium |
| TC-DOC-08 | Xóa mềm file vào thùng rác | Đã đăng nhập, có file tồn tại | 1. Mở menu context của file<br>2. Chọn "Xóa"<br>3. Xác nhận | Target: file cần xóa | File biến mất khỏi danh sách chính, xuất hiện trong Trash | High |

---

### 4.3. Trash (Thùng rác)

| Test Case ID | Scenario | Preconditions | Steps | Input Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-TRASH-01 | Hiển thị danh sách đã xóa | Đã đăng nhập, có ít nhất 1 file đã xóa mềm | 1. Truy cập trang `/trash` | N/A | Danh sách file/thư mục đã xóa hiển thị đúng | High |
| TC-TRASH-02 | Khôi phục tài liệu đã xóa | Đã đăng nhập, đang ở trang `/trash` | 1. Chọn file cần khôi phục<br>2. Click "Khôi phục" | Target: file đã xóa | File biến mất khỏi Trash, xuất hiện lại ở danh sách chính | High |
| TC-TRASH-03 | Xóa vĩnh viễn tài liệu | Đã đăng nhập, đang ở trang `/trash` | 1. Chọn file cần xóa vĩnh viễn<br>2. Click "Xóa vĩnh viễn"<br>3. Xác nhận | Target: file đã xóa | File biến mất hoàn toàn khỏi Trash, không thể khôi phục | High |
| TC-TRASH-04 | Thùng rác trống | Đã đăng nhập, không có file nào trong thùng rác | 1. Truy cập trang `/trash` | N/A | Hiển thị trạng thái trống hoặc thông báo "Không có tài liệu nào trong thùng rác" | Low |

---

### 4.4. AI Summary (Tóm tắt AI)

| Test Case ID | Scenario | Preconditions | Steps | Input Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-AI-01 | Gửi yêu cầu tóm tắt thành công | Đã đăng nhập, có file hợp lệ, AI Server đang hoạt động | 1. Chọn file cần tóm tắt<br>2. Click nút "Tóm tắt"<br>3. Chờ kết quả | Target: file PDF/text hợp lệ | Hiển thị trạng thái loading, sau đó hiển thị nội dung tóm tắt | High |
| TC-AI-02 | Hiển thị trạng thái loading khi chờ AI | Đã đăng nhập, AI Server đang xử lý | 1. Gửi yêu cầu tóm tắt<br>2. Quan sát giao diện trong khi chờ | N/A | Hiển thị spinner/loading indicator, nút gửi bị disable | Medium |
| TC-AI-03 | Hiển thị kết quả tóm tắt | Đã đăng nhập, đã gửi yêu cầu tóm tắt thành công | 1. Chờ AI xử lý xong<br>2. Kiểm tra nội dung kết quả | N/A | Kết quả tóm tắt hiển thị dạng text, có thể cuộn đọc | High |
| TC-AI-04 | Xử lý lỗi khi AI Server không phản hồi | Đã đăng nhập, AI Server bị tắt hoặc timeout | 1. Chọn file cần tóm tắt<br>2. Click nút "Tóm tắt"<br>3. Chờ timeout | N/A | Hiển thị thông báo lỗi (ví dụ: "Không thể kết nối AI Server"), giao diện không bị treo | High |
| TC-AI-05 | Tóm tắt file không được hỗ trợ | Đã đăng nhập, file không phải dạng text/PDF | 1. Chọn file ảnh hoặc file nhị phân<br>2. Click nút "Tóm tắt" | Target: file .png hoặc .zip | Hiển thị thông báo lỗi định dạng không hỗ trợ | Medium |

---

### 4.5. Summary History (Lịch sử tóm tắt)

| Test Case ID | Scenario | Preconditions | Steps | Input Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-HIS-01 | Hiển thị danh sách lịch sử tóm tắt | Đã đăng nhập, có ít nhất 1 bản tóm tắt đã thực hiện | 1. Truy cập trang lịch sử tóm tắt | N/A | Danh sách bản tóm tắt hiển thị đúng (tên file, ngày, trạng thái) | High |
| TC-HIS-02 | Xem chi tiết bản tóm tắt | Đã đăng nhập, có bản tóm tắt trong danh sách | 1. Click vào một bản tóm tắt trong danh sách | N/A | Hiển thị chi tiết: nội dung gốc, nội dung tóm tắt, thông tin file, thời gian | High |
| TC-HIS-03 | Lọc lịch sử theo trạng thái | Đã đăng nhập, có nhiều bản tóm tắt | 1. Chọn bộ lọc trạng thái (thành công/thất bại)<br>2. Kiểm tra kết quả | Trạng thái: "Thành công" | Danh sách chỉ hiển thị các bản tóm tắt có trạng thái tương ứng | Medium |
| TC-HIS-04 | Không có lịch sử tóm tắt | Đã đăng nhập, chưa từng tóm tắt file nào | 1. Truy cập trang lịch sử tóm tắt | N/A | Hiển thị trạng thái trống hoặc thông báo "Chưa có lịch sử tóm tắt" | Low |

---

### 4.6. Navigation & Security (Điều hướng & Bảo mật)

| Test Case ID | Scenario | Preconditions | Steps | Input Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-NAV-01 | Chặn truy cập khi chưa đăng nhập | Chưa đăng nhập, Local Storage trống | 1. Xóa Local Storage<br>2. Truy cập `/` | N/A | Tự động redirect về `/login` | High |
| TC-NAV-02 | Điều hướng trang Settings | Đã đăng nhập | 1. Click menu "Settings" trên Sidebar | N/A | URL chuyển sang `/settings`, nội dung trang Settings hiển thị | Medium |
| TC-NAV-03 | Điều hướng trang Trash | Đã đăng nhập | 1. Click menu "Trash" trên Sidebar | N/A | URL chuyển sang `/trash`, nội dung trang Trash hiển thị | Medium |
| TC-NAV-04 | User thường truy cập trang Admin | Đã đăng nhập với tài khoản `testuser` (không phải admin) | 1. Truy cập trực tiếp URL `/admin` | N/A | Bị chặn hoặc redirect về `/`, không hiển thị nội dung admin | High |
| TC-NAV-05 | Redirect về trang trước sau khi đăng nhập | Chưa đăng nhập | 1. Truy cập `/settings` khi chưa login<br>2. Bị redirect về `/login`<br>3. Đăng nhập thành công | Username: `testuser`<br>Password: `12345678` | Sau khi login, tự động chuyển về `/settings` (trang trước đó) | Low |

---

### 4.7. Admin Dashboard (Trang quản trị)

| Test Case ID | Scenario | Preconditions | Steps | Input Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-ADMIN-01 | Truy cập Admin Dashboard thành công | Đã đăng nhập với tài khoản admin | 1. Đăng nhập bằng tài khoản admin<br>2. Truy cập `/admin` | Username: `admin`<br>Password: `12345678` | Hiển thị trang Admin Dashboard với thống kê tổng quan | High |
| TC-ADMIN-02 | Hiển thị danh sách người dùng | Đã đăng nhập admin, có user trong hệ thống | 1. Truy cập `/admin`<br>2. Mở mục quản lý người dùng | N/A | Danh sách người dùng hiển thị đúng (tên, email, trạng thái) | High |
| TC-ADMIN-03 | Hiển thị thống kê tài liệu | Đã đăng nhập admin | 1. Truy cập `/admin`<br>2. Xem khu vực thống kê | N/A | Hiển thị số liệu: tổng file, tổng dung lượng, số user | Medium |
| TC-ADMIN-04 | User thường truy cập Admin | Đã đăng nhập với tài khoản `testuser` | 1. Truy cập trực tiếp `/admin` | N/A | Bị chặn truy cập, redirect về `/` hoặc hiển thị thông báo "Không có quyền" | High |

---

## 5. Gợi ý cấu trúc thư mục Cypress

```
frontend/
├── cypress/
│   ├── e2e/
│   │   ├── auth.cy.js          # TC-AUTH-01 -> TC-AUTH-05
│   │   ├── document.cy.js      # TC-DOC-01  -> TC-DOC-08
│   │   ├── trash.cy.js         # TC-TRASH-01 -> TC-TRASH-04
│   │   ├── ai-summary.cy.js    # TC-AI-01   -> TC-AI-05
│   │   ├── history.cy.js       # TC-HIS-01  -> TC-HIS-04
│   │   ├── navigation.cy.js    # TC-NAV-01  -> TC-NAV-05
│   │   └── admin.cy.js         # TC-ADMIN-01 -> TC-ADMIN-04
│   ├── fixtures/
│   │   ├── example.pdf
│   │   ├── example.json
│   │   └── invalid.exe
│   └── support/
│       ├── commands.js
│       └── e2e.js
├── docs/
│   └── testcase.md             # File này
└── cypress.config.js
```

---

## 6. Ghi chú khi triển khai test

- **Dữ liệu test**: Trước khi chạy test, đảm bảo database có tài khoản `testuser` (user thường) và `admin` (quản trị viên) với mật khẩu `12345678`.
- **Selector ưu tiên**: Khi viết code Cypress, ưu tiên sử dụng `data-testid`, `id`, `name` thay vì class CSS để tránh bị ảnh hưởng khi thay đổi giao diện.
- **Custom Command**: Sử dụng `cy.login(username, password)` đã định nghĩa trong `commands.js` để tránh lặp code đăng nhập trong mỗi test.
- **Thứ tự chạy test**: Nên chạy Authentication trước, sau đó đến Document Management, Trash, AI Summary, và cuối cùng là Admin.
- **Trạng thái độc lập**: Mỗi test case nên độc lập, sử dụng `beforeEach()` để reset trạng thái (xóa Local Storage, đăng nhập lại).
- **AI Server**: Các test case liên quan đến AI Summary (TC-AI) yêu cầu AI Server phải đang hoạt động. Nếu không, các test này sẽ chủ động kiểm tra xử lý lỗi.
- **Timeout**: Một số test case (đặc biệt TC-AI) có thể cần tăng timeout mặc định vì thời gian xử lý của AI Server lâu hơn bình thường.
