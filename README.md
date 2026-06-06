# 素因数カードゲーム

配られたカードを選び、合計値を素因数分解するゲームです。

## ルール

- カードを1枚以上選びます。
- 選んだカードの合計を素因数分解します。
- 素因数の数が目標以上なら成功です。
- 失敗するとライフが1減ります。
- ライフが0になるまで、最高スコアを目指します。
- 目標ぴったりの素因数数ならボーナス点が入ります。

## 使用技術

- React
- Vite
- GitHub Pages

## ローカルで遊ぶ方法

```bash
npm install
npm run dev
```

## GitHub Pagesで公開する方法

1. このフォルダの中身をGitHubリポジトリにアップロードします。
2. リポジトリ名は `prime-factor-card-game` にするのがおすすめです。
3. GitHubの `Settings` → `Pages` を開きます。
4. `Source` を `GitHub Actions` にします。
5. `Actions` が成功すると公開されます。

公開URLの例：

```text
https://あなたのユーザー名.github.io/prime-factor-card-game/
```

## 注意

リポジトリ名を `prime-factor-card-game` 以外にする場合は、`vite.config.js` の次の部分も変更してください。

```js
base: '/prime-factor-card-game/',
```
