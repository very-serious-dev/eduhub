import { DOCU_SERVER } from "./Servers";
import { EDU_SERVER } from "./Servers";

const APIFetch = (server, httpMethod, urlPath, body) => {
    // https://stackoverflow.com/a/32488827
    const options = {
        method: httpMethod,
        body: JSON.stringify(body),
        credentials: "include"
    };

    return fetch(server + urlPath, options).then(response => {
        return response.json().then(json => {
            return response.ok ? json : Promise.reject(json);
        });
    })
}

const EduAPIFetch = (httpMethod, urlPath, body) => {
    return APIFetch(EDU_SERVER, httpMethod, urlPath, body)
}

const DocuAPIFetch = (httpMethod, urlPath, body) => {
    return APIFetch(DOCU_SERVER, httpMethod, urlPath, body)
}

export { EduAPIFetch };
export { DocuAPIFetch };