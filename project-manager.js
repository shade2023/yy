// Project management module
export class ProjectManager {
    constructor(room) {
        this.room = room;
    }
    
    showModal(project = null) {
        const modalId = 'projectModal';
        const isEdit = project !== null;
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${isEdit ? 'تعديل' : 'إضافة'} مشروع</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="projectForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">اسم المشروع *</label>
                                        <input type="text" class="form-control" id="projectName" value="${project?.name || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">الحالة *</label>
                                        <select class="form-select" id="projectStatus" required>
                                            <option value="">اختر الحالة</option>
                                            <option value="مخطط" ${project?.status === 'مخطط' ? 'selected' : ''}>مخطط</option>
                                            <option value="نشط" ${project?.status === 'نشط' ? 'selected' : ''}>نشط</option>
                                            <option value="متوقف" ${project?.status === 'متوقف' ? 'selected' : ''}>متوقف</option>
                                            <option value="مكتمل" ${project?.status === 'مكتمل' ? 'selected' : ''}>مكتمل</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">تاريخ البدء *</label>
                                        <input type="date" class="form-control" id="projectStartDate" value="${project?.startDate || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">تاريخ الانتهاء المتوقع</label>
                                        <input type="date" class="form-control" id="projectEndDate" value="${project?.endDate || ''}">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">الميزانية المطلوبة</label>
                                    <input type="number" class="form-control" id="projectBudget" value="${project?.budget || ''}" step="0.01">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">وصف المشروع</label>
                                    <textarea class="form-control" id="projectDescription" rows="4">${project?.description || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">الأهداف</label>
                                    <textarea class="form-control" id="projectGoals" rows="3">${project?.goals || ''}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" onclick="window.app.projectManager.save(${project?.id || null})">${isEdit ? 'تحديث' : 'حفظ'}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML = modalHTML;
        new bootstrap.Modal(document.getElementById(modalId)).show();
    }
    
    async save(projectId = null) {
        try {
            const form = document.getElementById('projectForm');
            if (!form?.checkValidity()) {
                form?.reportValidity();
                return;
            }
            
            const projectData = {
                name: document.getElementById('projectName')?.value || '',
                status: document.getElementById('projectStatus')?.value || '',
                startDate: document.getElementById('projectStartDate')?.value || '',
                endDate: document.getElementById('projectEndDate')?.value || '',
                budget: document.getElementById('projectBudget')?.value || '',
                description: document.getElementById('projectDescription')?.value || '',
                goals: document.getElementById('projectGoals')?.value || ''
            };
            
            if (projectId) {
                await this.room.collection('project').update(projectId, projectData);
            } else {
                await this.room.collection('project').create(projectData);
            }
            
            const modalElement = document.getElementById('projectModal');
            bootstrap.Modal.getInstance(modalElement)?.hide();
        } catch (error) {
            console.error('Save project error:', error);
        }
    }
    
    async delete(projectId) {
        if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
            try {
                await this.room.collection('project').delete(projectId);
            } catch (error) {
                console.error('Delete project error:', error);
            }
        }
    }
    
    render() {
        const tbody = document.getElementById('projectsTable');
        if (!tbody) return;
        
        const projects = this.room.collection('project').getList();
        
        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد مشاريع</td></tr>';
            return;
        }
        
        tbody.innerHTML = projects.map(project => `
            <tr>
                <td>${project.name}</td>
                <td>${project.description ? project.description.substring(0, 50) + '...' : '-'}</td>
                <td>${project.startDate}</td>
                <td>${project.endDate || '-'}</td>
                <td><span class="badge bg-${this.getStatusColor(project.status)} status-badge">${project.status}</span></td>
                <td>$${project.budget ? parseFloat(project.budget).toLocaleString() : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.app.projectManager.showModal(${JSON.stringify(project).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.app.projectManager.delete('${project.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    getStatusColor(status) {
        const colors = {
            'مخطط': 'secondary',
            'نشط': 'success',
            'متوقف': 'warning',
            'مكتمل': 'primary'
        };
        return colors[status] || 'secondary';
    }
}