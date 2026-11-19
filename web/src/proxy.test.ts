import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { proxy } from "./proxy";

const ORIGIN = "http://localhost:3000";

/** Better Auth のセッション Cookie を付けるかどうかを選んで、リクエストを作る */
function request(path: string, { loggedIn }: { loggedIn: boolean }) {
  const headers = new Headers();
  if (loggedIn) {
    headers.set("cookie", "better-auth.session_token=dummy");
  }
  return new NextRequest(new URL(path, ORIGIN), { headers });
}

/** 移動先の URL。移動しないときは null */
function redirectTo(response: Response) {
  return response.headers.get("location");
}

describe("ログインしていない人", () => {
  test("/ を開くと /login に移動する", () => {
    const response = proxy(request("/", { loggedIn: false }));
    expect(redirectTo(response)).toBe(`${ORIGIN}/login`);
  });

  test.each(["/login", "/signup"])("%s はそのまま開ける", (path) => {
    const response = proxy(request(path, { loggedIn: false }));
    expect(redirectTo(response)).toBeNull();
  });

  test("マニフェスト（/manifest.webmanifest）はそのまま読める", () => {
    const response = proxy(
      request("/manifest.webmanifest", { loggedIn: false }),
    );
    expect(redirectTo(response)).toBeNull();
  });
});

describe("セッションの Cookie がある人", () => {
  // Cookie が無効（期限切れなど）でもログインし直せるよう、/login・/signup からは移動させない
  test.each(["/login", "/signup"])("%s もそのまま開ける", (path) => {
    const response = proxy(request(path, { loggedIn: true }));
    expect(redirectTo(response)).toBeNull();
  });

  test("/ はそのまま開ける", () => {
    const response = proxy(request("/", { loggedIn: true }));
    expect(redirectTo(response)).toBeNull();
  });
});
