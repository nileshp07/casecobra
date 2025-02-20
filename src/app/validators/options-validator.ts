// commenting colors are !IMPORTANT as tailwind does not support dynamic tailwind classnames

import {PRODUCT_PRICE} from '../config/products';

// bg-zinc-900 border-zinc-900
// bg-rose-950 border-rose-950
// bg-blue-950 border-blue-950

export const COLORS = [
	{
		label: 'Black',
		value: 'black',
		tw: 'zinc-900',
	},
	{
		label: 'Blue',
		value: 'blue',
		tw: 'blue-950',
	},
	{
		label: 'Rose',
		value: 'rose',
		tw: 'rose-950',
	},
] as const;
// as const to read the exact values from the array and not just the type of fields

export const MODELS = {
	name: 'models',
	options: [
		{
			label: 'iPhone X',
			value: 'iphonex',
		},
		{
			label: 'iPhone 11',
			value: 'iphone11',
		},
		{
			label: 'iPhone 12',
			value: 'iphone12',
		},
		{
			label: 'iPhone 13',
			value: 'iphone14',
		},
		{
			label: 'iPhone 15',
			value: 'iphone15',
		},
	],
} as const;

export const MATERIALS = {
	name: 'material',
	options: [
		{
			label: 'Silicone',
			value: 'silicone',
			description: undefined,
			price: PRODUCT_PRICE.material.silicone,
		},
		{
			label: 'Polycarbonate',
			value: 'polycarbonate',
			description: 'Scratch resistant coating',
			price: PRODUCT_PRICE.material.polycarbonate,
		},
	],
} as const;

export const FINISHES = {
	name: 'finish',
	options: [
		{
			label: 'Smooth Finish',
			value: 'smooth',
			description: undefined,
			price: PRODUCT_PRICE.finish.smooth,
		},
		{
			label: 'Textured Finish',
			value: 'textured',
			description: 'Soft gripy texture',
			price: PRODUCT_PRICE.finish.textured,
		},
	],
} as const;
