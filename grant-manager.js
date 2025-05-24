// Grant management module
export class GrantManager {
    constructor(room) {
        this.room = room;
    }
    
    showModal(grant = null) {
        const modalId = 'grantModal';
        const isEdit = grant !== null;
        
        const donors = this.room.collection('donor').getList();
        const projects = this.room.collection('project').getList();
        
        const donorOptions = donors.map(donor => 
            `<option value="${donor.name}" ${grant?.donor === donor.name ? 'selected' : ''}>${donor.name}</option>`
        ).join('');
        
        const projectOptions = projects.map(project => 
            `<option value="${project.name}" ${grant?.project === project.name ? 'selected' : ''}>${project.name}</option>`
        ).join('');
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${isEdit ? 'تعديل' : 'إضافة'} منحة</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="grantForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">عنوان المنحة *</label>
                                        <input type="text" class="form-control" id="grantTitle" value="${grant?.title || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">الجهة المانحة *</label>
                                        <select class="form-select" id="grantDonor" required>
                                            <option value="">اختر الجهة المانحة</option>
                                            ${donorOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">المشروع *</label>
                                        <select class="form-select" id="grantProject" required>
                                            <option value="">اختر المشروع</option>
                                            ${projectOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">المبلغ المطلوب *</label>
                                        <input type="number" class="form-control" id="grantAmount" value="${grant?.amount || ''}" step="0.01" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">تاريخ التقديم *</label>
                                        <input type="date" class="form-control" id="grantSubmissionDate" value="${grant?.submissionDate || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">حالة المنحة *</label>
                                        <select class="form-select" id="grantStatus" required>
                                            <option value="">اختر الحالة</option>
                                            <option value="قيد المراجعة" ${grant?.status === 'قيد المراجعة' ? 'selected' : ''}>قيد المراجعة</option>
                                            <option value="موافق عليها" ${grant?.status === 'موافق عليها' ? 'selected' : ''}>موافق عليها</option>
                                            <option value="مرفوضة" ${grant?.status === 'مرفوضة' ? 'selected' : ''}>مرفوضة</option>
                                            <option value="قيد التنفيذ" ${grant?.status === 'قيد التنفيذ' ? 'selected' : ''}>قيد التنفيذ</option>
                                            <option value="مكتملة" ${grant?.status === 'مكتملة' ? 'selected' : ''}>مكتملة</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">وصف المنحة</label>
                                    <textarea class="form-control" id="grantDescription" rows="4">${grant?.description || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">ملاحظات</label>
                                    <textarea class="form-control" id="grantNotes" rows="3">${grant?.notes || ''}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" onclick="window.app.grantManager.save(${grant?.id || null})">${isEdit ? 'تحديث' : 'حفظ'}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML = modalHTML;
        new bootstrap.Modal(document.getElementById(modalId)).show();
    }
    
    async save(grantId = null) {
        try {
            const form = document.getElementById('grantForm');
            if (!form?.checkValidity()) {
                form?.reportValidity();
                return;
            }
            
            const grantData = {
                title: document.getElementById('grantTitle')?.value || '',
                donor: document.getElementById('grantDonor')?.value || '',
                project: document.getElementById('grantProject')?.value || '',
                amount: document.getElementById('grantAmount')?.value || '',
                submissionDate: document.getElementById('grantSubmissionDate')?.value || '',
                status: document.getElementById('grantStatus')?.value || '',
                description: document.getElementById('grantDescription')?.value || '',
                notes: document.getElementById('grantNotes')?.value || ''
            };
            
            if (grantId) {
                await this.room.collection('grant').update(grantId, grantData);
            } else {
                await this.room.collection('grant').create(grantData);
            }
            
            const modalElement = document.getElementById('grantModal');
            bootstrap.Modal.getInstance(modalElement)?.hide();
        } catch (error) {
            console.error('Save grant error:', error);
        }
    }
    
    async delete(grantId) {
        if (confirm('هل أنت متأكد من حذف هذه المنحة؟')) {
            try {
                await this.room.collection('grant').delete(grantId);
            } catch (error) {
                console.error('Delete grant error:', error);
            }
        }
    }
    
    render() {
        const tbody = document.getElementById('grantsTable');
        if (!tbody) return;
        
        const grants = this.room.collection('grant').getList();
        
        if (grants.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد منح</td></tr>';
            return;
        }
        
        tbody.innerHTML = grants.map(grant => `
            <tr>
                <td>${grant.title}</td>
                <td>${grant.donor}</td>
                <td>${grant.project}</td>
                <td>$${parseFloat(grant.amount).toLocaleString()}</td>
                <td>${grant.submissionDate}</td>
                <td><span class="badge bg-${this.getGrantStatusColor(grant.status)} status-badge">${grant.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.app.grantManager.showModal(${JSON.stringify(grant).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.app.grantManager.delete('${grant.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    getGrantStatusColor(status) {
        const colors = {
            'قيد المراجعة': 'warning',
            'موافق عليها': 'success',
            'مرفوضة': 'danger',
            'قيد التنفيذ': 'info',
            'مكتملة': 'primary'
        };
        return colors[status] || 'secondary';
    }
}