
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAgent, useIdentityKit } from "@nfid/identitykit/react";
import { Actor, HttpAgent } from "@dfinity/agent";

import { createActor } from "../../../../declarations/New_LPF_backend/index";
// import { useDispatch } from "react-redux";
// import { loginSuccess, setAuthContext } from "../Redux/Reducers/InternetIdentityReducer";
// import { setActor } from "../Redux/Reducers/actorBindReducer";

import { idlFactory as ledgerIDL } from "./ledger.did.js";
const AuthContext = createContext();

const canisterID = process.env.CANISTER_ID_NEW_LPF_BACKEND;
export const useAuthClient = () => {
    const identityKit = useIdentityKit();


    const [isConnected, setIsConnected] = useState(false);
    const [principal, setPrincipal] = useState(null);
    const [backendActor, setBackendActor] = useState(createActor(canisterID));
    const [orderPlacementLoad, setOrderPlacementLoad] = useState(false);
    const [delegation, setDelegation] = useState(null);
    const [agent, setAgent] = useState(null);
    const authenticatedAgent = useAgent()
    const [isLoading, setIsLoading] = useState(true);
    // const dispatch = useDispatch();
    const {
        // agent,
        user,
        identity,
        accounts,
        connect,
        disconnect,
    } = useIdentityKit();



    useEffect(() => {
        const createAgent = async () => {
            if (authenticatedAgent) {
                console.log("Authenticated Agent Identity:", authenticatedAgent);

                setIsLoading(true);
                const agentInstance = new HttpAgent({ host: process.env.HOST || "https://ic0.app" });
                if (process.env.DFX_NETWORK !== "ic") {
                    await agentInstance.fetchRootKey();
                }
                console.log(" agent created:", agent);
                const newActor = Actor.createActor(ledgerIDL, {
                    agent: agentInstance,
                    canisterId: canisterID,
                });

                setAgent(authenticatedAgent);
                setBackendActor(newActor);

                // dispatch(setActor(newActor));
                console.log("Actor and Agent initialized successfully.");
            } else {
                setIsLoading(false);
                console.error("Failed to initialize agent and actor:", error);
            }
        };

        createAgent();
    }, [authenticatedAgent]);



    //actor
    useEffect(() => {
        if (agent) {
            const initActor = async () => {
                try {
                    const actor = createActor(process.env.CANISTER_ID_ICPLAUNCHPAD_BACKEND, { agent });

                    // dispatch(setActor(actor));
                    console.log("Authenticated actor initialized.");
                } catch (error) {
                    console.error("Failed to create actor:", error);
                }
            };
            initActor();
        }
    }, [agent]);



    useEffect(() => {
        const fetchPrincipal = async () => {
            if (user) {
                setIsConnected(true);
                try {
                    const userPrincipal = await user.principal;
                    setPrincipal(userPrincipal);
                    // dispatch(loginSuccess({ isAuthenticated: true, principal: userPrincipal }));
                } catch (error) {
                    console.error("Error fetching principal:", error);
                    setPrincipal(null);
                }
            } else {
                setIsConnected(false);
                setPrincipal(null);
            }
        };
        fetchPrincipal();
    }, [user]);



    useEffect(() => {
        const genCanister = async () => {
            const backend = Actor.createActor(ledgerIDL, {
                agent: agent,
                canisterId: canisterID,
            });
            setBackendActor(backend);
        };
        genCanister();
        setDelegation(identity);
        console.log("delegation is ", delegation);
    }, [agent]);


    const login = useCallback(() => {
        connect();
        // dispatch(loginStart());
    }, [connect]);

    // const logout = useCallback(async () => {
    //     await disconnect();
    //     setIsConnected(false);
    //     setPrincipal(null);
    //     setBackendActor(null);
    //     setAgent(null);
    // }, [disconnect]);

    const host = "http://127.0.0.1:4943/";
    const createCustomActor = async (canisterId) => {
        try {
            console.log("Identity value before agent creation:", identity);
            console.log("Creating actor for canister ID:", canisterId);

            const agent = new HttpAgent({ identity, host });

            if (process.env.DFX_NETWORK !== "ic") {
                await agent.fetchRootKey().catch((err) => {
                    console.warn(
                        "Unable to fetch root key. Check your local replica.",
                        err
                    );
                });
            }

            const ledgerActor = Actor.createActor(ledgerIDL, { agent, canisterId });
            console.log("Created ledger actor:", ledgerActor);
            return ledgerActor;
        } catch (err) {
            console.error("Error creating ledger actor:", err);
        }
    };
    return {
        isAuthenticated: isConnected,
        login,
        logout: disconnect,
        principal,
        agent: agent || null,
        // createCustomActor: backendActor || null,
        createCustomActor,
        identity,
        orderPlacementLoad,
        setOrderPlacementLoad,
        actor: createActor(canisterID, {
            agentOptions: { identity, verifyQuerySignatures: false },
        }),
    };
};

export const AuthProvider = ({ children }) => {
    const auth = useAuthClient();
    // const dispatch = useDispatch();

    useEffect(() => {
        // Dispatch the auth context to Redux for saga access
        if (auth) { // This will log the data
            console.log("Auth is ", auth);
            // dispatch(setAuthContext(auth));
        }
    }, [auth]);
    console.log("Auth is ", auth);
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useBackend = () => { };

export const useAuth = () => useContext(AuthContext);










