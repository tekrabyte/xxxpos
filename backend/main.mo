import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type POSState = {
    products : [(Nat, Product)];
    transactions : [Transaction];
    outlets : [(Nat, Outlet)];
    packages : [(Nat, ProductPackage)];
    bundles : [(Nat, Bundle)];
    menuAccessConfig : MenuAccessConfig;
  };

  type UserId = Principal;

  type Meta = {
    nextProductId : Nat;
    nextTransactionId : Nat;
    nextOutletId : Nat;
    nextStockLogId : Nat;
    nextCategoryId : Nat;
    nextBrandId : Nat;
    nextPackageId : Nat;
    nextBundleId : Nat;
  };

  var meta : Meta = {
    nextProductId = 1;
    nextTransactionId = 1;
    nextOutletId = 1;
    nextStockLogId = 1;
    nextCategoryId = 1;
    nextBrandId = 1;
    nextPackageId = 1;
    nextBundleId = 1;
  };

  public type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    stock : Nat;
    outletId : Nat;
    createdAt : Time.Time;
    categoryId : ?Nat;
    brandId : ?Nat;
    isDeleted : Bool;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Int.compare(p1.id, p2.id);
    };
  };

  public type ProductRequest = {
    id : ?Nat;
    name : Text;
    price : Nat;
    stock : Nat;
    outletId : Nat;
    categoryId : ?Nat;
    brandId : ?Nat;
  };

  let products = Map.empty<Nat, Product>();

  public type StockLog = {
    id : Nat;
    productId : Nat;
    outletId : Nat;
    operation : Text;
    quantity : Nat;
    fromOutletId : ?Nat;
    toOutletId : ?Nat;
    userId : Principal;
    timestamp : Time.Time;
    referenceTransactionId : ?Nat;
  };

  let stockLogs = Map.empty<Nat, StockLog>();

  public type Outlet = {
    id : Nat;
    name : Text;
    address : Text;
    createdAt : Time.Time;
    isActive : Bool;
  };

  module Outlet {
    public func compare(o1 : Outlet, o2 : Outlet) : Order.Order {
      Int.compare(o1.id, o2.id);
    };
  };

  let outlets = Map.empty<Nat, Outlet>();

  public type TransactionItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
    isPackage : Bool;
    isBundle : Bool;
  };

  public type PaymentCategory = {
    #offline;
    #online;
    #foodDelivery;
  };

  public type PaymentSubCategory = {
    #eWallet;
    #qris;
    #shopeeFood;
    #goFood;
    #grabFood;
    #maximFood;
    #tiktok;
  };

  public type PaymentMethod = {
    category : PaymentCategory;
    subCategory : ?PaymentSubCategory;
    methodName : Text;
    amount : Nat;
  };

  public type Transaction = {
    id : Nat;
    userId : UserId;
    outletId : Nat;
    items : [TransactionItem];
    total : Nat;
    timestamp : Time.Time;
    paymentMethods : [PaymentMethod];
  };

  module Transaction {
    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Int.compare(t1.id, t2.id);
    };
  };

  let transactions = Map.empty<Nat, Transaction>();

  public type AppRole = {
    #owner;    // Maps to AccessControl #admin
    #manager;  // Stored in profile
    #cashier;  // Stored in profile
  };

  public type UserProfile = {
    name : Text;
    outletId : ?Nat;
    role : AppRole;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Category = {
    id : Nat;
    name : Text;
    description : Text;
    createdAt : Time.Time;
    isActive : Bool;
  };

  module Category {
    public func compare(c1 : Category, c2 : Category) : Order.Order {
      Int.compare(c1.id, c2.id);
    };
  };

  let categories = Map.empty<Nat, Category>();

  public type Brand = {
    id : Nat;
    name : Text;
    description : Text;
    createdAt : Time.Time;
    isActive : Bool;
  };

  module Brand {
    public func compare(b1 : Brand, b2 : Brand) : Order.Order {
      Int.compare(b1.id, b2.id);
    };
  };

  let brands = Map.empty<Nat, Brand>();

  public type PackageComponent = {
    productId : Nat;
    quantity : Nat;
  };

  public type ProductPackage = {
    id : Nat;
    name : Text;
    price : Nat;
    components : [PackageComponent];
    outletId : Nat;
    createdAt : Time.Time;
    isActive : Bool;
  };

  let packages = Map.empty<Nat, ProductPackage>();

  public type BundleItem = {
    productId : Nat;
    packageId : ?Nat;
    quantity : Nat;
    isPackage : Bool;
  };

  public type Bundle = {
    id : Nat;
    name : Text;
    price : Nat;
    items : [BundleItem];
    outletId : Nat;
    createdAt : Time.Time;
    isActive : Bool;
  };

  let bundles = Map.empty<Nat, Bundle>();

  let accessControlState = AccessControl.initState();

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only owners can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  private func isOwner(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  private func getAppRole(caller : Principal) : ?AppRole {
    if (isOwner(caller)) {
      return ?#owner;
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?profile.role };
    };
  };

  private func isManager(caller : Principal) : Bool {
    switch (getAppRole(caller)) {
      case (?#manager) { true };
      case (_) { false };
    };
  };

  private func isCashier(caller : Principal) : Bool {
    switch (getAppRole(caller)) {
      case (?#cashier) { true };
      case (_) { false };
    };
  };

  private func canAccessOutlet(caller : Principal, outletId : Nat) : Bool {
    if (isOwner(caller)) {
      return true;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.outletId) {
          case (null) { false };
          case (?assignedOutletId) { assignedOutletId == outletId };
        };
      };
    };
  };

  private func canManageStock(caller : Principal) : Bool {
    isOwner(caller) or isManager(caller);
  };

  private func canManageProducts(caller : Principal) : Bool {
    isOwner(caller);
  };

  private func canCreateTransaction(caller : Principal) : Bool {
    isOwner(caller) or isManager(caller) or isCashier(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only owners can view other profiles");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only owners can view all users");
    };
    userProfiles.entries().toArray();
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = userProfiles.get(caller);

    let finalProfile = switch (existingProfile) {
      case (null) {
        {
          name = profile.name;
          outletId = null;
          role = #cashier;
        };
      };
      case (?existing) {
        {
          name = profile.name;
          outletId = existing.outletId;
          role = existing.role;
        };
      };
    };

    userProfiles.add(caller, finalProfile);
  };

  public shared ({ caller }) func updateUserProfile(user : Principal, profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only owners can update profiles");
    };

    if (caller == user) {
      Runtime.trap("Cannot update own profile. Use saveCallerUserProfile to update your name");
    };

    switch (profile.outletId) {
      case (?outletId) {
        if (not outlets.containsKey(outletId)) {
          Runtime.trap("Outlet not found");
        };
      };
      case (null) {};
    };

    // Ensure user has at least #user permission in AccessControl
    if (not (AccessControl.hasPermission(accessControlState, user, #user))) {
      AccessControl.assignRole(accessControlState, caller, user, #user);
    };

    userProfiles.add(user, profile);
  };

  private func logStockChange(productId : Nat, outletId : Nat, operation : Text, quantity : Nat, fromOutletId : ?Nat, toOutletId : ?Nat, userId : Principal, referenceTransactionId : ?Nat) {
    let logId = meta.nextStockLogId;
    let log : StockLog = {
      id = logId;
      productId;
      outletId;
      operation;
      quantity;
      fromOutletId;
      toOutletId;
      userId;
      timestamp = Time.now();
      referenceTransactionId;
    };
    stockLogs.add(logId, log);
    meta := { meta with nextStockLogId = meta.nextStockLogId + 1 };
  };

  // OUTLET MANAGEMENT
  public shared ({ caller }) func createOutlet(name : Text, address : Text) : async Nat {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can create outlets");
    };

    let outletId = meta.nextOutletId;
    let outlet : Outlet = {
      id = outletId;
      name;
      address;
      createdAt = Time.now();
      isActive = true;
    };
    outlets.add(outletId, outlet);
    meta := { meta with nextOutletId = meta.nextOutletId + 1 };
    outletId;
  };

  public shared ({ caller }) func updateOutlet(outletId : Nat, name : Text, address : Text, isActive : Bool) : async () {
    if (not (isOwner(caller) or isManager(caller))) {
      Runtime.trap("Unauthorized: Only owners and managers can update outlets");
    };

    if (not canAccessOutlet(caller, outletId)) {
      Runtime.trap("Unauthorized: You can only update outlets you have access to");
    };

    switch (outlets.get(outletId)) {
      case (null) { Runtime.trap("Outlet not found") };
      case (?outlet) {
        let updatedOutlet : Outlet = {
          id = outlet.id;
          name;
          address;
          createdAt = outlet.createdAt;
          isActive;
        };
        outlets.add(outletId, updatedOutlet);
      };
    };
  };

  public shared ({ caller }) func deleteOutlet(outletId : Nat) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can delete outlets");
    };

    outlets.remove(outletId);
  };

  public query ({ caller }) func getOutlets() : async [Outlet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view outlets");
    };

    let allOutlets = outlets.values().toArray();

    if (isOwner(caller)) {
      return allOutlets;
    };

    switch (userProfiles.get(caller)) {
      case (null) { [] };
      case (?profile) {
        switch (profile.outletId) {
          case (null) { [] };
          case (?outletId) {
            allOutlets.filter(func(o) { o.id == outletId });
          };
        };
      };
    };
  };

  // CATEGORY MANAGEMENT (Owner only for CRUD, others read-only)
  public shared ({ caller }) func addCategory(name : Text, description : Text) : async Nat {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can add categories");
    };

    let categoryId = meta.nextCategoryId;
    let category : Category = {
      id = categoryId;
      name;
      description;
      createdAt = Time.now();
      isActive = true;
    };
    categories.add(categoryId, category);
    meta := { meta with nextCategoryId = meta.nextCategoryId + 1 };
    categoryId;
  };

  public shared ({ caller }) func updateCategory(categoryId : Nat, name : Text, description : Text, isActive : Bool) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can update categories");
    };

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) {
        let updatedCategory : Category = {
          id = category.id;
          name;
          description;
          createdAt = category.createdAt;
          isActive;
        };
        categories.add(categoryId, updatedCategory);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can delete categories");
    };

    let hasProducts = products.values().toArray().filter(func(p) { p.categoryId == ?categoryId }).size() > 0;
    if (hasProducts) {
      Runtime.trap("Cannot delete category: products are using this category");
    };

    categories.remove(categoryId);
  };

  public query ({ caller }) func getCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view categories");
    };
    categories.values().toArray();
  };

  // BRAND MANAGEMENT (Owner only for CRUD, others read-only)
  public shared ({ caller }) func addBrand(name : Text, description : Text) : async Nat {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can add brands");
    };

    let brandId = meta.nextBrandId;
    let brand : Brand = {
      id = brandId;
      name;
      description;
      createdAt = Time.now();
      isActive = true;
    };
    brands.add(brandId, brand);
    meta := { meta with nextBrandId = meta.nextBrandId + 1 };
    brandId;
  };

  public shared ({ caller }) func updateBrand(brandId : Nat, name : Text, description : Text, isActive : Bool) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can update brands");
    };

    switch (brands.get(brandId)) {
      case (null) { Runtime.trap("Brand not found") };
      case (?brand) {
        let updatedBrand : Brand = {
          id = brand.id;
          name;
          description;
          createdAt = brand.createdAt;
          isActive;
        };
        brands.add(brandId, updatedBrand);
      };
    };
  };

  public shared ({ caller }) func deleteBrand(brandId : Nat) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owners can delete brands");
    };

    let hasProducts = products.values().toArray().filter(func(p) { p.brandId == ?brandId }).size() > 0;
    if (hasProducts) {
      Runtime.trap("Cannot delete brand: products are using this brand");
    };

    brands.remove(brandId);
  };

  public query ({ caller }) func getBrands() : async [Brand] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view brands");
    };
    brands.values().toArray();
  };

  // PRODUCT MANAGEMENT (Owner only for CRUD, others read-only)
  public shared ({ caller }) func createOrUpdateProduct(productRequest : ProductRequest) : async Nat {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can create or update products");
    };

    if (productRequest.name == "") {
      Runtime.trap("Product name cannot be empty");
    };

    if (productRequest.price <= 0) {
      Runtime.trap("Product price must be greater than 0");
    };

    if (productRequest.stock < 0) {
      Runtime.trap("Stock cannot be negative");
    };

    if (not outlets.containsKey(productRequest.outletId)) {
      Runtime.trap("Outlet not found for this product");
    };

    switch (productRequest.categoryId) {
      case (?categoryId) {
        if (not categories.containsKey(categoryId)) {
          Runtime.trap("Category not found");
        };
      };
      case (null) {};
    };

    switch (productRequest.brandId) {
      case (?brandId) {
        if (not brands.containsKey(brandId)) {
          Runtime.trap("Brand not found");
        };
      };
      case (null) {};
    };

    let productId = switch (productRequest.id) {
      case (?id) {
        if (products.containsKey(id)) { id } else {
          Runtime.trap("Product with id does not exist");
        };
      };
      case (null) {
        let newId = meta.nextProductId;
        meta := { meta with nextProductId = meta.nextProductId + 1 };
        newId;
      };
    };

    let createdAt = switch (productRequest.id) {
      case (?_) {
        switch (products.get(productId)) {
          case (?existingProduct) { existingProduct.createdAt };
          case (null) {
            Time.now();
          };
        };
      };
      case (null) { Time.now() };
    };

    let product : Product = {
      id = productId;
      name = productRequest.name;
      price = productRequest.price;
      stock = productRequest.stock;
      outletId = productRequest.outletId;
      createdAt;
      categoryId = productRequest.categoryId;
      brandId = productRequest.brandId;
      isDeleted = false;
    };

    products.add(productId, product);

    productId;
  };

  public query ({ caller }) func getProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view products");
    };
    products.values().toArray();
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view products");
    };
    products.get(productId);
  };

  public query ({ caller }) func searchProducts(keyword : Text, outletId : ?Nat, categoryId : ?Nat, brandId : ?Nat) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search products");
    };

    products.values().toArray().filter(func(product) {
      var matches = true;
      if (keyword != "") {
        matches := matches and product.name.contains(#text keyword);
      };
      switch (outletId) {
        case (?outlet) { matches := matches and product.outletId == outlet };
        case (null) {};
      };
      switch (categoryId) {
        case (?category) { matches := matches and product.categoryId == ?category };
        case (null) {};
      };
      switch (brandId) {
        case (?brand) { matches := matches and product.brandId == ?brand };
        case (null) {};
      };
      matches;
    });
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can delete products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(productId);
      };
    };
  };

  // STOCK MANAGEMENT (Owner and Manager only, Cashier read-only)
  public shared ({ caller }) func addStock(productId : Nat, quantity : Nat) : async () {
    if (not canManageStock(caller)) {
      Runtime.trap("Unauthorized: Only owners and managers can manage stock");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (not canAccessOutlet(caller, product.outletId)) {
          Runtime.trap("Unauthorized: You can only manage stock for your assigned outlet");
        };

        let updatedProduct : Product = {
          id = product.id;
          name = product.name;
          price = product.price;
          stock = product.stock + quantity;
          outletId = product.outletId;
          createdAt = product.createdAt;
          categoryId = product.categoryId;
          brandId = product.brandId;
          isDeleted = product.isDeleted;
        };
        products.add(productId, updatedProduct);
        logStockChange(productId, product.outletId, "add", quantity, null, null, caller, null);
      };
    };
  };

  public shared ({ caller }) func reduceStock(productId : Nat, quantity : Nat) : async () {
    if (not canManageStock(caller)) {
      Runtime.trap("Unauthorized: Only owners and managers can manage stock");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (not canAccessOutlet(caller, product.outletId)) {
          Runtime.trap("Unauthorized: You can only manage stock for your assigned outlet");
        };

        if (product.stock < quantity) {
          Runtime.trap("Insufficient stock");
        };

        let updatedProduct : Product = {
          id = product.id;
          name = product.name;
          price = product.price;
          stock = product.stock - quantity;
          outletId = product.outletId;
          createdAt = product.createdAt;
          categoryId = product.categoryId;
          brandId = product.brandId;
          isDeleted = product.isDeleted;
        };
        products.add(productId, updatedProduct);
        logStockChange(productId, product.outletId, "reduce", quantity, null, null, caller, null);
      };
    };
  };

  public shared ({ caller }) func transferStock(productId : Nat, toOutletId : Nat, quantity : Nat) : async () {
    if (not canManageStock(caller)) {
      Runtime.trap("Unauthorized: Only owners and managers can transfer stock");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (not canAccessOutlet(caller, product.outletId)) {
          Runtime.trap("Unauthorized: You can only transfer stock from your assigned outlet");
        };

        if (not canAccessOutlet(caller, toOutletId)) {
          Runtime.trap("Unauthorized: You can only transfer stock to outlets you have access to");
        };

        if (product.stock < quantity) {
          Runtime.trap("Insufficient stock");
        };

        let updatedProduct : Product = {
          id = product.id;
          name = product.name;
          price = product.price;
          stock = product.stock - quantity;
          outletId = product.outletId;
          createdAt = product.createdAt;
          categoryId = product.categoryId;
          brandId = product.brandId;
          isDeleted = product.isDeleted;
        };
        products.add(productId, updatedProduct);
        logStockChange(productId, product.outletId, "transfer", quantity, ?product.outletId, ?toOutletId, caller, null);
      };
    };
  };

  // PACKAGE MANAGEMENT (Owner only for CRUD, others read-only)
  public shared ({ caller }) func addProductPackage(name : Text, price : Nat, components : [PackageComponent], outletId : Nat) : async Nat {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can add product packages");
    };

    if (components.size() == 0) {
      Runtime.trap("Package must have at least one component");
    };

    for (component in components.vals()) {
      switch (products.get(component.productId)) {
        case (null) { Runtime.trap("Component product not found") };
        case (?_) {};
      };
    };

    let packageId = meta.nextPackageId;
    let package : ProductPackage = {
      id = packageId;
      name;
      price;
      components;
      outletId;
      createdAt = Time.now();
      isActive = true;
    };
    packages.add(packageId, package);
    meta := { meta with nextPackageId = meta.nextPackageId + 1 };
    packageId;
  };

  public shared ({ caller }) func updateProductPackage(packageId : Nat, name : Text, price : Nat, components : [PackageComponent]) : async () {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can update product packages");
    };

    switch (packages.get(packageId)) {
      case (null) { Runtime.trap("Package not found") };
      case (?package) {
        let updatedPackage : ProductPackage = {
          id = package.id;
          name;
          price;
          components;
          outletId = package.outletId;
          createdAt = package.createdAt;
          isActive = package.isActive;
        };
        packages.add(packageId, updatedPackage);
      };
    };
  };

  public shared ({ caller }) func deleteProductPackage(packageId : Nat) : async () {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can delete product packages");
    };

    packages.remove(packageId);
  };

  public query ({ caller }) func getProductPackages() : async [ProductPackage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view product packages");
    };
    packages.values().toArray();
  };

  // BUNDLE MANAGEMENT (Owner only for CRUD, others read-only)
  public shared ({ caller }) func addBundle(name : Text, price : Nat, items : [BundleItem], outletId : Nat) : async Nat {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can add bundles");
    };

    if (items.size() == 0) {
      Runtime.trap("Bundle must have at least one item");
    };

    for (item in items.vals()) {
      if (item.isPackage) {
        switch (item.packageId) {
          case (null) { Runtime.trap("Package ID required for package items") };
          case (?pkgId) {
            if (not packages.containsKey(pkgId)) {
              Runtime.trap("Package not found");
            };
          };
        };
      } else {
        if (not products.containsKey(item.productId)) {
          Runtime.trap("Product not found");
        };
      };
    };

    let bundleId = meta.nextBundleId;
    let bundle : Bundle = {
      id = bundleId;
      name;
      price;
      items;
      outletId;
      createdAt = Time.now();
      isActive = true;
    };
    bundles.add(bundleId, bundle);
    meta := { meta with nextBundleId = meta.nextBundleId + 1 };
    bundleId;
  };

  public shared ({ caller }) func updateBundle(bundleId : Nat, name : Text, price : Nat, items : [BundleItem]) : async () {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can update bundles");
    };

    switch (bundles.get(bundleId)) {
      case (null) { Runtime.trap("Bundle not found") };
      case (?bundle) {
        let updatedBundle : Bundle = {
          id = bundle.id;
          name;
          price;
          items;
          outletId = bundle.outletId;
          createdAt = bundle.createdAt;
          isActive = bundle.isActive;
        };
        bundles.add(bundleId, updatedBundle);
      };
    };
  };

  public shared ({ caller }) func deleteBundle(bundleId : Nat) : async () {
    if (not canManageProducts(caller)) {
      Runtime.trap("Unauthorized: Only owners can delete bundles");
    };

    bundles.remove(bundleId);
  };

  public query ({ caller }) func getBundles() : async [Bundle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bundles");
    };
    bundles.values().toArray();
  };

  // TRANSACTION MANAGEMENT (All authenticated users can create for their outlet)
  public shared ({ caller }) func createTransaction(outletId : Nat, items : [TransactionItem], paymentMethods : [PaymentMethod]) : async Nat {
    if (not canCreateTransaction(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can create transactions");
    };

    if (not canAccessOutlet(caller, outletId)) {
      Runtime.trap("Unauthorized: You can only create transactions for your assigned outlet");
    };

    if (items.size() == 0) {
      Runtime.trap("Transaction must have at least one item");
    };

    if (paymentMethods.size() == 0) {
      Runtime.trap("Transaction must have at least one payment method");
    };

    var total : Nat = 0;
    for (item in items.vals()) {
      total += item.price * item.quantity;
    };

    var paymentTotal : Nat = 0;
    for (payment in paymentMethods.vals()) {
      paymentTotal += payment.amount;
    };

    if (paymentTotal != total) {
      Runtime.trap("Payment total must equal transaction total");
    };

    for (item in items.vals()) {
      if (item.isBundle) {
        // Handle bundle stock reduction
      } else if (item.isPackage) {
        // Handle package stock reduction
      } else {
        switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?product) {
            if (product.stock < item.quantity) {
              Runtime.trap("Insufficient stock for product");
            };
            let updatedProduct : Product = {
              id = product.id;
              name = product.name;
              price = product.price;
              stock = product.stock - item.quantity;
              outletId = product.outletId;
              createdAt = product.createdAt;
              categoryId = product.categoryId;
              brandId = product.brandId;
              isDeleted = product.isDeleted;
            };
            products.add(item.productId, updatedProduct);
          };
        };
      };
    };

    let transactionId = meta.nextTransactionId;
    let transaction : Transaction = {
      id = transactionId;
      userId = caller;
      outletId;
      items;
      total;
      timestamp = Time.now();
      paymentMethods;
    };
    transactions.add(transactionId, transaction);
    meta := { meta with nextTransactionId = meta.nextTransactionId + 1 };

    for (item in items.vals()) {
      if (not item.isBundle and not item.isPackage) {
        logStockChange(item.productId, outletId, "transaction", item.quantity, null, null, caller, ?transactionId);
      };
    };

    transactionId;
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view transactions");
    };

    let allTransactions = transactions.values().toArray();

    if (isOwner(caller)) {
      return allTransactions;
    };

    if (isManager(caller)) {
      switch (userProfiles.get(caller)) {
        case (null) { return [] };
        case (?profile) {
          switch (profile.outletId) {
            case (null) { return [] };
            case (?outletId) {
              return allTransactions.filter(func(t) { t.outletId == outletId });
            };
          };
        };
      };
    };

    // Cashiers can only see their own transactions
    if (isCashier(caller)) {
      return allTransactions.filter(func(t) { t.userId == caller });
    };

    [];
  };

  public query ({ caller }) func getStockLogs() : async [StockLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stock logs");
    };

    let allLogs = stockLogs.values().toArray();

    if (isOwner(caller)) {
      return allLogs;
    };

    switch (userProfiles.get(caller)) {
      case (null) { [] };
      case (?profile) {
        switch (profile.outletId) {
          case (null) { [] };
          case (?outletId) {
            allLogs.filter(func(log) { log.outletId == outletId });
          };
        };
      };
    };
  };

  // MENU ACCESS CONFIGURATION
  public type MenuAccessConfig = {
    cashier : [MenuAccess];
    manager : [MenuAccess];
    owner : [MenuAccess];
  };

  public type MenuAccess = {
    menu : Text;
    isAccessible : Bool;
  };

  public type MenuAccessInput = {
    cashier : [MenuAccess];
    manager : [MenuAccess];
    owner : [MenuAccess];
  };

  var menuAccessConfig : MenuAccessConfig = {
    cashier = [
      { menu = "dashboard"; isAccessible = true },
      { menu = "pos"; isAccessible = true },
      { menu = "products"; isAccessible = true },
      { menu = "reports"; isAccessible = false },
      { menu = "stock"; isAccessible = false },
      { menu = "staff"; isAccessible = false },
      { menu = "outlets"; isAccessible = false },
      { menu = "categories"; isAccessible = false },
      { menu = "settings"; isAccessible = false },
    ];
    manager = [
      { menu = "dashboard"; isAccessible = true },
      { menu = "pos"; isAccessible = false },
      { menu = "products"; isAccessible = true },
      { menu = "reports"; isAccessible = true },
      { menu = "stock"; isAccessible = true },
      { menu = "staff"; isAccessible = true },
      { menu = "outlets"; isAccessible = false },
      { menu = "categories"; isAccessible = true },
      { menu = "settings"; isAccessible = false },
    ];
    owner = [
      { menu = "dashboard"; isAccessible = true },
      { menu = "pos"; isAccessible = true },
      { menu = "products"; isAccessible = true },
      { menu = "reports"; isAccessible = true },
      { menu = "stock"; isAccessible = true },
      { menu = "staff"; isAccessible = true },
      { menu = "outlets"; isAccessible = true },
      { menu = "categories"; isAccessible = true },
      { menu = "settings"; isAccessible = true },
    ];
  };

  public shared ({ caller }) func saveMenuAccessConfig(newConfig : MenuAccessInput) : async () {
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only owner can modify menu access config");
    };

    func updateMenuEntries(entries : [MenuAccess]) : [MenuAccess] {
      let menus = ["dashboard", "pos", "products", "reports", "stock", "staff", "outlets", "categories", "settings"];
      menus.map(
        func(menuName) {
          switch (entries.findIndex(func(e) { Text.equal(e.menu, menuName) })) {
            case (null) { { menu = menuName; isAccessible = false } };
            case (?index) { entries[index] };
          };
        }
      );
    };

    // Owner access cannot be modified - always full access
    let ownerAccess = [
      { menu = "dashboard"; isAccessible = true },
      { menu = "pos"; isAccessible = true },
      { menu = "products"; isAccessible = true },
      { menu = "reports"; isAccessible = true },
      { menu = "stock"; isAccessible = true },
      { menu = "staff"; isAccessible = true },
      { menu = "outlets"; isAccessible = true },
      { menu = "categories"; isAccessible = true },
      { menu = "settings"; isAccessible = true },
    ];

    menuAccessConfig := {
      cashier = updateMenuEntries(newConfig.cashier);
      manager = updateMenuEntries(newConfig.manager);
      owner = ownerAccess;
    };
  };

  public query ({ caller }) func getMenuAccessConfig() : async MenuAccessConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged in users can view menu access config");
    };
    menuAccessConfig;
  };

  public query ({ caller }) func getRoleMenuAccess() : async [MenuAccess] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged in users can view menu access");
    };

    switch (getAppRole(caller)) {
      case (?#owner) { menuAccessConfig.owner };
      case (?#manager) { menuAccessConfig.manager };
      case (?#cashier) { menuAccessConfig.cashier };
      case (null) { [] };
    };
  };

  public query ({ caller }) func isMenuAccessible(menu : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };

    let accessList = switch (getAppRole(caller)) {
      case (?#owner) { menuAccessConfig.owner };
      case (?#manager) { menuAccessConfig.manager };
      case (?#cashier) { menuAccessConfig.cashier };
      case (null) { return false };
    };

    switch (accessList.findIndex(func(m) { Text.equal(m.menu, menu) })) {
      case (null) { false };
      case (?index) { accessList[index].isAccessible };
    };
  };
};
