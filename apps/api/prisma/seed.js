"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
require("dotenv/config");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var categories, brands, adminPassword, admin, hpBrand, canonBrand, epsonBrand, inkCategory, printerCategory, tonerCategory, products, _i, products_1, product;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding database...');
                    return [4 /*yield*/, Promise.all([
                            prisma.category.upsert({
                                where: { slug: 'printers' },
                                update: {},
                                create: { nameAr: 'طابعات', nameEn: 'Printers', slug: 'printers', sortOrder: 1 },
                            }),
                            prisma.category.upsert({
                                where: { slug: 'ink-cartridges' },
                                update: {},
                                create: { nameAr: 'خراطيش حبر', nameEn: 'Ink Cartridges', slug: 'ink-cartridges', sortOrder: 2 },
                            }),
                            prisma.category.upsert({
                                where: { slug: 'toner' },
                                update: {},
                                create: { nameAr: 'خراطيش تونر', nameEn: 'Toner Cartridges', slug: 'toner', sortOrder: 3 },
                            }),
                            prisma.category.upsert({
                                where: { slug: 'paper-media' },
                                update: {},
                                create: { nameAr: 'ورق ووسائط طباعة', nameEn: 'Paper & Media', slug: 'paper-media', sortOrder: 4 },
                            }),
                            prisma.category.upsert({
                                where: { slug: 'spare-parts' },
                                update: {},
                                create: { nameAr: 'قطع غيار', nameEn: 'Spare Parts', slug: 'spare-parts', sortOrder: 5 },
                            }),
                        ])];
                case 1:
                    categories = _a.sent();
                    console.log("\u2705 ".concat(categories.length, " categories seeded"));
                    return [4 /*yield*/, Promise.all([
                            prisma.brand.upsert({
                                where: { slug: 'hp' },
                                update: {},
                                create: { nameEn: 'HP', nameAr: 'اتش بي', slug: 'hp', country: 'USA', isFeatured: true },
                            }),
                            prisma.brand.upsert({
                                where: { slug: 'canon' },
                                update: {},
                                create: { nameEn: 'Canon', nameAr: 'كانون', slug: 'canon', country: 'Japan', isFeatured: true },
                            }),
                            prisma.brand.upsert({
                                where: { slug: 'epson' },
                                update: {},
                                create: { nameEn: 'Epson', nameAr: 'ابسون', slug: 'epson', country: 'Japan', isFeatured: true },
                            }),
                            prisma.brand.upsert({
                                where: { slug: 'brother' },
                                update: {},
                                create: { nameEn: 'Brother', nameAr: 'براذر', slug: 'brother', country: 'Japan', isFeatured: true },
                            }),
                            prisma.brand.upsert({
                                where: { slug: 'lexmark' },
                                update: {},
                                create: { nameEn: 'Lexmark', nameAr: 'ليكسمارك', slug: 'lexmark', country: 'USA' },
                            }),
                        ])];
                case 2:
                    brands = _a.sent();
                    console.log("\u2705 ".concat(brands.length, " brands seeded"));
                    return [4 /*yield*/, bcrypt.hash('Admin@PrintFalcon2025!', 12)];
                case 3:
                    adminPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@printbyfalcon.com' },
                            update: {},
                            create: {
                                email: 'admin@printbyfalcon.com',
                                firstName: 'Super',
                                lastName: 'Admin',
                                passwordHash: adminPassword,
                                role: client_1.Role.SUPERADMIN,
                                isVerified: true,
                                isActive: true,
                            },
                        })];
                case 4:
                    admin = _a.sent();
                    console.log("\u2705 Admin user seeded: ".concat(admin.email));
                    hpBrand = brands.find(function (b) { return b.slug === 'hp'; });
                    canonBrand = brands.find(function (b) { return b.slug === 'canon'; });
                    epsonBrand = brands.find(function (b) { return b.slug === 'epson'; });
                    inkCategory = categories.find(function (c) { return c.slug === 'ink-cartridges'; });
                    printerCategory = categories.find(function (c) { return c.slug === 'printers'; });
                    tonerCategory = categories.find(function (c) { return c.slug === 'toner'; });
                    products = [
                        {
                            nameAr: 'خرطوشة حبر HP 680 أسود',
                            nameEn: 'HP 680 Black Ink Cartridge',
                            slug: 'hp-680-black-ink',
                            sku: 'HP-680-BK',
                            price: 299,
                            stock: 50,
                            categoryId: inkCategory.id,
                            brandId: hpBrand.id,
                            status: client_1.ProductStatus.ACTIVE,
                        },
                        {
                            nameAr: 'خرطوشة حبر HP 680 ملونة',
                            nameEn: 'HP 680 Color Ink Cartridge',
                            slug: 'hp-680-color-ink',
                            sku: 'HP-680-CL',
                            price: 349,
                            stock: 40,
                            categoryId: inkCategory.id,
                            brandId: hpBrand.id,
                            status: client_1.ProductStatus.ACTIVE,
                        },
                        {
                            nameAr: 'طابعة HP DeskJet 2335',
                            nameEn: 'HP DeskJet 2335 Printer',
                            slug: 'hp-deskjet-2335',
                            sku: 'HP-DJ-2335',
                            price: 1899,
                            stock: 15,
                            categoryId: printerCategory.id,
                            brandId: hpBrand.id,
                            status: client_1.ProductStatus.ACTIVE,
                        },
                        {
                            nameAr: 'خرطوشة حبر Canon PG-745 أسود',
                            nameEn: 'Canon PG-745 Black Ink Cartridge',
                            slug: 'canon-pg-745-black',
                            sku: 'CN-PG745-BK',
                            price: 275,
                            stock: 35,
                            categoryId: inkCategory.id,
                            brandId: canonBrand.id,
                            status: client_1.ProductStatus.ACTIVE,
                        },
                        {
                            nameAr: 'طابعة Epson L3250 متعددة الوظائف',
                            nameEn: 'Epson L3250 Multifunction Printer',
                            slug: 'epson-l3250',
                            sku: 'EP-L3250',
                            price: 5499,
                            salePrice: 4999,
                            stock: 8,
                            categoryId: printerCategory.id,
                            brandId: epsonBrand.id,
                            status: client_1.ProductStatus.ACTIVE,
                        },
                    ];
                    _i = 0, products_1 = products;
                    _a.label = 5;
                case 5:
                    if (!(_i < products_1.length)) return [3 /*break*/, 8];
                    product = products_1[_i];
                    return [4 /*yield*/, prisma.product.upsert({
                            where: { slug: product.slug },
                            update: {},
                            create: product,
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log("\u2705 ".concat(products.length, " products seeded"));
                    console.log('🎉 Database seeding complete!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
