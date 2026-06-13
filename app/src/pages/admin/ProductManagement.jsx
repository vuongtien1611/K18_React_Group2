import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, createVariant, updateVariant, createStockLog } from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterProductName, setFilterProductName] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockVariant, setRestockVariant] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    thumbnail: '',
    price: '',
    stock: ''
  });
  const [restockAmount, setRestockAmount] = useState('');

  const fetchProducts = async () => {
    try {
      const [productsRes, variantsRes, catRes] = await Promise.all([
        getProducts(),
        axios.get('http://localhost:3000/variants'),
        getCategories()
      ]);
      setCategories(catRes.data);

      const productsWithVariants = productsRes.data.map(product => ({
        ...product,
        variants: variantsRes.data.filter(v => v.productId === product.id)
      }));
      // sort by id desc
      const sorted = productsWithVariants.sort((a,b) => b.id - a.id);
      setProducts(sorted);
      setFilteredProducts(sorted);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Effect for filtering
  useEffect(() => {
    let result = [...products];

    if (filterProductName.trim()) {
      const term = filterProductName.toLowerCase().trim();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    }

    if (filterPrice.trim()) {
      result = result.filter(p => p.variants.some(v => v.price.toString().includes(filterPrice.trim())));
    }

    if (filterLowStock) {
      result = result.filter(p => p.variants.some(v => v.stock < 3));
    }

    setFilteredProducts(result);
  }, [filterProductName, filterPrice, filterLowStock, products]);

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        thumbnail: product.thumbnail,
        price: product.variants[0]?.price || '',
        stock: product.variants[0]?.stock || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', categoryId: '', thumbnail: '', price: '', stock: '' });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        // Edit product
        await updateProduct(editingProduct.id, {
          name: formData.name,
          categoryId: parseInt(formData.categoryId),
          thumbnail: formData.thumbnail
        });

        if (editingProduct.variants[0]) {
          await updateVariant(editingProduct.variants[0].id, {
            price: parseInt(formData.price),
            // stock should be managed by restock modal.
          });
        }
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        // Add new product
        const newProductRes = await createProduct({
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/ /g, '-'),
          categoryId: parseInt(formData.categoryId),
          brandId: parseInt(formData.categoryId), // temp fallback
          thumbnail: formData.thumbnail,
          isDeleted: false,
          createdAt: new Date().toISOString()
        });

        await createVariant({
          productId: newProductRes.data.id,
          color: "Mặc định",
          storage: "Mặc định",
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          reservedStock: 0,
          minThreshold: 5,
          image: formData.thumbnail,
          isDeleted: false,
          createdAt: new Date().toISOString()
        });
        toast.success('Thêm sản phẩm mới thành công!');
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await updateProduct(id, { isDeleted: true });
        toast.success('Xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        try {
          await deleteProduct(id);
          toast.success('Xóa sản phẩm thành công!');
          fetchProducts();
        } catch (innerError) {
          console.error(innerError);
          toast.error('Lỗi khi xóa sản phẩm');
        }
      }
    }
  };

  const handleOpenRestockModal = (variant) => {
    setRestockVariant(variant);
    setRestockAmount('');
    setShowRestockModal(true);
  };

  const handleRestock = async () => {
    if (!restockAmount || restockAmount <= 0) return;
    try {
      const amount = parseInt(restockAmount);
      const newStock = restockVariant.stock + amount;

      await updateVariant(restockVariant.id, { stock: newStock });
      await createStockLog({
        variantId: restockVariant.id,
        type: "IMPORT",
        quantity: amount,
        stockBefore: restockVariant.stock,
        stockAfter: newStock,
        reason: "Admin nhập kho",
        createdBy: 1,
        createdAt: new Date().toISOString()
      });

      toast.success('Nhập kho thành công!');
      setShowRestockModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi nhập kho');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Quản lý Sản phẩm & Tồn kho</h2>
        <Button variant="danger" onClick={() => handleOpenProductModal()}>+ Thêm sản phẩm mới</Button>
      </div>

      {/* Bộ lọc */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <Form.Control type="text" placeholder="Tìm tên sản phẩm..." value={filterProductName} onChange={e => setFilterProductName(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Control type="text" placeholder="Tìm theo đơn giá (VD: 15000000)" value={filterPrice} onChange={e => setFilterPrice(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Check
                type="checkbox"
                id="filter-low-stock"
                label={<span className="fw-semibold text-danger">Sản phẩm sắp hết hàng (Tồn kho &lt; 3)</span>}
                checked={filterLowStock}
                onChange={e => setFilterLowStock(e.target.checked)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Phiên bản & Tồn kho</th>
              <th>Giá bán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="fw-bold">{product.id}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <img src={product.thumbnail} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} className="me-2 border rounded" />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{product.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {product.variants.map(v => (
                    <div key={v.id} className="mb-1" style={{ fontSize: '0.85rem' }}>
                      <span className="fw-semibold">{v.color} - {v.storage}:</span>
                      <span className={`ms-1 ${v.stock <= v.minThreshold ? 'text-danger fw-bold' : 'text-success'}`}>
                          Kho {v.stock} (Giữ {v.reservedStock})
                        </span>
                    </div>
                  ))}
                </td>
                <td>
                  {product.variants[0] && (
                    <div className="text-danger fw-bold">{formatPrice(product.variants[0].price)}</div>
                  )}
                </td>
                <td>
                  {product.isDeleted ? <Badge bg="secondary">Đã ẩn</Badge> : <Badge bg="success">Đang bán</Badge>}
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenProductModal(product)}>Sửa</Button>
                  <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleDeleteProduct(product.id)}>Xóa</Button>
                  {product.variants[0] && (
                    <Button variant="outline-success" size="sm" onClick={() => handleOpenRestockModal(product.variants[0])}>Nhập kho</Button>
                  )}
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">Không tìm thấy sản phẩm nào phù hợp</td>
              </tr>
            )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Add/Edit Product */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh (URL)</Form.Label>
              <Form.Control type="text" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá bán (VNĐ)</Form.Label>
              <Form.Control type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </Form.Group>
            {!editingProduct && (
              <Form.Group className="mb-3">
                <Form.Label>Tồn kho ban đầu</Form.Label>
                <Form.Control type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleSaveProduct}>Lưu</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Restock */}
      <Modal show={showRestockModal} onHide={() => setShowRestockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nhập kho</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Số lượng nhập thêm</Form.Label>
              <Form.Control type="number" placeholder="Ví dụ: 50" value={restockAmount} onChange={e => setRestockAmount(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRestockModal(false)}>Hủy</Button>
          <Button variant="success" onClick={handleRestock}>Xác nhận nhập kho</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ProductManagement;

