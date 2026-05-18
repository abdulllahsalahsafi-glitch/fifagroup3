export function formatTransferDate(value) {
  if (value?.toDate) return value.toDate().toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function usernameKey(value) {
  return String(value || "").trim().toLowerCase();
}

export function usernameToFirebaseEmail(value) {
  const encoded = encodeURIComponent(usernameKey(value))
    .replace(/%/g, "p")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${encoded || "user"}@fifagroup.local`;
}

export function firebaseAuthMessage(error) {
  const code = String(error?.code || "");
  if (code.includes("auth/email-already-in-use"))
    return "اسم المستخدم مستخدم مسبقًا.";
  if (code.includes("auth/invalid-credential"))
    return "اسم المستخدم أو كلمة المرور غير صحيحة.";
  if (code.includes("auth/user-not-found"))
    return "لا يوجد حساب بهذا الاسم.";
  if (code.includes("auth/wrong-password"))
    return "كلمة المرور غير صحيحة.";
  if (code.includes("auth/weak-password"))
    return "كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.";
  return "حدث خطأ. حاول مرة أخرى.";
}

export function cleanId(value) {
  return String(value || "").trim();
}

export function same(a, b) {
  return cleanId(a) === cleanId(b);
}

export function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch?.[1])
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`;
  const imgurMatch = url.match(/^https?:\/\/imgur\.com\/([A-Za-z0-9]+)$/);
  if (imgurMatch?.[1]) return `https://i.imgur.com/${imgurMatch[1]}.png`;
  return url;
}
