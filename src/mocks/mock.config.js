import { faker } from "@faker-js/faker";

export const generateProduct = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.string.uuid(),
        price: faker.commerce.price({ min: 300, max: 3000, dec: 0}),
        status: true,
        stock: faker.number.int({ min: 1, max: 30 }),
        category: faker.commerce.department(),
        thumbnail: [faker.image.url(), faker.image.url()],
        id: faker.string.uuid(),
    }
};