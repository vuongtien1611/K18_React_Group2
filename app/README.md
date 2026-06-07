# CellphoneS Clone - Dự án Web Bán Hàng Công Nghệ

Đây là dự án E-commerce Clone giao diện và tính năng của hệ thống bán lẻ điện thoại CellphoneS. Dự án được phát triển bằng React ở phía Frontend và sử dụng `json-server` làm Mock REST API để lưu trữ, quản lý dữ liệu.

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **Thư viện chính:** React (phiên bản 18)
- **Công cụ build:** Vite (cho tốc độ khởi động và HMR cực nhanh)
- **Routing:** React Router DOM (quản lý phân trang và định tuyến ứng dụng)
- **Styling & UI Components:** Bootstrap & React Bootstrap
- **Icons:** React Icons
- **Thông báo:** React Toastify
- **Biểu đồ thống kê:** Recharts (cho trang quản trị Admin)
- **Trình soạn thảo văn bản:** React Quill (soạn thảo bài viết sản phẩm dạng Rich Text)
- **HTTP Client:** Axios (gửi các yêu cầu API lên server)

### Backend & Database (Mockup)
- Mock API Server: JSON Server (tự động tạo REST API từ file JSON)
- Database File: db.json (lưu trữ thông tin người dùng, sản phẩm, giỏ hàng, danh mục, đơn hàng)

---

## Các Tính Năng Chính

## Giao Diện Khách Hàng
1. **Trang chủ (Home):**
   - Banner trình chiếu quảng cáo.
   - Hiển thị danh mục sản phẩm nổi bật, sản phẩm mới nhất.
   - Phân nhóm sản phẩm theo hãng thương hiệu (Apple, Samsung, Oppo...).
2. **Tìm kiếm & Lọc (Search & Filtering):**
   - Thanh tìm kiếm thông minh trên Header tìm kiếm sản phẩm tức thì.
   - Lọc sản phẩm theo danh mục và thương hiệu.
3. **Chi tiết sản phẩm (Product Detail):**
   - Xem hình ảnh, thông số kỹ thuật chi tiết của sản phẩm.
   - Đọc bài viết giới thiệu/đánh giá chi tiết của sản phẩm.
4. **Giỏ hàng (Cart):**
   - Thêm sản phẩm vào giỏ hàng từ trang danh sách hoặc trang chi tiết.
   - Tăng/giảm số lượng sản phẩm trực tiếp trong giỏ hàng.
   - Xóa sản phẩm khỏi giỏ hàng.
   - Tự động tính toán tổng số tiền tạm tính.
5. **Đăng ký & Đăng nhập (Auth):**
   - Đăng ký tài khoản khách hàng mới.
   - Đăng nhập bảo mật (lưu thông tin đăng nhập).
   - Bảo vệ các tuyến đường yêu cầu đăng nhập (Protected Routes).
6. **Thanh toán & Đơn hàng (Checkout & Order):**
   - Điền thông tin giao hàng (họ tên, số điện thoại, địa chỉ).
   - Hiển thị tóm tắt đơn hàng trước khi xác nhận.
   - **Giả lập thanh toán qua mã QR (VietQR):** Hiển thị mã QR ngân hàng động để khách hàng thanh toán chuyển khoản.
   - **Đơn hàng của tôi (My Orders):** Theo dõi lịch sử đơn hàng và trạng thái đơn hàng của cá nhân (Chờ duyệt, Đang giao, Đã giao, Đã hủy).

### 🛠️ Giao Diện Quản Trị (Admin Panel)
Trang quản trị độc lập dành cho Admin quản lý cửa hàng:
1. **Bảng điều khiển (Dashboard):**
   - Biểu đồ trực quan (sử dụng Recharts) thống kê doanh thu, số lượng đơn hàng.
   - Thống kê các sản phẩm/danh mục bán chạy.
2. **Quản lý sản phẩm (Product CRUD):**
   - Xem danh sách sản phẩm, tìm kiếm và phân trang.
   - Thêm mới sản phẩm, sửa đổi thông tin sản phẩm (tên, giá, ảnh, danh mục, thương hiệu, trạng thái nổi bật).
   - Xóa mềm (soft delete) sản phẩm.
3. **Quản lý danh mục (Category CRUD):**
   - Thêm, sửa, xóa các danh mục sản phẩm.
4. **Quản lý đơn hàng (Order Management):**
   - Xem danh sách toàn bộ các đơn đặt hàng từ khách hàng.
   - Cập nhật trạng thái xử lý đơn hàng (Chờ xác nhận -> Đã xác nhận -> Đang giao -> Đã giao / Đã hủy).
5. **Quản lý bài viết sản phẩm (Article Management):**
   - Viết bài mô tả sản phẩm và chỉnh sửa thông số kỹ thuật chi tiết bằng trình soạn thảo React Quill chuyên nghiệp.
