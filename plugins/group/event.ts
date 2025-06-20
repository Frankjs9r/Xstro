import { Command } from "../../src/Core/plugin.ts";
import {
	setGroupEvent,
	getGroupEvent,
	delGroupEvent,
} from "../../src/Models/index.ts";

Command({
	name: "event",
	fromMe: true,
	isGroup: true,
	desc: "Enable or disable group event mode",
	type: "group",
	function: async (msg, args) => {
		const groupJid = msg.jid;

		if (!args) {
			const isEnabled = await getGroupEvent(groupJid);
			const state = isEnabled ? "ON" : "OFF";
			return msg.send(`_Group event mode is currently: ${state.toLowerCase()}_`);
		}

		const mode = args.toLowerCase();
		if (mode === "on") {
			await setGroupEvent(groupJid, true);
			return msg.send("_Group event mode enabled_");
		}

		if (mode === "off") {
			await delGroupEvent(groupJid);
			return msg.send("_Group event mode disabled_");
		}

		return msg.send("_Usage: event <on|off>_");
	},
});
