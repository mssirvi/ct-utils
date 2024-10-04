import { apiRoot } from "./src/client.js";
import { targetApiRoot } from "./src/targetClient.js";
import { createSyncCustomerGroup } from '@commercetools/sync-actions';

async function getCustomerGroups() {
    return await apiRoot.customerGroups().get().execute();
}

async function getCustomerGroupByKey(key) {
    return targetApiRoot.customerGroups().withKey({ key }).get().execute();
}
async function postCustomerGroupToTarget(customerGroupDraft) {
    try {
        const customerGroup = await getCustomerGroupByKey(customerGroupDraft.key);
        if (customerGroup.body.key == customerGroupDraft.key) {
            delete Object.assign(customerGroupDraft, { ["name"]: customerGroupDraft["groupName"] })["groupName"];
            const actions = createSyncCustomerGroup().buildActions(customerGroupDraft, customerGroup.body);
            if (actions.length) {

                const key = customerGroup.body.key;
                console.log("sending update actions for : ", key);
                return await targetApiRoot.customerGroups().withKey({ key }).post({
                    body: {
                        "version": customerGroup.body.version,
                        "actions": actions
                    }
                }).execute();
            }
        }
    } catch (error) {
        if (error.name == 'NotFound') {
            console.log("creating customer group: ", customerGroupDraft.key)
            return await targetApiRoot.customerGroups().post({
                body: customerGroupDraft
            }).execute();
        }
    }
}

async function importExportCustomerGroup() {
    try {
        const results = await getCustomerGroups();
        const customerGroupsResults = results.body.results;
        const promises = [];
        for (const customerGroup of customerGroupsResults) {
            const { id, version, versionModifiedAt, createdAt, lastModifiedAt, lastModifiedBy, createdBy, ...customerGroupDraft } = customerGroup;
            delete Object.assign(customerGroupDraft, { ["groupName"]: customerGroupDraft["name"] })["name"];
            const cgPromise = postCustomerGroupToTarget(customerGroupDraft);
            promises.push(cgPromise);
        }
        return await Promise.all(promises);
    } catch (error) {
        console.error(error);
    }

}
await importExportCustomerGroup();
