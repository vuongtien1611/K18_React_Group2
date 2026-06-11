import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Form, Button, Nav, Dropdown, Offcanvas } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSearch } from 'react-icons/fa';
import { getProducts, getCategories } from '../services/api';

const Header = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredResults, setFilteredResults] = useState({ products: [], categories: [] });
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([getProducts(), getCategories()]);
        setProducts(pRes.data.filter(p => !p.isDeleted));
        setCategories(cRes.data.filter(c => !c.isDeleted));
      } catch (error) {
        console.error("Error fetching data for search:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResults({ products: [], categories: [] });
      setShowResults(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matchedProducts = products.filter(p => p.name.toLowerCase().includes(term));
    const matchedCategories = categories.filter(c => c.name.toLowerCase().includes(term));

    setFilteredResults({
      products: matchedProducts.slice(0, 6),
      categories: matchedCategories.slice(0, 3)
    });
    setShowResults(true);
  }, [searchTerm, products, categories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Navbar bg="danger" variant="dark" expand="lg" sticky="top" className="py-2">
      <Container className="d-flex align-items-center flex-nowrap">
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 fs-lg-3 me-2 text-nowrap">
          VDT Mobile
        </Navbar.Brand>

        <Form
          className="d-flex flex-grow-1 position-relative mx-1 mx-lg-4"
          style={{ maxWidth: '600px' }}
          ref={searchRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (filteredResults.products.length > 0) {
              navigate(`/product/${filteredResults.products[0].slug}`);
              setShowResults(false);
              setSearchTerm('');
            } else if (filteredResults.categories.length > 0) {
              navigate(`/category/${filteredResults.categories[0].slug}`);
              setShowResults(false);
              setSearchTerm('');
            }
          }}
        >
          <Form.Control
            type="search"
            placeholder="Tìm kiếm..."
            className="rounded-pill px-3 pe-4 px-lg-4 pe-lg-5"
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchTerm.trim() !== '') setShowResults(true);
            }}
          />
          <Button variant="link" type="submit" className="position-absolute end-0 text-dark text-decoration-none" style={{ right: '5px', padding: '0.375rem 0.5rem' }}>
            <FaSearch />
          </Button>

          {showResults && (filteredResults.products.length > 0 || filteredResults.categories.length > 0) && (
            <div className="position-absolute w-100 bg-white border rounded shadow-sm text-dark" style={{ top: '100%', left: 0, zIndex: 1000, marginTop: '5px', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredResults.categories.length > 0 && (
                <div className="p-2 border-bottom">
                  <div className="text-muted small fw-bold mb-1 px-2">DANH MỤC</div>
                  {filteredResults.categories.map(c => (
                    <div
                      key={`cat-${c.id}`}
                      className="px-2 py-1 text-dark cursor-pointer rounded"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        navigate(`/category/${c.slug}`);
                        setShowResults(false);
                        setSearchTerm('');
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
              {filteredResults.products.length > 0 && (
                <div className="p-2">
                  <div className="text-muted small fw-bold mb-1 px-2">SẢN PHẨM</div>
                  {filteredResults.products.map(p => (
                    <div
                      key={`prod-${p.id}`}
                      className="d-flex align-items-center px-2 py-2 text-dark border-bottom cursor-pointer rounded"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        navigate(`/product/${p.slug}`);
                        setShowResults(false);
                        setSearchTerm('');
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <img src={p.thumbnail} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '10px' }} />
                      <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{p.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Form>

        <Navbar.Toggle aria-controls="offcanvasNavbar" className="ms-1 px-2 py-1" />

        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="start"
          className="bg-danger text-white"
        >
          <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-light">
            <Offcanvas.Title id="offcanvasNavbarLabel" className="fw-bold fs-3">
              VDT Mobile
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>



            <Nav className="ms-auto align-items-lg-center mt-4 mt-lg-0 flex-shrink-0">
              <Nav.Link as={Link} to="/my-orders" className="d-flex align-items-center me-lg-4 text-white mb-3 mb-lg-0 text-nowrap px-3 px-lg-0">
                <span style={{ fontSize: '1rem' }} className="fw-semibold">Đơn hàng của tôi</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/cart" className="d-flex align-items-center justify-content-start justify-content-lg-center me-lg-4 text-white btn btn-danger border-white rounded px-3 mb-3 mb-lg-0 py-2 py-lg-1 text-nowrap">
                <FaShoppingCart className="fs-5 me-2" />
                <span style={{ fontSize: '1rem' }} className="fw-semibold">Giỏ hàng</span>
              </Nav.Link>
              {user ? (
                <Dropdown align="end" className="mb-3 mb-lg-0 text-nowrap">
                  <Dropdown.Toggle variant="danger" id="dropdown-basic" className="d-flex align-items-center justify-content-between justify-content-lg-center text-white border-white rounded px-3 py-2 py-lg-1 w-100">
                    <div className="d-flex align-items-center">
                      <FaUser className="fs-5 me-2" />
                      <span style={{ fontSize: '1rem' }} className="fw-semibold">{user.fullName}</span>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">Thông tin cá nhân</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout} className="text-danger">Đăng xuất</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Nav.Link as={Link} to="/login" className="d-flex align-items-center justify-content-start justify-content-lg-center text-white btn btn-danger border-white rounded px-3 py-2 py-lg-1 text-nowrap">
                  <FaUser className="fs-5 me-2" />
                  <span style={{ fontSize: '1rem' }} className="fw-semibold">Đăng nhập</span>
                </Nav.Link>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Header;
