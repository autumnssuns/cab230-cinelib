const idb = require('idb');

export const IndexedDB = (() => {
    // Check for support
    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
    }

    // Open the database
    const dbPromise = idb.openDB('movies-db', 1, { 
        upgrade(upgradeDb) {
            // Create a store of movies data, indexed by imdbID
            if (!upgradeDb.objectStoreNames.contains('movies')) {
                const moviesOS = upgradeDb.createObjectStore('movies', { keyPath: 'imdbID' });
                moviesOS.createIndex('title', 'title', { unique: false });
                moviesOS.createIndex('year', 'year', { unique: false });
                moviesOS.createIndex('runtime', 'runtime', { unique: false });
                moviesOS.createIndex('genres', 'genres', { unique: false });
                moviesOS.createIndex('country', 'country', { unique: false });
                moviesOS.createIndex('principals', 'principals', { unique: false });
                moviesOS.createIndex('ratings', 'ratings', { unique: false });
                moviesOS.createIndex('boxoffice', 'boxoffice', { unique: false });
                moviesOS.createIndex('poster', 'poster', { unique: false });
                moviesOS.createIndex('plot', 'plot', { unique: false });
            }

            // Create a store of people, indexed by id with the following indexes
            if (!upgradeDb.objectStoreNames.contains('people')) {
                const peopleOS = upgradeDb.createObjectStore('people', { keyPath: 'id' });
                peopleOS.createIndex('name', 'name', { unique: false });
                peopleOS.createIndex('birthYear', 'birthYear', { unique: false });
                peopleOS.createIndex('deathYear', 'deathYear', { unique: false });
                peopleOS.createIndex('roles', 'roles', { unique: false });
            }
        }
    });
    
    return {
        dbPromise: dbPromise,
        Movies: {
            /**
             * Create a movie in the database, indexed by imdbID
             * @param {*} imdbID The imdbID of the movie
             * @param {*} movie The movie object from the /movies/data endpoint
             * @returns {Promise} A promise that resolves when the movie is created
             */
            create: function (imdbID, movie) {
                return dbPromise.then(function (db) {
                    const tx = db.transaction('movies', 'readwrite');
                    const store = tx.objectStore('movies');
                    store.put({ imdbID: imdbID, ...movie });
                    return tx.complete;
                });
            },
            /**
             * Read a movie from the database
             * @param {*} id The imdbID of the movie
             * @returns {Promise} A promise that resolves with the movie
             * or undefined if the movie is not found
             */
            read: function (id) {
                return dbPromise.then(function (db) {
                    const tx = db.transaction('movies', 'readonly');
                    const store = tx.objectStore('movies');
                    return store.get(id);
                });
            },
            /**
             * Delete a movie from the database
             * @param {*} id The imdbID of the movie
             * @returns {Promise} A promise that resolves when the movie is deleted
             */
            delete: function (id) {
                return dbPromise.then(function (db) {
                    const tx = db.transaction('movies', 'readwrite');
                    const store = tx.objectStore('movies');
                    store.delete(id);
                    return tx.complete;
                });
            },
        },
        People: {
            /**
             * Create a person in the database, indexed by id
             * @param {*} id The id of the person
             * @param {*} person The person object from the /people/{id} endpoint
             * @returns {Promise} A promise that resolves when the person is created
             * or undefined if the person is not found
             */
            create: function (id, person) {
                return dbPromise.then(function (db) {
                    const tx = db.transaction('people', 'readwrite');
                    const store = tx.objectStore('people');
                    store.put({ id: id, ...person });
                    return tx.complete;
                }
                );
            },
            /**
             * Read a person from the database
             * @param {*} id The id of the person
             * @returns {Promise} A promise that resolves with the person
             * or undefined if the person is not found
             */
            read: function (id) {
                return dbPromise.then(function (db) {
                    const tx = db.transaction('people', 'readonly');
                    const store = tx.objectStore('people');
                    return store.get(id);
                }
                );
            },
            /**
             * Delete a person from the database
             * @param {*} id The id of the person
             * @returns {Promise} A promise that resolves when the person is deleted
             * or undefined if the person is not found
             */
            delete: function (id) {
                return dbPromise.then(function (db) {
                    const tx = db.transaction('people', 'readwrite');
                    const store = tx.objectStore('people');
                    store.delete(id);
                    return tx.complete;
                }
                );
            },
        },
    };
})()