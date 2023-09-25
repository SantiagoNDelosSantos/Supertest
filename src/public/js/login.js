const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {

        const response = await fetch('/api/sessions/login', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const json = await response.json();

        if (response.ok) {
            form.reset();
            if (json.role === "user") {
                window.location.replace('/products');
            } else if (json.role === "premium") {
                window.location.replace('/premiumView');
            } else if (json.role === "admin") {
                window.location.replace('/adminPanel');
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error de inicio de sesión',
                text: json.message || 'Error en el inicio de sesión. Inténtelo de nuevo.',
            });
        }
        
    } catch (error) {
        console.log('Error en la solicitud - Login:', error);
    }
});