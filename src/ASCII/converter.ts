import { ascii } from "./ASCII_table";

/**
 * @param hex hex number in the 0x0F format
 * @returns hex string. 0x0F -> 'F'
 */
function hex_to_string(hex: number) {
	return hex.toString(16);
}

/**
 *
 * @param hex string from the hex_to_string() function
 * @returns	binary string
 */
function hex_string_to_binary_string(hex: string) {
	return ("00000000" + parseInt(hex, 16).toString(2)).substr(-8);
}

/**
 *	Looks up the given char in the ascii table and returns the pixel values
 * @param char single character as a stringk
 * @returns pixel values as a 2d array
 */
export function convert_ascii(char: string) {
	if (char in ascii) {
		const hex_array = ascii[char];
		const binaries: boolean[][] = [];
		for (let i = 0; i < hex_array.length; i++) {
			const hex = hex_array[i];
			const hex_string = hex_to_string(hex);
			const binary_string = hex_string_to_binary_string(hex_string)
				.split("") // converts the string to an char array
				.reverse() // reverses the order (otherwise the character is upside-down)
				.map((i) => i == "1"); // converts the '0' and '1' strings to booleans
			binaries.push(binary_string);
		}
		return binaries;
	}
	throw new Error(`Invalid char: ${char}`);
}
