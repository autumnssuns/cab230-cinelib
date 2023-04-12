const instance = require("./scripts/setup");

describe('GET /', () => {
    beforeAll(async () => {
        const request = await instance.get("/").then(
            (data) => {
                return { resolve: data, reject: null };
            },
            (error) => {
                return { resolve: undefined, reject: error };
            }
        );
        return (response = request.resolve
            ? request.resolve
            : request.reject.response);
        });
    test('should return status code 200', async () => {
        expect(response.status).toEqual(200);
    });
});