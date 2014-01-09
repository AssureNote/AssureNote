AssureNote
==========

## 対応フォーマット
現在以下のフォーマットに対応しています。
* Wiki-style GSN (*.wgsn)
* D-Case Editor (*.dcase_model)

## 操作方法
### 基本操作
画面の何も無い部分へファイルをドロップすると、そのファイルを開きます。
スクロールはマウスで画面をドラッグして行います。ノードを右クリックすると、コンテキストメニューが表示されます。
#### ノードの折りたたみ
ノードをダブルクリックすると、そのノード以下のツリーを折りたたむことができます。
もう一度ダブルクリックするか、スクロールによって画面の中央上側に持って行くと展開されます。
コンテキストメニューからも切り替えることが可能です。
### 編集
コンテキストメニューでFullscreenEditorを選ぶと、テキストエディタが表示され、編集モードに入ります。
このモードでは、コンテキストメニューを出したノード以下のツリーをWGSN形式で編集することが出来ます。
`ESC`キーを押すと編集モードを抜けます。
### メニュー
主要な機能は上部のメニューから呼び出せます。
* `File`
    * `New...` 新しいファイルを作成する
    * `Open...` ファイルを開く
    * `Save` ファイルを保存する
    * `Save As`
        * `*.wgsn...` WGSN形式でファイルを保存する
        * `*.dcase_model...` D-Case Editor形式でファイルを保存する

### コマンドライン
AssureNoteではコマンドラインから操作を行うことができます。
`:`キーでコンソールを開き、コマンドを入力して`Enter`キーを押すと実行されます。

現在、使用可能なコマンドは以下の通りです。
* `help` コマンドの簡単な説明を表示する
* `new [name]` 新しいファイルを作成する
* `open` ファイルを開く
* `save [name]` ファイルを保存する
* `unfold-all` すべてのノードを展開する
* `set-scale scale` 拡大率を`scale`(0.2~2.0)にする
* `set-color label color` ノードに色を付ける `label`: 対象となるノードのラベル, `color`: 色 `#FFFFFF`で指定する

また、`:`に続いてコマンド名ではなくノードのラベルを指定すると、そのノードへジャンプします。
#### サンプル
```
:G3
```
ノードG3へジャンプする
```
:save foo.wgsn
```
現在編集している内容を`foo.wgsn`として保存する。
ただし、ブラウザによっては改めてダイアログが出る場合があります。
### 検索
`/`キーを押すと検索コンソールが開きます。検索したい文字列を入力し、`Enter`キーを押すと検索が実行されます。

検索はノードの本文に対して行われ、ヒットしたノードはハイライト表示されます。このとき、`Enter`キーで次の検索結果、`Shift+Enter`キーで前の検索結果にジャンプします。

`ESC`キーを押すと検索結果の閲覧を終了します。

## WGSN (Wiki-Style GSN)
WGSNはGSNのテキスト表現として開発された表記法で、AssureNoteではこのWGSNを用いてGSNの編集を行います。
### WGSNのサンプル
```
* G:TopGoal
ゴール: [システム]はディペンダブルである
* C:Context
前提: [G:TopGoal]が成り立つ状況
システム:: Web教育システム
* S
戦略: 主張を分解する指標
** G:SubGoal
サブゴール: 分解された主張
** E
証拠: [システム]における、サブゴールの成立を支持する事実
** C
反証: 証拠に対する反例
** G
未達成なサブゴール
```

#### ラベル
WGSNの記法において、アスタリスク`*`から開始される文章がノードの先頭を示します。その際、`Goal``Context``Strategy``Evidence`の各ノードはそれぞれ、`G``C``S``E`のラベルを用いて表現します。

#### 基本構造
WGSNでは、以下のルールに基づいて、アスタリスクの数によってノードの親子関係を表しています。
* N個のアスタリスクを持つ`Goal`は、N-1個のアスタリスクを持つ`Strategy`の子
* N個のアスタリスクを持つ`Strategy``Evidence`はN-1個のアスタリスクを持つ`Goal`の子
* N個のアスタリスクを持つ`Context`はN個のアスタリスクを持つ直前のノードの子
* 最上位の`Goal(TopGoal`はアスタリスク一つ

上記の例では、`G:TopGoal`が最上位のゴールとなり、`C:Context`はその子となります。また、`G:SubGoal`は`Strategy`の子です。
ノードを一意に表す際は、ラベルの直後に`:`から始まるシンボルを挿入します。

#### タグ
ラベルが記述された行以降は、ノードの本文となります。自由に記述することが可能ですが、`(シンボル):: (パラメータ)`という形式で記述された行は`タグ`として解釈されます。

#### 参照
一意に表されたノードやタグは、角括弧`[]`を用いることでこれを参照することが可能です。上記の例において、`[G:TopGoal]`及び`[シンボル]`と記述された箇所です。
##### ノードとタグのスコープ
ノードについてはWGSNのあらゆる箇所から参照することができます。ただし、タグのスコープは定義されたノードの子や孫に限られます。例外として、`Context`に記述されたタグのスコープは、`Context`の親と同一です。このため、上記の例において`Evidence`から`[システム]`が参照可能です。
