// https://stackoverflow.com/a/32488827

const EduAPIFetch = (urlPath, options) => {
    return fetch("http://localhost:8000" + urlPath, options).then(response => {
        return response.json().then(json => {
            return response.ok ? json : Promise.reject(json);
        });
    })
}

export default EduAPIFetch;