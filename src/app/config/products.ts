export const PRODUCT_PRICE = {
	material: {
		silicone: 0,
		polycarbonate: 5_00, // $5 0cents
	},
	finish: {
		smooth: 0,
		textured: 3_00,
	},
} as const;
// to extract the exact values from the object and not just the types

export const BASE_PRICE = 14_00;
