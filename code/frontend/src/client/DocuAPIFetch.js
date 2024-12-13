// TO-DO: Antipattern, copied from EduAPIFetch !!

const DocuAPIFetch = (httpMethod, urlPath, body) => {
    const SERVER = "http://localhost:8001"

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

export default DocuAPIFetch;