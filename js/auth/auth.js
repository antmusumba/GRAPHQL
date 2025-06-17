export const AUTH_TOKEN = 'auth-token'
export class Auth {
    constructor() {
        this.authToken = localStorage.getItem(AUTH_TOKEN);
    }
    async login(email, password) {
        const credentials = btoa(`${email}:${password}`);
        const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
            method: 'post',
            headers: { 'Authorization': `Basic ${credentials}` }
        });

        return response
    }

}