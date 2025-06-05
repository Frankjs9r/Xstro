import util from "util";
import { Command } from "../messaging/plugin.js";
Command({
    on: true,
    dontAddCommandList: true,
    function: async (message) => {
        if (!message.sudo)
            return;
        const text = message.text;
        if (!text?.startsWith("$ "))
            return;
        const code = text.slice(2);
        try {
            const result = await eval(`(async () => { ${code} })()`);
            const output = util.inspect(result, { depth: 1 });
            await message.send(output);
        }
        catch (error) {
            const err = util.inspect(error, { depth: 1 });
            await message.send(err);
        }
    },
});
