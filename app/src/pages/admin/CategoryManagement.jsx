import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    isDeleted: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      // Filter out deleted categories, or keep them to allow restoring if needed.
      // Usually admin sees all or there's a filter. We'll show all and indicate if deleted.
      setCategories(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách danh mục');
      console.error('Fetch categories error:', error);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        image: category.image || '',
        isDeleted: category.isDeleted || false
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        image: '',
        isDeleted: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Auto-generate slug if name changes and we are creating a new one
    if (name === 'name' && !editingCategory) {
      const autoSlug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      setFormData(prev => ({ ...prev, name: value, slug: autoSlug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        const newCategory = {
          ...formData,
          createdAt: new Date().toISOString()
        };
        await createCategory(newCategory);
        toast.success('Thêm danh mục thành công!');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error('Lỗi khi lưu danh mục');
      console.error('Save category error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await updateCategory(id, { isDeleted: true });
        toast.success('Xóa danh mục thành công!');
        fetchCategories();
      } catch (error) {
        // Fallback to hard delete if soft delete fails, or try hard delete first?
        // Let's just try hard delete first, and if it fails, fallback to soft delete.
        try {
          await deleteCategory(id);
          toast.success('Xóa danh mục thành công!');
          fetchCategories();
        } catch (innerError) {
          toast.error('Lỗi khi xóa danh mục');
          console.error('Delete category error:', innerError);
        }
      }
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h2>Quản lý Danh Mục</h2>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            + Thêm danh mục
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Hình ảnh</th>
          <th>Tên</th>
          <th>Slug</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
        </thead>
        <tbody>
        {categories.map((cat) => (
          <tr key={cat.id}>
            <td>{cat.id}</td>
            <td>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              ) : 'N/A'}
            </td>
            <td>{cat.name}</td>
            <td>{cat.slug}</td>
            <td>
                <span className={`badge ${cat.isDeleted ? 'bg-danger' : 'bg-success'}`}>
                  {cat.isDeleted ? 'Đã ẩn/Xóa' : 'Hoạt động'}
                </span>
            </td>
            <td>
              <Button variant="warning" size="sm" className="me-2" onClick={() => handleOpenModal(cat)}>
                Sửa
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(cat.id)}>
                Xóa
              </Button>
            </td>
          </tr>
        ))}
        {categories.length === 0 && (
          <tr>
            <td colSpan="6" className="text-center">Chưa có dữ liệu</td>
          </tr>
        )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug (Đường dẫn)</Form.Label>
              <Form.Control
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Link hình ảnh (Logo)</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Đã xóa / Ẩn"
                name="isDeleted"
                checked={formData.isDeleted}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CategoryManagement;
