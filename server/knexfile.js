module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: '127.0.0.1',
            port: 3307,
            database: 'movies',
            user: 'root',
            password: 'secret'
       }
    },
    production: {
        client: 'mysql2',
        connection: {
            host: '127.0.0.1',
            database: 'movies',
            user: 'cab230',
            password: 'Cab230!'
       }
    }
}