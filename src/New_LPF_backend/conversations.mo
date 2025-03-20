import Principal "mo:base/Principal";
import Message "message";

module {
    public type ConversationID = Nat;
    public type TransactionID = Nat;
    
    public type Conversation = {
        id: ConversationID;
        users: [Principal];
        messages: [Message.Message];
        proofs: [Text]; // URLs of proof images
        reward_transaction: ?TransactionID;
    };
}