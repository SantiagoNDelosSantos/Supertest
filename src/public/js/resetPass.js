const formResetPass2 = document.getElementById('resetPassForm2');

formResetPass2.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(formResetPass2);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    try {

        const response = await fetch('/api/sessions/resetPassword', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const json = await response.json();

        if (response.ok) {
            formResetPass2.reset();
            Swal.fire({
                icon: 'success',
                title: 'Contraseña actualizada.',
                text: 'Su contraseña ya ha sido actualizada. Puede hacer click en “Iniciar sesión” para loguearse con su correo y nueva contraseña.',
            });
        } 
        else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el cambio de contraseña.',
                text: json.cause || json.message || 'Ha ocurrido un error al intentar cambiar la contraseña.',
            });
        }
    } catch (error) {
        console.log('Error en la solicitud - Reset Password:', error);
    }
})