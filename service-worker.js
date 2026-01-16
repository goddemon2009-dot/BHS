// ★ オフライン機能なし・キャッシュなしの安全版 SW
self.addEventListener("install", event => {
  // すぐに新しいSWを有効化
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  // 古いSWを即座に置き換え
  clients.claim();
});

// fetch を横取りしない（キャッシュもしない）
self.addEventListener("fetch", event => {
  // 何もしない
});

