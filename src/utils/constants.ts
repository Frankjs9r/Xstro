import { jidNormalizedUser, type WASocket } from 'baileys';

export function isPath(text: string): boolean {
	if (typeof text !== 'string' || text.trim() === '') return false;

	return /^(?:\.|\.\.|[a-zA-Z]:)?[\/\\]?[a-zA-Z0-9_\-.]+(?:[\/\\][a-zA-Z0-9_\-.]+)*(?:\.[a-zA-Z0-9]+)?$/.test(
		text.trim(),
	);
}

export function isText(text: string): boolean {
	if (typeof text !== 'string' || text.trim() === '') return false;

	const trimmedText = text.trim();
	const bufferPattern =
		/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)$/;
	const hexPattern = /^(?:0x)?[0-9a-fA-F]+$/;

	return !bufferPattern.test(trimmedText) && !hexPattern.test(trimmedText);
}

export function formatDate(timestamp: number | Date): string {
	const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export function formatRuntime(seconds: number): string {
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	const dDisplay = d > 0 ? `${d} d ` : '';
	const hDisplay = h > 0 ? `${h} h ` : '';
	const mDisplay = m > 0 ? `${m} m ` : '';
	const sDisplay = s > 0 ? `${s} s` : '';
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))}${sizes[i]}`;
}


export function isLid(id?: string) {
	if (!id) return undefined;
	if (id.toLowerCase().trim().endsWith('@lid')) {
		return true;
	}
	return undefined;
}

/**
 * Purpose of this function is to simply remove the "@" at the end of the jid/lid string
 */
export function cleanJidLid(input: string): string {
	if (!input) return '';
	return input.split('@')[0];
}

export function parseBoolean(stringStatement: string): boolean {
	stringStatement = stringStatement.toLowerCase().trim();
	if (stringStatement === 'false') {
		return false;
	}
	return true;
}

export function toStandardCase(text: string): string {
	if (!text) return '';
	text = text.trim();
	return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

export function fancy(text: any): string {
	const fancyMap: Record<string, string> = {
		a: 'ᴀ',
		b: 'ʙ',
		c: 'ᴄ',
		d: 'ᴅ',
		e: 'ᴇ',
		f: 'ғ',
		g: 'ɢ',
		h: 'ʜ',
		i: 'ɪ',
		j: 'ᴊ',
		k: 'ᴋ',
		l: 'ʟ',
		m: 'ᴍ',
		n: 'ɴ',
		o: 'ᴏ',
		p: 'ᴘ',
		q: 'ǫ',
		r: 'ʀ',
		s: 's',
		t: 'ᴛ',
		u: 'ᴜ',
		v: 'ᴠ',
		w: 'ᴡ',
		x: 'x',
		y: 'ʏ',
		z: 'ᴢ',
	};

	text = String(text).toLowerCase();

	return text
		.split('')
		.map((char: string) => fancyMap[char] || char)
		.join('');
}

export async function isAdmin(
	client: WASocket,
	groupJid: string,
	sender: string,
) {
	const metadata = await client.groupMetadata(groupJid);
	const allAdmins = metadata.participants
		.filter(v => v.admin !== null)
		.map(v => v.id);
	return allAdmins.includes(sender);
}

export async function isBotAdmin(
	client: Pick<WASocket, 'groupMetadata' | 'user'>,
	groupJid: string,
) {
	const jid = jidNormalizedUser(client.user?.id);
	const lid = jidNormalizedUser(client?.user?.lid);
	const metadata = await client.groupMetadata(groupJid);
	const allAdmins = metadata.participants
		.filter(v => v.admin !== null)
		.map(v => v.id);
	if (metadata.addressingMode === 'lid') return allAdmins.includes(lid);
	return allAdmins.includes(jid);
}
