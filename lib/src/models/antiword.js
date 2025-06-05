import { DataType } from "quantava";
import database from "../messaging/database.js";
const Antiword = database.define("antiword", {
    jid: { type: DataType.STRING, allowNull: false, primaryKey: true },
    status: { type: DataType.BOOLEAN, allowNull: true, defaultValue: null },
    words: { type: DataType.JSON, allowNull: true },
});
export async function setAntiWord(jid, status, words) {
    const badWords = Array.from(new Set(words));
    const mode = status === true ? 1 : 0;
    const record = await Antiword.upsert({ jid, status: mode, words: badWords });
    if (!record)
        return undefined;
    return {
        enabled: true,
        words: badWords.length,
    };
}
export async function delAntiword(jid) {
    const deleted = (await Antiword.destroy({ where: { jid } }));
    return deleted > 0;
}
export async function getAntiword(jid) {
    const record = (await Antiword.findOne({ where: { jid } }));
    if (!record)
        return null;
    return {
        jid: record.jid,
        status: Boolean(record.status),
        words: record.words ? JSON.parse(record.words) : [],
    };
}
