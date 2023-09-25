// Solo admin:
export const rolesMiddlewareAdmin = (req, res, next) => {
    if(req.user.role === 'admin'){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}

// Solo admin y premium: 
export const rolesMiddlewareAdminAndPremiun = (req, res, next) => {
    if(req.user.role === 'admin' || req.user.role === 'premium' ){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}

// Solo user premium: 
export const rolesMiddlewareUserPremium = (req, res, next) => {
    if(req.user.role === 'premium'){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}

// Solo user y user premium:
export const rolesMiddlewareUser = (req, res, next) => {
    if(req.user.role === 'user' || req.user.role === 'premium'){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}