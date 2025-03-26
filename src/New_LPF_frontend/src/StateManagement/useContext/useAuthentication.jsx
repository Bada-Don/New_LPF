
// import { ConnectedWalletButton } from "@nfid/identitykit/react";
// import { createContext, useContext } from "react";

// const AuthenticationContext = createContext();

// export default function useAuthentication() {
//   const login = ({ connectedAccount, icpBalance, ...props }) => (
//     <ConnectedWalletButton {...props}>
//       {`Disconnect ${connectedAccount} ${icpBalance} ICP`}
//     </ConnectedWalletButton>
//   );

//   return { login };
// }

// export const AuthenticationProvider = ({ children }) => {
//   const authentication = useAuthentication();
//   console.log("Auth is ", authentication);
//   return (
//     <AuthenticationContext.Provider value={authentication}>
//       {children}
//     </AuthenticationContext.Provider>
//   );
// };


import { ConnectedWalletButton } from "@nfid/identitykit/react";
import { createContext, useContext, useMemo } from "react";
import { useIdentityKit } from "@nfid/identitykit/react"; 

// Create Authentication Context
const AuthenticationContext = createContext();

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};

// Authentication Provider Component
export const AuthenticationProvider = ({ children }) => {
  
  const {
    user,
    icpBalance,
    connect,
    disconnect,
  } = useIdentityKit();

  const authentication = useMemo(() => ({
    connectedAccount: user?.principal?.toText() || "", 
    icpBalance,
    connect,
    disconnect,
    renderConnectedButton: (props) => (
      <ConnectedWalletButton {...props}>
        {`Disconnect ${user?.principal?.toText()} ${icpBalance || 0} ICP`}
      </ConnectedWalletButton>
    ),
  }), [user, icpBalance, connect, disconnect]);

  console.log("Auth context value:", authentication);

  return (
    <AuthenticationContext.Provider value={authentication}>
      {children}
    </AuthenticationContext.Provider>
  );
};
