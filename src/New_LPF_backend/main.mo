import Users "./users";
import Message "./message";
import Time "mo:base/Time";
import Array "mo:base/Array";
import PetPost "./PetPost";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";
import Result "mo:base/Result";

actor New_LPF_backend {

  // Initialize counters
  stable var nextUserId : Nat = 0;
  stable var nextMessageId : Nat = 0;
  stable var nextPostId : Nat = 0;
  stable var nextConvoId : Nat = 0;

  // Define Conversation type
  type Conversation = {
    id : Nat;
    users : [Nat];
    messages : [Message.Message];
    proofs : [Text]; // Assuming this is an array of proof URLs or IDs
    reward_transaction : ?Nat; // Optional transaction ID
  };

  // Stable storage for upgrades
  stable var usersEntries : [(Nat, Users.User)] = [];
  stable var messagesEntries : [(Nat, Message.Message)] = [];
  stable var petPostsEntries : [(Nat, PetPost.PetPost)] = [];
  stable var conversationsEntries : [(Nat, Conversation)] = [];

  // HashMaps for runtime
  var users = HashMap.fromIter<Nat, Users.User>(usersEntries.vals(), 10, Nat.equal, func(x : Nat) : Nat32 { Nat32.fromNat(x) });
  var messages = HashMap.fromIter<Nat, Message.Message>(messagesEntries.vals(), 10, Nat.equal, func(x : Nat) : Nat32 { Nat32.fromNat(x) });
  var petPosts = HashMap.fromIter<Nat, PetPost.PetPost>(petPostsEntries.vals(), 10, Nat.equal, func(x : Nat) : Nat32 { Nat32.fromNat(x) });
  var conversations = HashMap.fromIter<Nat, Conversation>(conversationsEntries.vals(), 10, Nat.equal, func(x : Nat) : Nat32 { Nat32.fromNat(x) });

  // Simple password hashing (placeholder)
  func hashPassword(password : Text) : Text {
    return password; // Replace with actual hashing implementation
  };

  // System upgrade hooks
  system func preupgrade() {
    usersEntries := Iter.toArray(users.entries());
    messagesEntries := Iter.toArray(messages.entries());
    petPostsEntries := Iter.toArray(petPosts.entries());
    conversationsEntries := Iter.toArray(conversations.entries());
  };

  system func postupgrade() {
    usersEntries := [];
    messagesEntries := [];
    petPostsEntries := [];
    conversationsEntries := [];
  };

  public shared func registerUser(username : Text, email : Text, password : Text) : async Nat {
    let userId = nextUserId;
    let hashedPassword = hashPassword(password); // 🔐 Hash before storing

    users.put(
      userId,
      {
        id = userId;
        username = username;
        email = email;
        password = hashedPassword;
        wallet_balance = 0;
        posts = [];
        conversations = [];
      },
    );

    nextUserId += 1;
    return userId;
  };

  public query func getUser(userId : Nat) : async ?Users.User {
    return users.get(userId);
  };

  public func sendMessage(convoId : Nat, senderId : Nat, content : Text) : async Nat {
    let messageId = nextMessageId;

    // Get the conversation to find the receiver
    switch (conversations.get(convoId)) {
      case (?convo) {
        // Find the receiverId (the user that's not the sender)
        // Find the receiverId (the user that's not the sender)
        var receiverId : Nat = 0;
        for (userId in convo.users.vals()) {
          if (userId != senderId) {
            receiverId := userId;
          };
        };

        // If we couldn't find a receiver, use the first user as a fallback
        if (receiverId == 0 and convo.users.size() > 0) {
          receiverId := convo.users[0];
        };

        let newMessage : Message.Message = {
          id = messageId;
          senderId = senderId;
          receiverId = receiverId;
          content = content;
          timestamp = Time.now();
        };

        messages.put(messageId, newMessage);
        nextMessageId += 1;

        // Update the conversation with the new message
        let updatedMessages = Array.append(convo.messages, [newMessage]);
        let updatedConversation = {
          id = convo.id;
          users = convo.users;
          messages = updatedMessages;
          proofs = convo.proofs;
          reward_transaction = convo.reward_transaction;
        };
        conversations.put(convoId, updatedConversation);

        return messageId;
      };
      case null {
        // Conversation not found
        return 0; // Return 0 to indicate failure
      };
    };
  };

  public query func getMessagesForUser(userId : Nat) : async [Message.Message] {
    let userMessages = Iter.toArray(
      Iter.filter(
        messages.vals(),
        func(m : Message.Message) : Bool {
          m.senderId == userId or m.receiverId == userId;
        },
      )
    );
    return userMessages;
  };

  public func reportPet(
    userId : Nat,
    petName : Text,
    petType : Text,
    breed : Text,
    color : Text,
    height : Text,
    lastSeenLocation : Text,
    description : Text,
    photos : [Text],
    awardAmount : Nat,
    category : PetPost.PetCategory,
  ) : async Nat {
    if (photos.size() > 5) {
      return 0; // Return 0 to indicate failure - too many photos
    };

    let postId = nextPostId;

    let newPost : PetPost.PetPost = {
      id = postId;
      userId = userId;
      petName = petName;
      pet_type = petType;
      breed = breed;
      color = color;
      height = height;
      last_seen_location = lastSeenLocation;
      description = description;
      photos = photos;
      award_amount = awardAmount;
      status = #Active;
      category = category;
      timestamp = Time.now();
    };

    petPosts.put(postId, newPost);
    nextPostId += 1;

    // Update the user's post list
    switch (users.get(userId)) {
      case (?user) {
        let updatedUser = {
          id = user.id;
          username = user.username;
          email = user.email;
          password = user.password;
          wallet_balance = user.wallet_balance;
          posts = Array.append(user.posts, [postId]);
          conversations = user.conversations;
        };
        users.put(userId, updatedUser);
      };
      case null { /* User not found */ };
    };

    return postId;
  };

  public query func getAllPetPosts() : async [PetPost.PetPost] {
    return Iter.toArray(petPosts.vals());
  };

  public func startConversation(user1 : Nat, user2 : Nat) : async Result.Result<Nat, Text> {
    // Check if both users exist
    switch (users.get(user1)) {
      case null { return #err("User 1 not found") };
      case _ {};
    };

    switch (users.get(user2)) {
      case null { return #err("User 2 not found") };
      case _ {};
    };

    // Check if a conversation already exists between these users
    let existingConvo = Iter.toArray(
      Iter.filter(
        conversations.vals(),
        func(c : Conversation) : Bool {
          (Array.indexOf<Nat>(user1, c.users, Nat.equal) != null and 
           Array.indexOf<Nat>(user2, c.users, Nat.equal) != null)
        }
      )
    );

    if (existingConvo.size() > 0) {
      // Return the ID of the existing conversation
      return #ok(existingConvo[0].id);
    };

    let convoId = nextConvoId;

    let newConversation : Conversation = {
      id = convoId;
      users = [user1, user2];
      messages = [];
      proofs = [];
      reward_transaction = null;
    };

    conversations.put(convoId, newConversation);
    nextConvoId += 1;

    // Add conversation to both users' conversation lists
    switch (users.get(user1)) {
      case (?user) {
        let updatedUser = {
          id = user.id;
          username = user.username;
          email = user.email;
          password = user.password;
          wallet_balance = user.wallet_balance;
          posts = user.posts;
          conversations = Array.append(user.conversations, [convoId]);
        };
        users.put(user1, updatedUser);
      };
      case null {
        // This shouldn't happen as we checked above, but handle it anyway
        return #err("Failed to update user 1 with conversation");
      };
    };

    switch (users.get(user2)) {
      case (?user) {
        let updatedUser = {
          id = user.id;
          username = user.username;
          email = user.email;
          password = user.password;
          wallet_balance = user.wallet_balance;
          posts = user.posts;
          conversations = Array.append(user.conversations, [convoId]);
        };
        users.put(user2, updatedUser);
      };
      case null {
        // This shouldn't happen as we checked above, but handle it anyway
        return #err("Failed to update user 2 with conversation");
      };
    };

    return #ok(convoId);
};

  public func resolvePetPost(postId : Nat, resolverId : Nat) : async Bool {
    switch (petPosts.get(postId)) {
      case (?post) {
        if (post.status != #Active) {
          return false; // Case is already resolved
        };

        // Update post status to resolved
        let updatedPost = {
          id = post.id;
          userId = post.userId;
          petName = post.petName;
          pet_type = post.pet_type;
          breed = post.breed;
          color = post.color;
          height = post.height;
          last_seen_location = post.last_seen_location;
          description = post.description;
          photos = post.photos;
          award_amount = post.award_amount;
          status = #Resolved;
          category = post.category;
          timestamp = post.timestamp;
        };
        petPosts.put(postId, updatedPost);

        // If there's a reward, transfer it to the resolver
        if (post.award_amount > 0) {
          let ownerOpt = users.get(post.userId);
          let resolverOpt = users.get(resolverId);

          switch (ownerOpt, resolverOpt) {
            case (?owner, ?resolver) {
              // Check if owner has enough balance
              if (owner.wallet_balance < post.award_amount) {
                return false; // Owner doesn't have enough balance
              };

              // Deduct from owner
              let updatedOwner = {
                id = owner.id;
                username = owner.username;
                email = owner.email;
                password = owner.password;
                wallet_balance = owner.wallet_balance - post.award_amount;
                posts = owner.posts;
                conversations = owner.conversations;
              };
              users.put(owner.id, updatedOwner);

              // Add to resolver
              let updatedResolver = {
                id = resolver.id;
                username = resolver.username;
                email = resolver.email;
                password = resolver.password;
                wallet_balance = resolver.wallet_balance + post.award_amount;
                posts = resolver.posts;
                conversations = resolver.conversations;
              };
              users.put(resolver.id, updatedResolver);
            };
            case _ {
              return false; // User(s) not found
            };
          };
        };

        return true;
      };
      case null {
        return false; // Pet post not found
      };
    };
  };

  // Function to authenticate a user by email and password
  public func authenticateUser(email : Text, password : Text) : async ?Nat {
    let hashedPassword = hashPassword(password);

    // Find a user with matching email and password
    for ((id, user) in users.entries()) {
      if (user.email == email and user.password == hashedPassword) {
        return ?id;
      };
    };

    return null; // No matching user found
  };

  // Function to get user by email (helpful for checking if email exists)
  public query func getUserByEmail(email : Text) : async ?Users.User {
    for ((_, user) in users.entries()) {
      if (user.email == email) {
        return ?user;
      };
    };

    return null;
  };

  // Function to update user profile
  public shared func updateUserProfile(userId : Nat, username : Text, email : Text) : async Bool {
    switch (users.get(userId)) {
      case (?user) {
        let updatedUser = {
          id = user.id;
          username = username;
          email = email;
          password = user.password;
          wallet_balance = user.wallet_balance;
          posts = user.posts;
          conversations = user.conversations;
        };
        users.put(userId, updatedUser);
        return true;
      };
      case null {
        return false; // User not found
      };
    };
  };

  // Function to update user password
  public shared func updateUserPassword(userId : Nat, oldPassword : Text, newPassword : Text) : async Bool {
    switch (users.get(userId)) {
      case (?user) {
        let hashedOldPassword = hashPassword(oldPassword);
        if (user.password != hashedOldPassword) {
          return false; // Old password doesn't match
        };

        let hashedNewPassword = hashPassword(newPassword);
        let updatedUser = {
          id = user.id;
          username = user.username;
          email = user.email;
          password = hashedNewPassword;
          wallet_balance = user.wallet_balance;
          posts = user.posts;
          conversations = user.conversations;
        };
        users.put(userId, updatedUser);
        return true;
      };
      case null {
        return false; // User not found
      };
    };
  };

  // A simple debugging function to your backend to check if any users exist and to see what's in your users hashmap
  public query func debugUsers() : async Text {
    var result : Text = "Users in system: " # Nat.toText(users.size());

    for ((id, user) in users.entries()) {
      result := result # "\n" # "User " # Nat.toText(id) # ": " # user.username # " (" # user.email # ")";
    };

    return result;
  };

  // Get a specific conversation by ID
  public query func getConversation(convoId : Nat) : async ?Conversation {
    return conversations.get(convoId);
  };

  // Get conversations for a specific user
  public query func getConversationsForUser(userId : Nat) : async [Nat] {
    switch (users.get(userId)) {
      case (?user) {
        return user.conversations;
      };
      case null {
        return []; // User not found
      };
    };
  };

  // Get messages for a specific conversation
  public query func getMessagesForConversation(convoId : Nat) : async [Message.Message] {
    switch (conversations.get(convoId)) {
      case (?convo) {
        return convo.messages;
      };
      case null {
        return []; // Conversation not found
      };
    };
  };

  // Get participants of a conversation
  public query func getConversationParticipants(convoId : Nat) : async [Nat] {
    switch (conversations.get(convoId)) {
      case (?convo) {
        return convo.users;
      };
      case null {
        return []; // Conversation not found
      };
    };
  };

};

// --------- Commands to test the canister ---------

// Commands to post pet:
// dfx canister call New_LPF_backend reportPet '(1, "Noddy", "Dog", "Golden Retriever", "Golden", "Medium", "Central Park", "Friendly dog with blue collar", vec {"https://example.com/dog.jpg"}, 100, variant { Lost })'
// dfx canister call New_LPF_backend reportPet '(1, "Max", "Dog", "German Shepherd", "Black and tan", "Large", "Riverside Trail", "Male dog with red collar and tag, very friendly", vec {"https://example.com/shepherd.jpg"; "https://example.com/shepherd2.jpg"}, 250, variant { Lost })'

// Command to register User:
// dfx canister call New_LPF_backend registerUser '("alice", "alice@example.com", "securepass")'

// Command to getUser:
// dfx canister call New_LPF_backend getUser '(1)'
// dfx canister call New_LPF_backend getUser '(0)'
