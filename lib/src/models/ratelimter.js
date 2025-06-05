import { DataType } from "quantava";
import database from "../messaging/database.js";
const ratelimiter = database.define("ratelimiter", {
    sender: { type: DataType.STRING, allowNull: false, primaryKey: true },
    request_count: { type: DataType.INTEGER, allowNull: false, defaultValue: 0 },
    last_request_date: { type: DataType.STRING, allowNull: false },
});
function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}
export async function canProceed(sender) {
    const today = getTodayDate();
    const record = (await ratelimiter.findOne({ where: { sender } }));
    if (!record) {
        await ratelimiter.create({
            sender,
            request_count: 1,
            last_request_date: today,
        });
        return true;
    }
    if (record.last_request_date !== today) {
        record.request_count = 1;
        record.last_request_date = today;
        await ratelimiter.update(record, { where: { sender } });
        return true;
    }
    if (record.request_count >= 10)
        return false;
    record.request_count += 1;
    await ratelimiter.update(record, { where: { sender } });
    return true;
}
export async function resetAllLimits() {
    const today = getTodayDate();
    const users = (await ratelimiter.findAll());
    for (const user of users) {
        user.request_count = 0;
        user.last_request_date = today;
        await ratelimiter.update(user, { where: { sender: user.sender } });
    }
}
export async function getRemainingQuota(sender) {
    const today = getTodayDate();
    const record = (await ratelimiter.findOne({ where: { sender } }));
    if (!record || record.last_request_date !== today)
        return 10;
    return Math.max(0, 10 - record.request_count);
}
export async function resetIfExpired() {
    const users = (await ratelimiter.findAll());
    const now = Date.now();
    for (const user of users) {
        const last = new Date(user.last_request_date).getTime();
        const hours = (now - last) / (1000 * 60 * 60);
        if (hours >= 24) {
            user.request_count = 0;
            user.last_request_date = new Date().toISOString();
            await ratelimiter.update(user, { where: { sender: user.sender } });
        }
    }
}
