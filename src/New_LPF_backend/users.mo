import Principal "mo:base/Principal";
import Post "post";
import Conversation "conversations";

module {
    public type User = {
        id: Principal;
        username: Text;
        email: Text;
        password: Text; // Note: In production, store password hashes, not plaintext
        posts: [Post.PostID];
        conversations: [Conversation.ConversationID];
        wallet_balance: Nat;
    };
}