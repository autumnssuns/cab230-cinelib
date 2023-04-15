import sha256 from 'crypto-js/sha256';

/**
 * Hashes a password, salted with the email
 * @param {*} email The email of the user
 * @param {*} password The password of the user
 */
export function hashPassword(email, password){
    const hash = sha256(email + password);
    return hash.toString();
}