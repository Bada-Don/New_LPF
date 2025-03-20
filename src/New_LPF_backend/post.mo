import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
    public type PostID = Nat;
    public type Timestamp = Int; // Timestamp in nanoseconds
    
    public type Category = {
        #Lost;
        #Found;
    };
    
    public type Status = {
        #Active;
        #Resolved;
    };
    
    public type Post = {
        id: PostID;
        owner: Principal;
        pet_name: Text;
        pet_type: Text;
        breed: Text;
        color: Text;
        height: Text;
        last_seen_location: Text;
        category: Category;
        date: Timestamp;
        area: Text;
        photos: [Text]; // URLs of images, max 5
        award_amount: Nat;
        status: Status;
    };
}