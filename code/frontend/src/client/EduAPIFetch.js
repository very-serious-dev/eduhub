// https://stackoverflow.com/a/32488827

import { EDU_SERVER } from "./Servers";

const EduAPIFetch = (httpMethod, urlPath, body) => {

    const options = {
        method: httpMethod,
        body: JSON.stringify(body),
        credentials: "include"
    };

    return fetch(EDU_SERVER + urlPath, options).then(response => {
        return response.json().then(json => {
            return response.ok ? json : Promise.reject(json);
        });
    })
}

export default EduAPIFetch;