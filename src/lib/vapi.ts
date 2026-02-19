import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "";

if (!VAPI_PUBLIC_KEY) {
    console.error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY in environment variables");
}

let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
    if (!vapiInstance) {
        vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
    }
    return vapiInstance;
}
