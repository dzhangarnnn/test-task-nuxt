"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onProductChange = exports.onRelationsChange = void 0;
const database_1 = require("firebase-functions/v2/database");
const app_1 = require("firebase-admin/app");
const database_2 = require("firebase-admin/database");
(0, app_1.initializeApp)();
const db = (0, database_2.getDatabase)();
exports.onRelationsChange = (0, database_1.onValueWritten)('/relations/{productId}', async (event) => {
    const productId = event.params.productId;
    const before = event.data.before.val();
    const after = event.data.after.val();
    if ((before === null || before === void 0 ? void 0 : before.categoryId) !== (after === null || after === void 0 ? void 0 : after.categoryId)) {
        if (before === null || before === void 0 ? void 0 : before.categoryId) {
            await removeFromIndex('indexes/categoryProducts', before.categoryId, productId);
        }
        if (after === null || after === void 0 ? void 0 : after.categoryId) {
            await addToIndex('indexes/categoryProducts', after.categoryId, productId);
        }
    }
    const oldTags = new Set((before === null || before === void 0 ? void 0 : before.tagIds) || []);
    const newTags = new Set((after === null || after === void 0 ? void 0 : after.tagIds) || []);
    for (const tagId of oldTags) {
        if (!newTags.has(tagId)) {
            await removeFromIndex('indexes/tagProducts', tagId, productId);
        }
    }
    for (const tagId of newTags) {
        if (!oldTags.has(tagId)) {
            await addToIndex('indexes/tagProducts', tagId, productId);
        }
    }
});
async function addToIndex(path, key, productId) {
    const ref = db.ref(`${path}/${key}`);
    const snapshot = await ref.get();
    const current = snapshot.val() || [];
    if (!current.includes(productId)) {
        current.push(productId);
        await ref.set(current);
    }
}
async function removeFromIndex(path, key, productId) {
    const ref = db.ref(`${path}/${key}`);
    const snapshot = await ref.get();
    const current = snapshot.val() || [];
    const updated = current.filter(id => id !== productId);
    if (updated.length === 0) {
        await ref.remove();
    }
    else {
        await ref.set(updated);
    }
}
exports.onProductChange = (0, database_1.onValueWritten)('/products/{productId}', async (event) => {
    const productId = event.params.productId;
    const product = event.data.after.val();
    if (!product) {
        await db.ref(`filters/byPrice/${productId}`).remove();
        return;
    }
    const priceCategory = getPriceCategory(product.price);
    await db.ref(`filters/byPrice/${productId}`).set({
        name: product.name,
        price: product.price,
        priceCategory,
        updatedAt: product.updatedAt
    });
});
function getPriceCategory(price) {
    if (price < 1000)
        return 'cheap';
    if (price < 5000)
        return 'medium';
    if (price < 20000)
        return 'expensive';
    return 'premium';
}
//# sourceMappingURL=index.js.map