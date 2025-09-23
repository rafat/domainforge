// Debug date filtering logic
const currentDate = new Date();
const expiresAt = "2025-10-15T07:12:20.000Z";
const expiresAtDate = new Date(expiresAt);

console.log("Current date:", currentDate);
console.log("Expires at:", expiresAt);
console.log("Expires at as Date:", expiresAtDate);
console.log("No expiresAt:", !expiresAt);
console.log("Future expiresAt:", expiresAt && new Date(expiresAt) > currentDate);
console.log("Include listing:", !expiresAt || new Date(expiresAt) > currentDate);