
interface Pointer {
	clientX: number;
	clientY: number;
	screenX: number;
	screenY: number;
	pageX: number;
	pageY: number;
	tiltX: number;
	tiltY: number;
	pressure: number;
	hwTimestamp: number;
	pointerType: string;
	identifier: number;
}

interface PointerEvent extends Event {
	getPointerList(): Pointer[];
}

interface GestureScaleEvent extends Event {
	centerX: number;
	centerY: number;
	scale: number;
}

