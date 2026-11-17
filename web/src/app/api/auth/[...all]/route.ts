import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/shared/auth/server";

// Better Auth の API（登録・ログイン・ログアウトなど）をすべてここで受ける
export const { GET, POST } = toNextJsHandler(auth);
