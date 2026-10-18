import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** Service worker de simulation, démarré uniquement si VITE_ENABLE_MOCKS=true. */
export const worker = setupWorker(...handlers);
