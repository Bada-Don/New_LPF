import Time "mo:base/Time";

module {
    public type PetCategory = { #Lost; #Found };

    public type PetPost = {
        id: Nat;
        userId: Nat;
        petName: Text;
        pet_type: Text;         // Type of pet (Dog, Cat, etc.)
        breed: Text;            // Breed of the pet
        color: Text;            // Color description
        height: Text;           // Approximate height
        last_seen_location: Text; // Location where it was lost/found
        description: Text;
        photos: [Text];         // Array of photo URLs (Max 5)
        award_amount: Nat;      // Reward amount (if any)
        status: { #Active; #Resolved }; // Whether pet is still lost or found
        category: PetCategory;
        timestamp: Int;
    };
}


// We usually can't use images from the internet in our database,
// as they can't be accessed because the CSP doesn't allow it.
