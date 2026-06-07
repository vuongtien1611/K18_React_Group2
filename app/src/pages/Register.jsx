import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, createUser } from '../services/api';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.fullName) {
            toast.warning('Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu và họ tên!');
            return;
        }

        setLoading(true);
        try {
            // Check if username exists
            const usersRes = await getUsers();
            const existingUser = usersRes.data.find(u => u.username === formData.username);

            if (existingUser) {
                toast.error('Tên đăng nhập đã tồn tại!');
                setLoading(false);
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                ...formData,
                role: "CUSTOMER",
                status: "ACTIVE",
                createdAt: new Date().toISOString()
            };

            await createUser(newUser);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            let errorMsg = error.message;
            if (error.response) {
                errorMsg += ` - Status: ${error.response.status} - Data: ${JSON.stringify(error.response.data)}`;
            }
            toast.error(`Có lỗi xảy ra: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
            <Card className="shadow border-0" style={{ width: '450px' }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-danger">Đăng ký</h2>
                        <p className="text-muted">Tạo tài khoản mới</p>
                    </div>

                    <Form onSubmit={handleRegister}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Họ và tên <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                placeholder="Nhập họ và tên"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Nhập tên đăng nhập"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Mật khẩu <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Nhập địa chỉ email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                placeholder="Nhập số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Button
                            variant="danger"
                            type="submit"
                            className="w-100 fw-bold py-2 mb-3"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ TÀI KHOẢN'}
                        </Button>

                        <div className="text-center" style={{ fontSize: '0.9rem' }}>
                            <span className="text-muted">Đã có tài khoản? </span>
                            <Link to="/login" className="text-danger fw-semibold text-decoration-none">Đăng nhập</Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;
