# ローカルにサーバーを立てる
# Node.jsがインストールされていなければダウンロード
https://nodejs.org/ja/

# node バージョン確認
node -v

# npmのインストール
参照 : https://qiita.com/mk185/items/7ad004bf202f400daea1
sudo npm install -g npm

# npm バージョン確認
npm -v

# http-serverをインストール
npm install -g http-server

# ターミナルで 「diangnosetool_20220313」のディレクトリまで移動してサーバーを立てる
(例) cd ~/Desktop/diangnosetool_20220313 
http-server

# 成功したら表示される http://localhost:8080をwebで開く