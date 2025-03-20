import { Actor, HttpAgent } from "@dfinity/agent";

// Create a manual IDL factory since imports aren't working
const createIDLFactory = () => {
  return ({ IDL }) => {
    const Error = IDL.Variant({
      'NotFound': IDL.Null,
      'AlreadyExists': IDL.Null,
      'NotAuthorized': IDL.Null,
      'InvalidInput': IDL.Null,
      'InsufficientFunds': IDL.Null,
    });
    
    const PostID = IDL.Nat;
    const Principal = IDL.Principal;
    const Timestamp = IDL.Int;
    
    const Category = IDL.Variant({
      'Lost': IDL.Null,
      'Found': IDL.Null,
    });
    
    const Status = IDL.Variant({
      'Active': IDL.Null,
      'Resolved': IDL.Null,
    });
    
    const Post = IDL.Record({
      'id': PostID,
      'owner': Principal,
      'pet_name': IDL.Text,
      'pet_type': IDL.Text,
      'breed': IDL.Text,
      'color': IDL.Text,
      'height': IDL.Text,
      'last_seen_location': IDL.Text,
      'category': Category,
      'date': Timestamp,
      'area': IDL.Text,
      'photos': IDL.Vec(IDL.Text),
      'award_amount': IDL.Nat,
      'status': Status,
    });
    
    const Result = IDL.Variant({ 'ok': Principal, 'err': Error });
    const Result_1 = IDL.Variant({ 'ok': IDL.Null, 'err': Error });
    
    const ConversationID = IDL.Nat;
    const TransactionID = IDL.Nat;
    
    const Message = IDL.Record({
      'sender': Principal,
      'body': IDL.Text,
      'timestamp': Timestamp,
    });
    
    const Conversation = IDL.Record({
      'id': ConversationID,
      'users': IDL.Vec(Principal),
      'messages': IDL.Vec(Message),
      'proofs': IDL.Vec(IDL.Text),
      'reward_transaction': IDL.Opt(TransactionID),
    });
    
    const User = IDL.Record({
      'id': Principal,
      'username': IDL.Text,
      'email': IDL.Text,
      'password': IDL.Text,
      'posts': IDL.Vec(PostID),
      'conversations': IDL.Vec(ConversationID),
      'wallet_balance': IDL.Nat,
    });
    
    const Result_2 = IDL.Variant({ 'ok': User, 'err': Error });
    const Result_3 = IDL.Variant({ 'ok': Post, 'err': Error });
    const Result_4 = IDL.Variant({ 'ok': IDL.Vec(Post), 'err': Error });
    const Result_5 = IDL.Variant({ 'ok': ConversationID, 'err': Error });
    const Result_6 = IDL.Variant({ 'ok': Conversation, 'err': Error });
    const Result_7 = IDL.Variant({ 'ok': IDL.Vec(Conversation), 'err': Error });
    const Result_8 = IDL.Variant({ 'ok': IDL.Nat, 'err': Error });
    const Result_9 = IDL.Variant({ 'ok': PostID, 'err': Error });
    
    return IDL.Service({
      'addProof': IDL.Func([ConversationID, IDL.Text], [Result_1], []),
      'createConversation': IDL.Func([Principal], [Result_5], []),
      'createPost': IDL.Func(
          [
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            Category,
            IDL.Text,
            IDL.Vec(IDL.Text),
            IDL.Nat,
          ],
          [Result_9],
          [],
        ),
      'createUser': IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
      'depositFunds': IDL.Func([IDL.Nat], [Result_8], []),
      'getAllPosts': IDL.Func([], [IDL.Vec(Post)], ['query']),
      'getConversation': IDL.Func([ConversationID], [Result_6], []),
      'getPost': IDL.Func([PostID], [Result_3], ['query']),
      'getPostsByArea': IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
      'getPostsByCategory': IDL.Func([Category], [IDL.Vec(Post)], ['query']),
      'getUser': IDL.Func([], [Result_2], []),
      'getUserConversations': IDL.Func([], [Result_7], []),
      'getUserPosts': IDL.Func([], [Result_4], []),
      'processReward': IDL.Func(
          [ConversationID, PostID, Principal],
          [Result_1],
          [],
        ),
      'searchPosts': IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
      'sendMessage': IDL.Func([ConversationID, IDL.Text], [Result_1], []),
      'updatePostStatus': IDL.Func([PostID, Status], [Result_1], []),
      'updateUser': IDL.Func(
          [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
          [Result_1],
          [],
        ),
      'withdrawFunds': IDL.Func([IDL.Nat], [Result_8], []),
    });
  };
};

// Local development
const LOCAL_HOST = "http://localhost:4943";
const isLocalEnv = process.env.NODE_ENV !== "production";

// Get the canister ID from a known source
const getCanisterId = () => {
  // Try to get from environment or localStorage
  const storedId = localStorage.getItem('backendCanisterId');
  if (storedId) {
    return storedId;
  }
  
  // Hardcoded fallback - replace with your actual canister ID
  return 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
};

export const createActor = (canisterId, options = {}) => {
  console.log("Creating actor with canister ID:", canisterId);
  
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

  // Use our manually created IDL factory
  const idlFactory = createIDLFactory();

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
    try {
      const canisterId = getCanisterId();
      console.log("Using backend canister ID:", canisterId);
      backend = createActor(canisterId);
      
      // Test the connection but don't throw if it fails
      try {
        console.log("Testing connection to backend...");
        const testResult = await backend.getAllPosts();
        console.log("Connection successful, got posts:", testResult);
      } catch (testErr) {
        console.warn("Test call failed, but continuing:", testErr);
      }
    } catch (err) {
      console.error("Failed to initialize backend actor:", err);
      throw err;
    }
  }
  return backend;
};