// Donor management module
export class DonorManager {
    constructor(room) {
        this.room = room;
    }
    
    showModal(donor = null) {
        const modalId = 'donorModal';
        const isEdit = donor !== null;
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${isEdit ? 'تعديل' : 'إضافة'} جهة مانحة</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="donorForm">
                                <div class="mb-3">
                                    <label class="form-label">اسم الجهة المانحة *</label>
                                    <input type="text" class="form-control" id="donorName" value="${donor?.name || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">نوع ��لجهة *</label>
                                    <select class="form-select" id="donorType" required>
                                        <option value="">اختر نوع الجهة</option>
                                        <option value="حكومية" ${donor?.type === 'حكومية' ? 'selected' : ''}>حكومية</option>
                                        <option value="خاصة" ${donor?.type === 'خاصة' ? 'selected' : ''}>خاصة</option>
                                        <option value="دولية" ${donor?.type === 'دولية' ? 'selected' : ''}>دولية</option>
                                        <option value="أفراد" ${donor?.type === 'أفراد' ? 'selected' : ''}>أفراد</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">البريد الإلكتروني</label>
                                    <input type="email" class="form-control" id="donorEmail" value="${donor?.email || ''}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">رقم الهاتف</label>
                                    <input type="tel" class="form-control" id="donorPhone" value="${donor?.phone || ''}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">البلد</label>
                                    <input type="text" class="form-control" id="donorCountry" value="${donor?.country || ''}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">العنوان</label>
                                    <textarea class="form-control" id="donorAddress" rows="3">${donor?.address || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">ملاحظات</label>
                                    <textarea class="form-control" id="donorNotes" rows="3">${donor?.notes || ''}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" onclick="window.app.donorManager.save('${donor?.id || null}')">${isEdit ? 'تحديث' : 'حفظ'}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML = modalHTML;
        new bootstrap.Modal(document.getElementById(modalId)).show();
    }
    
    async save(donorId = null) {
        try {
            const form = document.getElementById('donorForm');
            if (!form?.checkValidity()) {
                form?.reportValidity();
                return;
            }
            
            const donorData = {
                name: document.getElementById('donorName')?.value || '',
                type: document.getElementById('donorType')?.value || '',
                email: document.getElementById('donorEmail')?.value || '',
                phone: document.getElementById('donorPhone')?.value || '',
                country: document.getElementById('donorCountry')?.value || '',
                address: document.getElementById('donorAddress')?.value || '',
                notes: document.getElementById('donorNotes')?.value || ''
            };
            
            if (donorId) {
                await this.room.collection('donor').update(donorId, donorData);
            } else {
                await this.room.collection('donor').create(donorData);
            }
            
            const modalElement = document.getElementById('donorModal');
            bootstrap.Modal.getInstance(modalElement)?.hide();
            this.render();
            window.app.dashboardController.updateDashboard();
        } catch (error) {
            console.error('Save donor error:', error);
        }
    }
    
    async delete(donorId) {
        if (confirm('هل أنت متأكد من حذف هذه الجهة المانحة؟')) {
            try {
                await this.room.collection('donor').delete(donorId);
                this.render();
                window.app.dashboardController.updateDashboard();
            } catch (error) {
                console.error('Delete donor error:', error);
            }
        }
    }
    
    render() {
        const tbody = document.getElementById('donorsTable');
        if (!tbody) return;
        
        const donors = this.room.collection('donor').getList();
        
        if (donors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد جهات مانحة</td></tr>';
            return;
        }
        
        tbody.innerHTML = donors.map(donor => `
            <tr>
                <td>${donor.name}</td>
                <td><span class="badge bg-info donor-type-badge">${donor.type}</span></td>
                <td>${donor.email || '-'}</td>
                <td>${donor.phone || '-'}</td>
                <td>${donor.country || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.app.donorManager.showModal(${JSON.stringify(donor).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.app.donorManager.delete('${donor.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}