import { ascii } from "./ASCII_table";

function hex_to_string(hex: number) {
	return hex.toString(16);
}
function hex_string_to_binary_string(hex: string) {
	return ("00000000" + parseInt(hex, 16).toString(2)).substr(-8);
}

export function convert_ascii(char: string) {
	if (char in ascii) {
		const hex_array = ascii[char];
		const binaries: boolean[][] = [];
		for (let i = 0; i < hex_array.length; i++) {
			const hex = hex_array[i];
			const hex_string = hex_to_string(hex);
			const binary_string = hex_string_to_binary_string(hex_string)
				.split("")
				.reverse()
				.map((i) => i == "1");
			binaries.push(binary_string);
		}
		return binaries;
	}
	throw new Error(`Invalid char: ${char}`);
}
