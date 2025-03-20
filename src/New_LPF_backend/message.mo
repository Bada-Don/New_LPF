import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
    public type Message = {
        sender: Principal;
        body: Text;
        timestamp: Int; // Timestamp in nanoseconds
    };
}