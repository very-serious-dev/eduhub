// https://stackoverflow.com/a/32488827

const EduAPIFetch = (httpMethod, urlPath, body) => {
    const SERVER = "http://localhost:8000"

    const options = {
        method: httpMethod,
        body: JSON.stringify(body),
        credentials: "include"
    };

    return fetch(SERVER + urlPath, options).then(response => {
        return response.json().then(json => {
            return response.ok ? json : Promise.reject(json);
        });
    })
}

export default EduAPIFetch;