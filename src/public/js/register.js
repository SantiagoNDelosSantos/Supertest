const form = document.getElementById('registerForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/register', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const json = await response.json();
        if (response.ok) {
            console.log('Usuario creado con éxito.');
            form.reset();
            window.location.href = '/login';
        } 
        else {
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: json.cause || json.message || 'Error en el registro. Inténtalo de nuevo.',
            });
        }
    } 
    catch (error) {
        console.log('Error en la solicitud:', error.message);
    }
});