import React, { useState } from 'react';
import { Card } from './ui/Card/Card';
import { Button } from './ui/Button/Button';
import { Input } from './ui/Input/Input';
import { Building2, Edit, Trash2, Plus, MapPin } from 'lucide-react';
import styles from './TenantList.module.scss';

interface Tenant {
  id: string;
  name: string;
  business_type: string;
  logo_url?: string;
  stamp_icon_url?: string;
  created_at: string;
}

interface TenantListProps {
  tenants: Tenant[];
  onAddTenant: (name: string, businessType: string) => void;
  onEditTenant: (id: string, name: string, businessType: string) => void;
  onDeleteTenant: (id: string) => void;
}

export const TenantList: React.FC<TenantListProps> = ({
  tenants,
  onAddTenant,
  onEditTenant,
  onDeleteTenant
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({ name: '', businessType: '' });

  const handleAdd = () => {
    if (formData.name && formData.businessType) {
      onAddTenant(formData.name, formData.businessType);
      setFormData({ name: '', businessType: '' });
      setShowAddForm(false);
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({ name: tenant.name, businessType: tenant.business_type });
  };

  const handleSaveEdit = () => {
    if (editingTenant && formData.name && formData.businessType) {
      onEditTenant(editingTenant.id, formData.name, formData.businessType);
      setEditingTenant(null);
      setFormData({ name: '', businessType: '' });
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTenant(null);
    setFormData({ name: '', businessType: '' });
  };

  return (
    <div className={styles.tenantList}>
      <div className={styles.header}>
        <h2>Zarządzanie Tenantami</h2>
        <Button
          id="add-tenant-btn"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm || editingTenant !== null}
        >
          <Plus size={16} />
          Dodaj Tenanta
        </Button>
      </div>

      {showAddForm && (
        <Card className={styles.addForm}>
          <h3>Dodaj Nowego Tenanta</h3>
          <div className={styles.formFields}>
            <Input
              id="tenant-name-input"
              placeholder="Nazwa biznesu"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />
            <Input
              id="business-type-input"
              placeholder="Typ biznesu (np. barbershop, cafe, restaurant)"
              value={formData.businessType}
              onChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
            />
          </div>
          <div className={styles.formActions}>
            <Button
              id="save-tenant-btn"
              onClick={handleAdd}
              disabled={!formData.name || !formData.businessType}
            >
              Zapisz
            </Button>
            <Button
              id="cancel-tenant-btn"
              variant="outline"
              onClick={handleCancel}
            >
              Anuluj
            </Button>
          </div>
        </Card>
      )}

      <div className={styles.tenants}>
        {tenants.map((tenant) => (
          <Card key={tenant.id} id={`tenant-${tenant.id}`} className={styles.tenantCard}>
            <div className={styles.tenantHeader}>
              <div className={styles.tenantInfo}>
                <Building2 size={20} />
                <div>
                  <h4 className={styles.tenantName}>{tenant.name}</h4>
                  <p className={styles.businessType}>{tenant.business_type}</p>
                </div>
              </div>
              <div className={styles.tenantActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(tenant)}
                  disabled={editingTenant !== null}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeleteTenant(tenant.id)}
                  disabled={editingTenant !== null}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            
            {editingTenant?.id === tenant.id && (
              <div className={styles.editForm}>
                <h4>Edytuj Tenanta</h4>
                <div className={styles.formFields}>
                  <Input
                    id={`edit-name-${tenant.id}`}
                    placeholder="Nazwa biznesu"
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  />
                  <Input
                    id={`edit-type-${tenant.id}`}
                    placeholder="Typ biznesu"
                    value={formData.businessType}
                    onChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                  />
                </div>
                <div className={styles.formActions}>
                  <Button
                    id={`save-edit-${tenant.id}`}
                    onClick={handleSaveEdit}
                    disabled={!formData.name || !formData.businessType}
                  >
                    Zapisz
                  </Button>
                  <Button
                    id={`cancel-edit-${tenant.id}`}
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            )}
            
            <div className={styles.tenantMeta}>
              <span className={styles.createdAt}>
                Utworzony: {new Date(tenant.created_at).toLocaleDateString('pl-PL')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
