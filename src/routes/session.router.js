import {
    Router
} from 'express';
import passport from 'passport';

import {
    registerUser,
    loginUser,
    getCurrentUser,
    authenticateWithGitHub,
    getProfileUser
} from './Middlewares/passport.middleware.js';

import {
    completeProfile
} from '../config/formExtra.js';

// Import SessionController
import SessionController from '../controllers/sessionController.js';

// Instancia de router: 
const sessionRouter = Router();

// Instancia de SessionController: 
let sessionController = new SessionController();

// Register:
sessionRouter.post('/register', registerUser);

// Login:
sessionRouter.post('/login', loginUser);

// GitHub:
sessionRouter.get('/github', passport.authenticate('github', {
    session: false,
    scope: 'user:email'
}));

sessionRouter.get('/githubcallback', authenticateWithGitHub);

// Formulario extra - GitHub:
sessionRouter.post('/completeProfile', completeProfile);

// Current user:
sessionRouter.get('/current', passport.authenticate('jwt', {
    session: false
}), getCurrentUser);

// Ver perfil usuario: 
sessionRouter.get('/profile', passport.authenticate('jwt', {
    session: false
}), getProfileUser);

// Enviar email para reestablecer contraseña:
sessionRouter.post('/requestResetPassword', async (req, res, next) => {
    const result = await sessionController.resetPass1Controller(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// Reestablecer contraseña de usuario:
sessionRouter.post('/resetPassword', passport.authenticate('jwt', {
        session: false
    }),
    async (req, res, next) => {
        const result = await sessionController.resetPass2Controller(req, res, next);
        if (result !== undefined) {
            res.status(result.statusCode).send(result);
        };
    });

// Cambiar rol del usuario: 
sessionRouter.post('/premium/:uid', async (req, res, next) => {
    const result = await sessionController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default sessionRouter;