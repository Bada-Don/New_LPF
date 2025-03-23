import Time "mo:base/Time";

module {
    public type Conversation = {
        id: Nat;
        users: [Nat];         // Users involved in the conversation
        messages: [Message];  // Array of messages exchanged
        proofs: [Text];       // Image proofs for found pets
        reward_transaction: ?Nat; // Transaction ID if reward is claimed
    };

    public type Message = {
        id: Nat;
        senderId: Nat;
        content: Text;
        timestamp: Int;
    };
}
