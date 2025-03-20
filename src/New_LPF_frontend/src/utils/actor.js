import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../declarations/New_LPF_backend/New_LPF_backend.did.js";

// Local development
const LOCAL_HOST = "http://localhost:4943";
const isLocalEnv = process.env.NODE_ENV !== "production";

export const createActor = (canisterId, options = {}) => {
  const agent = new HttpAgent({
    host: isLocalEnv ? LOCAL_HOST : options.host,
    ...options.agentOptions,
  });

  // Only needed for local development
  if (isLocalEnv) {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check if your local replica is running");
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

// Create a single instance of the actor
let backend = null;

export const getBackendActor = async () => {
  if (!backend) {
    const canisterId = process.env.CANISTER_ID_NEW_LPF_BACKEND || process.env.NEW_LPF_BACKEND_CANISTER_ID;
    backend = createActor(canisterId);
  }
  return backend;
};