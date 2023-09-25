const formResetPass1 = document.getElementById('resetPassForm1');

formResetPass1.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(formResetPass1);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {
        const response = await fetch('/api/sessions/requestResetPassword', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const json = await response.json();
        if (response.ok) {
            formResetPass1.reset();
            Swal.fire({
                icon: 'success',
                title: 'Correo enviado',
                text: json.message || 'Te enviamos un correo con un enlace para que puedas reestablecer tu contraseña.',
            });
        } 
        else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el cambio de contraseña.',
                text: json.message || 'Ha ocurrido un error al enviar el correo de reestablecimiento de contraseña. Inténtelo de nuevo.',
            });
        }
    } catch (error) {
        console.log('Error en la solicitud - Reset Pass Send Mail:', error);
    }
})