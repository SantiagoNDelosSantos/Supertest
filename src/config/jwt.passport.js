// Imports passport, jwt: 
import passport from "passport";
import jwt from "passport-jwt";

// Importación variables de entorno: 
import {
    envCoderSecret,
    envCoderTokenCookie,
    envResetPassToken
} from "../config.js";

const JWTStrategy = jwt.Strategy;
const ExtracJWT = jwt.ExtractJwt;

export const initializePassportJWT = () => {

    // Token user session:
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtracJWT.fromExtractors([cookieExtractor]),
        secretOrKey: envCoderSecret
    }, async (jwtPayload, done) => {
        try {
            return done(null, jwtPayload);
        } catch (error) {
            return done(error);
        }
    }))

    // Token Reset Password:
    passport.use('jwtResetPass', new JWTStrategy({
        jwtFromRequest: ExtracJWT.fromExtractors([queryExtractor]),
        secretOrKey: envResetPassToken
    }, async (jwtPayload, done) => {
        try {
            return done(null, jwtPayload);
        } catch (error) {
            return done(error);
        }
    }))

};

// Extractor para token user session:
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.signedCookies) {
        token = req.signedCookies[envCoderTokenCookie]
    }
    return token
};

// Extractor para Token Reset Password:
const queryExtractor = (req) => {
    let token = null;
    if (req.query ) {
        token = req.query.token
    }
    return token
};