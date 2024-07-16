'use server';

import {db} from '@/db';
import {CaseColor, CaseFinish, CaseMaterial, PhoneModel} from '@prisma/client';

export type saveConfigArgs = {
	color: CaseColor;
	finish: CaseFinish;
	model: PhoneModel;
	material: CaseMaterial;
	configId: string;
};

export async function saveConfigAction({color, finish, model, material, configId}: saveConfigArgs) {
	await db.configuration.update({
		where: {
			id: configId,
		},
		data: {
			color,
			finish,
			material,
			model,
		},
	});
}
