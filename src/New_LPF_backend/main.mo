import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash";

import User "users";
import Post "post";
import Conversation "conversations";
import Message "message";

actor LostPetFinder {
  // Type definitions for errors
  type Error = {
    #NotFound;
    #AlreadyExists;
    #NotAuthorized;
    #InvalidInput;
    #InsufficientFunds;
  };

  // Storage
  private stable var nextPostId : Post.PostID = 0;
  private stable var nextConversationId : Conversation.ConversationID = 0;
  private stable var nextTransactionId : Conversation.TransactionID = 0;

  private var users = HashMap.HashMap<Principal, User.User>(0, Principal.equal, Principal.hash);
  private var posts = HashMap.HashMap<Post.PostID, Post.Post>(0, Nat.equal, Hash.hash);
  private var conversations = HashMap.HashMap<Conversation.ConversationID, Conversation.Conversation>(0, Nat.equal, Hash.hash);

  // User Management
  public shared (msg) func createUser(username : Text, email : Text, password : Text) : async Result.Result<Principal, Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?_) { return #err(#AlreadyExists) };
      case (null) {
        let newUser : User.User = {
          id = caller;
          username = username;
          email = email;
          password = password;
          posts = [];
          conversations = [];
          wallet_balance = 0;
        };

        users.put(caller, newUser);
        return #ok(caller);
      };
    };
  };

  public shared (msg) func getUser() : async Result.Result<User.User, Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?user) { return #ok(user) };
      case (null) { return #err(#NotFound) };
    };
  };

  public shared (msg) func updateUser(username : ?Text, email : ?Text, password : ?Text) : async Result.Result<(), Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?user) {
        let updatedUser : User.User = {
          id = user.id;
          username = Option.get(username, user.username);
          email = Option.get(email, user.email);
          password = Option.get(password, user.password);
          posts = user.posts;
          conversations = user.conversations;
          wallet_balance = user.wallet_balance;
        };

        users.put(caller, updatedUser);
        return #ok();
      };
      case (null) { return #err(#NotFound) };
    };
  };

  // Post Management
  public shared (msg) func createPost(
    pet_name : Text,
    pet_type : Text,
    breed : Text,
    color : Text,
    height : Text,
    last_seen_location : Text,
    category : Post.Category,
    area : Text,
    photos : [Text],
    award_amount : Nat,
  ) : async Result.Result<Post.PostID, Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?user) {
        // Validate photos count
        if (photos.size() > 5) {
          return #err(#InvalidInput);
        };

        // Validate award amount
        if (award_amount > user.wallet_balance) {
          return #err(#InsufficientFunds);
        };

        let postId = nextPostId;
        nextPostId += 1;

        let newPost : Post.Post = {
          id = postId;
          owner = caller;
          pet_name = pet_name;
          pet_type = pet_type;
          breed = breed;
          color = color;
          height = height;
          last_seen_location = last_seen_location;
          category = category;
          date = Time.now();
          area = area;
          photos = photos;
          award_amount = award_amount;
          status = #Active;
        };

        posts.put(postId, newPost);

        // Update user's posts
        let updatedPosts = Array.append<Post.PostID>(user.posts, [postId]);
        let updatedUser : User.User = {
          id = user.id;
          username = user.username;
          email = user.email;
          password = user.password;
          posts = updatedPosts;
          conversations = user.conversations;
          wallet_balance = user.wallet_balance - award_amount;
        };

        users.put(caller, updatedUser);
        return #ok(postId);
      };
      case (null) { return #err(#NotAuthorized) };
    };
  };

  public func getPost(postId : Post.PostID) : async Result.Result<Post.Post, Error> {
    switch (posts.get(postId)) {
      case (?post) { return #ok(post) };
      case (null) { return #err(#NotFound) };
    };
  };

  public func getAllPosts() : async [Post.Post] {
    Iter.toArray(posts.vals());
  };

  public func getPostsByCategory(category : Post.Category) : async [Post.Post] {
    let filteredPosts = Iter.filter(
      posts.vals(),
      func(post : Post.Post) : Bool {
        post.category == category and post.status == #Active
      },
    );
    Iter.toArray(filteredPosts);
  };

  public shared (msg) func updatePostStatus(postId : Post.PostID, status : Post.Status) : async Result.Result<(), Error> {
    let caller = msg.caller;

    switch (posts.get(postId)) {
      case (?post) {
        if (post.owner != caller) {
          return #err(#NotAuthorized);
        };

        let updatedPost : Post.Post = {
          id = post.id;
          owner = post.owner;
          pet_name = post.pet_name;
          pet_type = post.pet_type;
          breed = post.breed;
          color = post.color;
          height = post.height;
          last_seen_location = post.last_seen_location;
          category = post.category;
          date = post.date;
          area = post.area;
          photos = post.photos;
          award_amount = post.award_amount;
          status = status;
        };

        posts.put(postId, updatedPost);
        return #ok();
      };
      case (null) { return #err(#NotFound) };
    };
  };

  // Conversation Management
  public shared (msg) func createConversation(otherUser : Principal) : async Result.Result<Conversation.ConversationID, Error> {
    let caller = msg.caller;

    if (Principal.equal(caller, otherUser)) {
      return #err(#InvalidInput);
    };

    switch (users.get(caller), users.get(otherUser)) {
      case (?user1, ?user2) {
        let conversationId = nextConversationId;
        nextConversationId += 1;

        let newConversation : Conversation.Conversation = {
          id = conversationId;
          users = [caller, otherUser];
          messages = [];
          proofs = [];
          reward_transaction = null;
        };

        conversations.put(conversationId, newConversation);

        // Update both users' conversations
        let updatedUser1 : User.User = {
          id = user1.id;
          username = user1.username;
          email = user1.email;
          password = user1.password;
          posts = user1.posts;
          conversations = Array.append<Conversation.ConversationID>(user1.conversations, [conversationId]);
          wallet_balance = user1.wallet_balance;
        };

        let updatedUser2 : User.User = {
          id = user2.id;
          username = user2.username;
          email = user2.email;
          password = user2.password;
          posts = user2.posts;
          conversations = Array.append<Conversation.ConversationID>(user2.conversations, [conversationId]);
          wallet_balance = user2.wallet_balance;
        };

        users.put(caller, updatedUser1);
        users.put(otherUser, updatedUser2);

        return #ok(conversationId);
      };
      case _ { return #err(#NotFound) };
    };
  };

  public shared (msg) func sendMessage(conversationId : Conversation.ConversationID, body : Text) : async Result.Result<(), Error> {
    let caller = msg.caller;

    switch (conversations.get(conversationId)) {
      case (?conversation) {
        // Check if caller is part of the conversation
        let isParticipant = Array.find<Principal>(
          conversation.users,
          func(user : Principal) : Bool { Principal.equal(user, caller) },
        );

        switch (isParticipant) {
          case (null) { return #err(#NotAuthorized) };
          case (?_) {
            let newMessage : Message.Message = {
              sender = caller;
              body = body;
              timestamp = Time.now();
            };

            let updatedMessages = Array.append<Message.Message>(conversation.messages, [newMessage]);
            let updatedConversation : Conversation.Conversation = {
              id = conversation.id;
              users = conversation.users;
              messages = updatedMessages;
              proofs = conversation.proofs;
              reward_transaction = conversation.reward_transaction;
            };

            conversations.put(conversationId, updatedConversation);
            return #ok();
          };
        };
      };
      case (null) { return #err(#NotFound) };
    };
  };

  public shared (msg) func getConversation(conversationId : Conversation.ConversationID) : async Result.Result<Conversation.Conversation, Error> {
    let caller = msg.caller;

    switch (conversations.get(conversationId)) {
      case (?conversation) {
        // Check if caller is part of the conversation
        let isParticipant = Array.find<Principal>(
          conversation.users,
          func(user : Principal) : Bool { Principal.equal(user, caller) },
        );

        switch (isParticipant) {
          case (null) { return #err(#NotAuthorized) };
          case (?_) { return #ok(conversation) };
        };
      };
      case (null) { return #err(#NotFound) };
    };
  };

  public shared (msg) func addProof(conversationId : Conversation.ConversationID, proofUrl : Text) : async Result.Result<(), Error> {
    let caller = msg.caller;

    switch (conversations.get(conversationId)) {
      case (?conversation) {
        // Check if caller is part of the conversation
        let isParticipant = Array.find<Principal>(
          conversation.users,
          func(user : Principal) : Bool { Principal.equal(user, caller) },
        );

        switch (isParticipant) {
          case (null) { return #err(#NotAuthorized) };
          case (?_) {
            let updatedProofs = Array.append<Text>(conversation.proofs, [proofUrl]);
            let updatedConversation : Conversation.Conversation = {
              id = conversation.id;
              users = conversation.users;
              messages = conversation.messages;
              proofs = updatedProofs;
              reward_transaction = conversation.reward_transaction;
            };

            conversations.put(conversationId, updatedConversation);
            return #ok();
          };
        };
      };
      case (null) { return #err(#NotFound) };
    };
  };

  // Reward Transaction
  public shared (msg) func processReward(
    conversationId : Conversation.ConversationID,
    postId : Post.PostID,
    recipientId : Principal,
  ) : async Result.Result<(), Error> {
    let caller = msg.caller;

    switch (conversations.get(conversationId), posts.get(postId), users.get(recipientId)) {
      case (?conversation, ?post, ?recipient) {
        // Check if caller is the post owner
        if (not Principal.equal(caller, post.owner)) {
          return #err(#NotAuthorized);
        };

        // Check if both users are part of the conversation
        let callerIsParticipant = Array.find<Principal>(
          conversation.users,
          func(user : Principal) : Bool { Principal.equal(user, caller) },
        );
        let recipientIsParticipant = Array.find<Principal>(
          conversation.users,
          func(user : Principal) : Bool { Principal.equal(user, recipientId) },
        );

        if (Option.isNull(callerIsParticipant) or Option.isNull(recipientIsParticipant)) {
          return #err(#NotAuthorized);
        };

        // Check if post is still active
        if (post.status != #Active) {
          return #err(#InvalidInput);
        };

        // Create transaction
        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        // Update conversation with transaction
        let updatedConversation : Conversation.Conversation = {
          id = conversation.id;
          users = conversation.users;
          messages = conversation.messages;
          proofs = conversation.proofs;
          reward_transaction = ?transactionId;
        };

        conversations.put(conversationId, updatedConversation);

        // Update post status
        let updatedPost : Post.Post = {
          id = post.id;
          owner = post.owner;
          pet_name = post.pet_name;
          pet_type = post.pet_type;
          breed = post.breed;
          color = post.color;
          height = post.height;
          last_seen_location = post.last_seen_location;
          category = post.category;
          date = post.date;
          area = post.area;
          photos = post.photos;
          award_amount = post.award_amount;
          status = #Resolved;
        };

        posts.put(postId, updatedPost);

        // Update recipient's wallet balance
        let updatedRecipient : User.User = {
          id = recipient.id;
          username = recipient.username;
          email = recipient.email;
          password = recipient.password;
          posts = recipient.posts;
          conversations = recipient.conversations;
          wallet_balance = recipient.wallet_balance + post.award_amount;
        };

        users.put(recipientId, updatedRecipient);

        return #ok();
      };
      case _ { return #err(#NotFound) };
    };
  };

  // Wallet Management
  public shared (msg) func depositFunds(amount : Nat) : async Result.Result<Nat, Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?user) {
        let updatedUser : User.User = {
          id = user.id;
          username = user.username;
          email = user.email;
          password = user.password;
          posts = user.posts;
          conversations = user.conversations;
          wallet_balance = user.wallet_balance + amount;
        };

        users.put(caller, updatedUser);
        return #ok(updatedUser.wallet_balance);
      };
      case (null) { return #err(#NotFound) };
    };
  };

  public shared (msg) func withdrawFunds(amount : Nat) : async Result.Result<Nat, Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?user) {
        if (amount > user.wallet_balance) {
          return #err(#InsufficientFunds);
        };

        let updatedUser : User.User = {
          id = user.id;
          username = user.username;
          email = user.email;
          password = user.password;
          posts = user.posts;
          conversations = user.conversations;
          wallet_balance = user.wallet_balance - amount;
        };

        users.put(caller, updatedUser);
        return #ok(updatedUser.wallet_balance);
      };
      case (null) { return #err(#NotFound) };
    };
  };

  // Search functionality
  public func searchPosts(searchQuery : Text) : async [Post.Post] {
    let searchText = Text.toLowercase(searchQuery);

    let filteredPosts = Iter.filter(
      posts.vals(),
      func(post : Post.Post) : Bool {
        let petNameMatch = Text.contains(Text.toLowercase(post.pet_name), #text searchText);
        let petTypeMatch = Text.contains(Text.toLowercase(post.pet_type), #text searchText);
        let breedMatch = Text.contains(Text.toLowercase(post.breed), #text searchText);
        let colorMatch = Text.contains(Text.toLowercase(post.color), #text searchText);
        let areaMatch = Text.contains(Text.toLowercase(post.area), #text searchText);

        return petNameMatch or petTypeMatch or breedMatch or colorMatch or areaMatch;
      },
    );

    return Iter.toArray(filteredPosts);
  };

  // Filter posts by area
  public func getPostsByArea(area : Text) : async [Post.Post] {
    let areaText = Text.toLowercase(area);

    let filteredPosts = Iter.filter(
      posts.vals(),
      func(post : Post.Post) : Bool {
        Text.contains(Text.toLowercase(post.area), #text areaText) and post.status == #Active
      },
    );

    Iter.toArray(filteredPosts);
  };

  // Get user's posts
  public shared (msg) func getUserPosts() : async Result.Result<[Post.Post], Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?user) {
        let userPosts = Array.mapFilter<Post.PostID, Post.Post>(
          user.posts,
          func(postId : Post.PostID) : ?Post.Post {
            posts.get(postId);
          },
        );

        return #ok(userPosts);
      };
      case (null) { return #err(#NotFound) };
    };
  };

  // Get user's conversations
  public shared (msg) func getUserConversations() : async Result.Result<[Conversation.Conversation], Error> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (?user) {
        let userConversations = Array.mapFilter<Conversation.ConversationID, Conversation.Conversation>(
          user.conversations,
          func(convId : Conversation.ConversationID) : ?Conversation.Conversation {
            conversations.get(convId);
          },
        );

        return #ok(userConversations);
      };
      case (null) { return #err(#NotFound) };
    };
  };

  // System upgrade hooks for persistence
  system func preupgrade() {
    // Implementation would include logic to convert HashMap to stable storage
    // This is just a placeholder - actual implementation would depend on specific requirements
    Debug.print("Preparing for upgrade...");
  };

  system func postupgrade() {
    // Implementation would include logic to restore from stable storage
    Debug.print("Upgrade complete!");
  };
};
