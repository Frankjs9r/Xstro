import {
	BufferJSON,
	initAuthCreds,
	WAProto,
	type AuthenticationCreds,
	type SignalDataTypeMap,
} from "baileys";
import database from "../messaging/database.ts";
import { DataType } from "quantava";

export const auth = database.define(
	"auth",
	{
		name: { type: DataType.STRING, allowNull: true, primaryKey: true },
		data: { type: DataType.JSON, allowNull: true },
	},
	{ timestamps: false },
);

export default async function () {
	const writeData = async (data: any, name: string) => {
		return await auth.upsert({
			name,
			data: JSON.parse(JSON.stringify(data ?? {})),
		});
	};

	const readData = async (name: string) => {
		const exists = (await auth.findOne({ where: { name } })) as {
			name: string;
			data: string;
		};
		try {
			return JSON.parse(exists.data, BufferJSON.reviver);
		} catch {
			return null;
		}
	};

	const removeData = async (name: string) => {
		await auth.destroy({ where: { name } });
	};

	const creds: AuthenticationCreds =
		(await readData("creds")) || initAuthCreds();

	return {
		state: {
			creds,
			keys: {
				get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
					const data: { [id: string]: SignalDataTypeMap[T] } = {} as any;
					await Promise.all(
						ids.map(async id => {
							let value = await readData(`${type}-${id}`);
							if (type === "app-state-sync-key" && value) {
								try {
									value = WAProto.Message.AppStateSyncKeyData.fromObject(value);
								} catch (e) {
									console.error(
										`Failed to decode AppStateSyncKeyData for ID "${id}":`,
										e,
									);
								}
							}
							data[id] = value as SignalDataTypeMap[T];
						}),
					);
					return data;
				},
				set: async (data: { [category: string]: { [id: string]: any } }) => {
					const tasks = Object.entries(data).flatMap(([category, ids]) =>
						Object.entries(ids).map(([id, value]) =>
							(value
								? writeData(value, `${category}-${id}`)
								: removeData(`${category}-${id}`)
							).then(() => {}),
						),
					);
					await Promise.all(tasks);
				},
			},
		},
		saveCreds: async () => {
			return (await writeData(creds, "creds")) as void;
		},
	};
}
