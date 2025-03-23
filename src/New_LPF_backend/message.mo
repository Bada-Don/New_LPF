module {
    public type Message = {
        id: Nat;
        senderId: Nat;
        receiverId: Nat;
        content: Text;
        timestamp: Int;
    };
};
