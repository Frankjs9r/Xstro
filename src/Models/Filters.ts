import { DataTypes } from "quantava";
import database from "../Core/database.ts";

export const Filters = database.define("filters", {
	name: { type: DataTypes.STRING, allowNull: false, unique: true },
	response: { type: DataTypes.STRING, allowNull: true },
	status: { type: DataTypes.BOOLEAN, defaultValue: false },
	isGroup: { type: DataTypes.BOOLEAN, allowNull: true },
});

export const setFilter = async (
	name: string,
	response: string,
	status: boolean,
	isGroup?: boolean,
) => {
	const exists = await Filters.findOne({ where: { name } });
	const query = {
		name,
		response,
		status: parseBooleanToInteger(status),
		isGroup: typeof isGroup === "boolean" && isGroup === true ? 1 : 0,
	};

	if (exists) {
		return await Filters.update(query, { where: { name } });
	} else {
		return await Filters.create(query);
	}
};

export const getFilter = async (name: string) => {
	name = name.trim().toLowerCase();
	const rec = (await Filters.findOne({ where: { name: name } })) as {
		name: string;
		response: string;
		status: number;
		isGroup: number;
	};
	return rec
		? {
				name: rec.name,
				response: rec.response,
				status: Boolean(rec.status),
				isGroup: Boolean(rec.isGroup),
			}
		: null;
};

export const getAllFilters = async () => {
	const recs = (await Filters.findAll({
		where: { status: 1 },
	})) as { name: string; response: string; status: number; isGroup: number }[];
	return recs.map(rec => ({
		name: rec.name,
		response: rec.response,
		status: Boolean(rec.status),
		isGroup: Boolean(rec.isGroup),
	}));
};

export const delFilter = async (name: string) => {
	return await Filters.destroy({ where: { name } });
};

function parseBooleanToInteger(value: boolean): number {
	if (typeof value !== "boolean") {
		throw new Error("Expected a boolean value");
	}
	return value ? 1 : 0;
}
