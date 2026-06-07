import { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers } from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.warning('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const res = await getUsers();
            const user = res.data.find(u => u.username === username && u.password === password);

            if (user) {
                toast.success(`Đăng nhập thành công! Chào mừng ${user.fullName}`);
                // Save user to localStorage
                localStorage.setItem('user', JSON.stringify(user));

                if (user.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                toast.error('Sai tài khoản hoặc mật khẩu!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow border-0" style={{ width: '400px' }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-danger">Đăng nhập</h2>
                        <p className="text-muted">Chào mừng trở lại với VDT Mobile</p>
                    </div>

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Tên đăng nhập</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button
                            variant="danger"
                            type="submit"
                            className="w-100 fw-bold py-2 mb-3"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                        </Button>

                        <div className="text-center" style={{ fontSize: '0.9rem' }}>
                            <span className="text-muted">Chưa có tài khoản? </span>
                            <Link to="/register" className="text-danger fw-semibold text-decoration-none">Đăng ký ngay</Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;
