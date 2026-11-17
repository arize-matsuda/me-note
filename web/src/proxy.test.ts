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
});

describe("ログイン済みの人", () => {
  test.each(["/login", "/signup"])("%s を開くと / に移動する", (path) => {
    const response = proxy(request(path, { loggedIn: true }));
    expect(redirectTo(response)).toBe(`${ORIGIN}/`);
  });

  test("/ はそのまま開ける", () => {
    const response = proxy(request("/", { loggedIn: true }));
    expect(redirectTo(response)).toBeNull();
  });
});
