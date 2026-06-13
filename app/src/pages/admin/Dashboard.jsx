import { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getOrders } from '../../services/api';
import axios from 'axios';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          getOrders(),
          axios.get('http://localhost:3000/users') // Direct axios call if getUsers is not in api.js
        ]);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.finalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const totalCustomers = users.filter(u => u.role === 'CUSTOMER').length;

  // Mock chart data based on existing orders (all orders currently have same createdAt, but we aggregate by status for demo)
  const orderStatusData = [
    { name: 'PENDING', count: pendingOrders },
    { name: 'PROCESSING', count: orders.filter(o => o.status === 'PROCESSING').length },
    { name: 'SHIPPED', count: orders.filter(o => o.status === 'SHIPPED').length },
    { name: 'COMPLETED', count: orders.filter(o => o.status === 'COMPLETED').length },
    { name: 'CANCELLED', count: orders.filter(o => o.status === 'CANCELLED').length },
  ];

  // Daily revenue mock
  const revenueData = [
    { date: '18/05', revenue: 15000000 },
    { date: '19/05', revenue: 20000000 },
    { date: '20/05', revenue: 12000000 },
    { date: '21/05', revenue: 28000000 },
    { date: '22/05', revenue: totalRevenue }, // Use today's data as the last point
  ];

  return (
    <div>
      <h2 className="mb-4 fw-bold">Tổng quan</h2>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <Card.Body>
              <h6>Tổng doanh thu</h6>
              <h3 className="mb-0">{formatPrice(totalRevenue)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-success text-white">
            <Card.Body>
              <h6>Tổng đơn hàng</h6>
              <h3 className="mb-0">{totalOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-warning text-dark">
            <Card.Body>
              <h6>Đơn chờ xử lý</h6>
              <h3 className="mb-0">{pendingOrders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-info text-white">
            <Card.Body>
              <h6>Khách hàng</h6>
              <h3 className="mb-0">{totalCustomers}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-4 fw-bold">Biểu đồ doanh thu 7 ngày qua</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
                    <Tooltip formatter={(value) => formatPrice(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-4 fw-bold">Trạng thái đơn hàng</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Số lượng" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

