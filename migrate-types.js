import { apiRoot } from "./src/client.js";
import { targetApiRoot } from "./src/targetClient.js"
import { createSyncTypes } from '@commercetools/sync-actions'


const typesArray = ["user", "punchoutUser", "addressAttributes", "lineItemsFields", "cartFields","shippingCustomFields","purchaseOrderPayment","checkOrMoneyOrderPayment","giftCertificatePayment","cruzCreditPayment","creditCardPayment","paypalPayment"];
async function getTypes() {
    return await apiRoot.types().get().execute();
}
async function getTypeByKey(key) {
    return await targetApiRoot.types().withKey({ key }).get().execute();

}
async function postTypesToTarget(typeDraft) {

    try {
        const targetType = await getTypeByKey(typeDraft.key);
        if (targetType.body.key == typeDraft.key) {
            const actions = createSyncTypes().buildActions(typeDraft, targetType.body)
            if (actions.length) {
                const key = targetType.body.key;
                console.log("sending update actions for : ", key);
                return await targetApiRoot.types().withKey({ key }).post({
                    body: {
                        "version": targetType.body.version,
                        "actions": actions
                    }
                }).execute();
            }

        }

    } catch (error) {
        if (error.name == 'NotFound') {
            console.log("creating type: ", typeDraft.key)
            return await targetApiRoot.types().post({
                body: typeDraft
            }).execute();
        }

    }

}

async function importExportTypes() {
    try {
        const types = await getTypes();
        const results = types.body.results;
        let typePromiseArray = [];
        for (const type of results) {

            if (typesArray.includes(type.key)) {

                const { id, version, versionModifiedAt, createdAt, lastModifiedAt, lastModifiedBy, createdBy, ...typeDraft } = type;

                const typePromise = postTypesToTarget(typeDraft);
                typePromiseArray.push(typePromise);

            }
        }
        return await Promise.all(typePromiseArray);
    } catch (error) {
        console.error(error);
    }


}

await importExportTypes();
