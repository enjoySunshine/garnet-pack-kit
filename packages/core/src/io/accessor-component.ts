import type { GLTF } from '../types/gltf.js';

/**
 * Per-component encoding and decoding for interleaved accessor data.
 *
 * Both the writer and the reader visit interleaved vertex data component by component, and the
 * two directions must agree on how each glTF component type is represented in bytes. Keeping
 * both directions in one table ensures that a layout change made here applies when writing and
 * reading interleaved data alike.
 *
 * @internal
 */
interface ComponentCodec {
	read(view: DataView, byteOffset: number): number;
	write(view: DataView, byteOffset: number, value: number): void;
}

// Hardcode enums from accessor.ts to avoid a circular dependency.
const COMPONENT_CODECS: Record<string, ComponentCodec> = {
	'5126': {
		// FLOAT
		read: (view, byteOffset) => view.getFloat32(byteOffset, true),
		write: (view, byteOffset, value) => view.setFloat32(byteOffset, value, true),
	},
	'5120': {
		// BYTE
		read: (view, byteOffset) => view.getInt8(byteOffset),
		write: (view, byteOffset, value) => view.setInt8(byteOffset, value),
	},
	'5122': {
		// SHORT
		read: (view, byteOffset) => view.getInt16(byteOffset, true),
		write: (view, byteOffset, value) => view.setInt16(byteOffset, value, true),
	},
	'5121': {
		// UNSIGNED_BYTE
		read: (view, byteOffset) => view.getUint8(byteOffset),
		write: (view, byteOffset, value) => view.setUint8(byteOffset, value),
	},
	'5123': {
		// UNSIGNED_SHORT
		read: (view, byteOffset) => view.getUint16(byteOffset, true),
		write: (view, byteOffset, value) => view.setUint16(byteOffset, value, true),
	},
	'5125': {
		// UNSIGNED_INT
		read: (view, byteOffset) => view.getUint32(byteOffset, true),
		write: (view, byteOffset, value) => view.setUint32(byteOffset, value, true),
	},
	'5131': {
		// FLOAT16, KHR_accessor_float16
		read: (view, byteOffset) => view.getFloat16(byteOffset, true),
		write: (view, byteOffset, value) => view.setFloat16(byteOffset, value, true),
	},
	'5130': {
		// FLOAT64, KHR_accessor_float64
		read: (view, byteOffset) => view.getFloat64(byteOffset, true),
		write: (view, byteOffset, value) => view.setFloat64(byteOffset, value, true),
	},
};

function getComponentCodec(componentType: GLTF.AccessorComponentType): ComponentCodec {
	const codec = COMPONENT_CODECS[componentType];
	if (!codec) throw new Error(`Unexpected component type: ${componentType}.`);
	return codec;
}

/** Reads one component of an interleaved accessor from its bytes. @internal */
export function readComponent(view: DataView, byteOffset: number, componentType: GLTF.AccessorComponentType): number {
	return getComponentCodec(componentType).read(view, byteOffset);
}

/** Writes one component of an interleaved accessor to its bytes. @internal */
export function writeComponent(
	view: DataView,
	byteOffset: number,
	value: number,
	componentType: GLTF.AccessorComponentType,
): void {
	getComponentCodec(componentType).write(view, byteOffset, value);
}
