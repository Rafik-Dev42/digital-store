const CART_SESSION_KEY = "cart_session";

export function getCartSessionId(): string {
  let sid = localStorage.getItem(CART_SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, sid);
  }
  return sid;
}
