import { targetApiRoot } from "./src/targetClient.js";

async function queryCustomObjects() {
    return await targetApiRoot.customObjects().get({
        queryArgs: {
            sort: 'id asc',
            limit: 150,
            withTotal: false
        }
    }).execute();
}

async function deleteCustomObject(container, key) {
    return await targetApiRoot.customObjects().withContainerAndKey({
        container: container,
        key: key
    }).delete().execute();
}
let flag = true;
while (flag) {
    try {

        const result = await queryCustomObjects();
        if (!result.body.results.length) flag = false;
        let promises = [];
        for (const cObject of result.body.results) {
            const deleteObj = deleteCustomObject(cObject.container, cObject.key);
            promises.push(deleteObj);
        }
        await Promise.all(promises);

    } catch (error) {
        console.log("something went wrong");
    }
}
