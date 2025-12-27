import Principal "mo:core/Principal";
import Map "mo:core/Map";
import AccessControl "authorization/access-control";

module {
  type OldUserProfile = {
    name : Text;
    outletId : ?Nat;
    role : AccessControl.UserRole;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    name : Text;
    outletId : ?Nat;
    role : {
      #owner;
      #cashier;
      #manager;
    };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  func userRoleToAppRole(userRole : AccessControl.UserRole) : {
    #owner;
    #cashier;
    #manager;
  } {
    switch (userRole) {
      case (#admin) { #owner };
      case (#manager) { #manager };
      case (#cashier) { #cashier };
    };
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        let newRole = userRoleToAppRole(oldProfile.role);
        { oldProfile with role = newRole };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
