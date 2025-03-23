import Time "mo:base/Time";
import Array "mo:base/Array";

module {
    public type User = {
        id : Nat;
        username : Text;
        email : Text;
        password : Text; // 🔥 Storing hashed passwords only
        wallet_balance : Nat;
        posts : [Nat];
        conversations : [Nat];
    };

};
