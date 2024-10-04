import { apiRoot } from "./src/client.js";
import { customLog } from "./src/logger.js";

const unpublishedProducts = async (whereQuery, limit, sort) => {
    return await apiRoot.products().get({
        queryArgs: {
            where: whereQuery,
            limit: limit,
            withTotal: false,
            sort: sort
        }
    }).execute();
}
const modifiedProducts = async (whereQuery, limit, sort) => {
    return await apiRoot.productProjections().search().get({
        queryArgs: {
            filter: whereQuery,
            limit: limit,
            withTotal: false,
            sort: sort
        }
    }).execute();
}
const publishProducts = async (ID, version) => {
    return await apiRoot.products().withId({ ID }).post({
        body: {
            "version": version,
            "actions": [
                {
                    "action": "publish"
                }
            ]
        }
    }).execute();
}

const publishBulk = async () => {
    const limit = 500;
    let lastId = null;
    let countinue = true;
    let response;
    while (countinue) {
        // if (lastId) {
        //     let idQuery = 'id > "' + lastId + '"';
        //     response = await modifiedProducts(["hasStagedChanges = true", idQuery], limit, "id asc");
        // } else {
        //     response = await modifiedProducts("hasStagedChanges : true", limit, "id asc")
        // }
        // if (response.body.count != limit) {
        //     countinue = false;
        //     lastId = null;
        // } else {
        //     lastId = response.body.results[limit - 1].id;
        // }
        response = await modifiedProducts("hasStagedChanges : true", limit, "createdAt asc");
        if (response.body.count != limit) {
            countinue = false;
        }
        // publish these concurrently
        let promises = [];
        for (let i = 0; i < response.body.count; i++) {
            customLog(`queueing publish productId: ${response.body.results[i].id} key: ${response.body.results[i].key}`);
            const publishPromise = publishProducts(response.body.results[i].id, response.body.results[i].version);
            promises.push(publishPromise);
        }
        await Promise.all(promises);
    }


}
await publishBulk();
