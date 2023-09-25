const extraForm = document.getElementById('extraForm');

extraForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(extraForm);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/completeProfile', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const json = await response.json();
        if (response.ok) {
            console.log('Perfil completado con éxito.');
            extraForm.reset();
            if (json.redirectTo) {
                window.location.href = json.redirectTo;
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al completar el perfil',
                text: json.message || 'Error al completar el perfil. Inténtalo de nuevo.',
            });
        }
    } catch (error) {
        console.log('Error en la solicitud:', error);
    }
});