import { useState } from "react";
import { auth, db } from "../../firebase";
import {
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  usernameToFirebaseEmail,
  firebaseAuthMessage,
  usernameKey,
  cleanId,
  same,
  normalizeImageUrl,
} from "../../utils/authUtils";

// authCss is injected via <style> tag. Pass it as a prop or import from:
//   import authCss from "../../styles/auth.css?inline";
// or import the CSS string from your styles.

export function LoginPage({
  members = [],
  appTitle = "FIFA GROUP",
  seasonTitle = "",
  logoUrl = "",
  authCss = "",
}) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const isRegister = mode === "register";
  const activeMembers = Array.isArray(members) ? members : [];
  const safeLogoUrl = normalizeImageUrl(logoUrl);

  async function handleResetPassword() {
    setMessage("");
    const cleanUsername = String(username || "").trim();
    if (!cleanUsername) {
      setMessage("اكتب اسم المستخدم أولًا لإرسال رابط إعادة تعيين كلمة المرور.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, usernameToFirebaseEmail(cleanUsername));
      setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريد الحساب المرتبط بهذا المستخدم.");
    } catch (err) {
      console.error(err);
      setMessage(firebaseAuthMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const cleanUsername = String(username || "").trim();
    const cleanPassword = String(password || "").trim();

    if (!cleanUsername) {
      setMessage("اكتب اسم المستخدم.");
      return;
    }

    if (cleanPassword.length < 6) {
      setMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    if (isRegister && !memberId) {
      setMessage("اختر العضو المرتبط بهذا الحساب.");
      return;
    }

    setBusy(true);

    try {
      const email = usernameToFirebaseEmail(cleanUsername);

      if (isRegister) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          cleanPassword
        );

        const selectedMember = activeMembers.find((item) =>
          same(item.id, memberId)
        );

        await setDoc(doc(db, "users", result.user.uid), {
          username: cleanUsername,
          usernameKey: usernameKey(cleanUsername),
          memberId: cleanId(memberId),
          memberName: selectedMember?.name || "",
          role: "member",
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return;
      }

      await signInWithEmailAndPassword(auth, email, cleanPassword);
    } catch (err) {
      console.error(err);
      setMessage(firebaseAuthMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="authShell" dir="rtl">
      <style>{authCss}</style>
      <section className="authCard">
        <div className={safeLogoUrl ? "authLogo hasImage" : "authLogo"}>
          {safeLogoUrl ? <img src={safeLogoUrl} alt="FIFA GROUP" /> : "FG"}
        </div>
        <p className="authKicker">{seasonTitle || "FIFA GROUP"}</p>
        <h1>{appTitle || "FIFA GROUP"}</h1>
        <p className="authSub">
          {isRegister
            ? "أنشئ حسابك باسم مستخدم وكلمة مرور، ثم اربطه بعضويتك."
            : "ادخل باسم المستخدم وكلمة المرور الخاصة بك."}
        </p>

        <form onSubmit={handleSubmit} className="authForm">
          <label>
            <span>اسم المستخدم</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="مثال: abdullah"
              autoComplete="username"
            />
          </label>

          <label>
            <span>كلمة المرور</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>

          {isRegister ? (
            <label>
              <span>اختر عضويتك</span>
              <select
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
              >
                <option value="">اختر العضو</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.id}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {message ? <p className="authMessage">{message}</p> : null}

          <button type="submit" disabled={busy}>
            {busy ? "جاري التنفيذ..." : isRegister ? "إنشاء الحساب" : "دخول"}
          </button>
        </form>

        {!isRegister ? (
          <button type="button" className="authForgot" disabled={busy} onClick={handleResetPassword}>
            نسيت كلمة المرور؟
          </button>
        ) : null}

        <button
          type="button"
          className="authSwitch"
          onClick={() => {
            setMode(isRegister ? "login" : "register");
            setMessage("");
          }}
        >
          {isRegister ? "لدي حساب بالفعل" : "إنشاء حساب جديد"}
        </button>
      </section>
    </main>
  );
}
