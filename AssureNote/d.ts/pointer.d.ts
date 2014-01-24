
interface PointerEvent extends MouseEvent {
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    tiltX: number;
    tiltY: number;
    pointerType: string;
    isPrimary: boolean;
}

interface Element {
    ongotpointercapture: any;
    onlostpointercapture: any;
    setPointerCapture(pointerId: number): void;
    releasePointerCapture(pointerId: number): void;
}

interface GestureScaleEvent extends Event {
	centerX: number;
	centerY: number;
	scale: number;
}

