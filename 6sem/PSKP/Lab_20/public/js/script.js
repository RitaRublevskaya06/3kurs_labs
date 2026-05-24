document.addEventListener('DOMContentLoaded', function() {
    const updateForm = document.getElementById('updateForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const deleteForm = document.getElementById('deleteForm');
    
    if (updateForm && deleteBtn) {
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        
        function checkForChanges() {
            const originalName = nameInput.defaultValue;
            const originalPhone = phoneInput.defaultValue;
            const currentName = nameInput.value;
            const currentPhone = phoneInput.value;
            
            if (currentName !== originalName || currentPhone !== originalPhone) {
                deleteBtn.classList.add('disabled');
                deleteBtn.disabled = true;
            } else {
                deleteBtn.classList.remove('disabled');
                deleteBtn.disabled = false;
            }
        }
        
        nameInput.addEventListener('input', checkForChanges);
        phoneInput.addEventListener('input', checkForChanges);
        
        if (deleteBtn && deleteForm) {
            deleteBtn.addEventListener('click', function() {
                if (!deleteBtn.disabled) {
                    deleteForm.submit();
                }
            });
        }
    }
    
    const deleteForms = document.querySelectorAll('form[action="/Delete"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
                e.preventDefault();
            }
        });
    });
});