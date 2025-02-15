let additions = {
    "アイテム": [], "ブロック": [], "モブ": [], "状態": [], "実績": [], "ゲーム性": [], "その他": []
};
let changes = {
    "アイテム": [], "ブロック": [], "モブ": [], "状態": [], "実績": [], "ゲーム性": [], "その他": []
};
let fixes = {
    "アイテム": [], "ブロック": [], "モブ": [], "状態": [], "実績": [], "ゲーム性": [], "その他": []
};

// 日本語の文字種を判別
function getCharType(char) {
    if (/^[\p{Script=Hiragana}]$/u.test(char)) return 1; // ひらがな
    if (/^[\p{Script=Katakana}]$/u.test(char)) return 2; // カタカナ
    if (/^[\p{Script=Han}]$/u.test(char)) return 3; // 漢字
    return 4; // その他（アルファベットなど）
}

// ソート関数（ひらがな → カタカナ → 漢字の順に並べる）
function japaneseSort(a, b) {
    const aType = getCharType(a[0]);
    const bType = getCharType(b[0]);
    
    if (aType !== bType) return aType - bType; // 文字種で並べる
    return a.localeCompare(b, "ja"); // 文字種が同じならあいうえお順
}

// 項目を追加する処理
function addItem() {
    const category = document.getElementById("category").value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const content = document.getElementById("content").value.trim();

    if (!content) return;

    if (type === "add") {
        additions[category].push(content);
        additions[category].sort(japaneseSort); // ソート
    } else if (type === "change") {
        changes[category].push(content);
    } else {
        fixes[category].push(content);
    }

    document.getElementById("content").value = "";
    updateCategoryCount();
}

// パッチノートを生成
function generatePatchnote() {
    const version = document.getElementById("version").value || "versionを記入";
    window.electronAPI.generatePatchnote({ version, additions, changes, fixes });
}

// 生成されたパッチノートを表示
window.electronAPI.onPatchnoteGenerated((text) => {
    document.getElementById("output").textContent = text;
});

// カテゴリの項目数を更新する
function updateCategoryCount() {
    ["アイテム", "ブロック", "モブ", "状態", "実績", "ゲーム性", "その他"].forEach(category => {
        let count = (additions[category]?.length || 0) + (changes[category]?.length || 0) + (fixes[category]?.length || 0);
        document.querySelector(`option[value="${category}"]`).textContent = `${category} (${count})`;
    });
}

// クリップボードにコピー
function copyToClipboard() {
    const text = document.getElementById("output").textContent;
    if (text) {
        window.electronAPI.copyToClipboard(text);
        alert("クリップボードにコピーしました！");
    }
}

// ファイルに保存
function saveToFile() {
    const text = document.getElementById("output").textContent;
    if (text) {
        window.electronAPI.saveToFile(text);
        alert("ファイルに保存しました！");
    }
}

// ファイルをロード
function loadFromFile() {
    window.electronAPI.loadFromFile();
}

// ロードした内容を解析してリストに追加
window.electronAPI.onFileLoaded((content) => {
    let lines = content.split("\n");
    let currentCategory = "";
    let currentSection = "additions"; // デフォルトは追加

    // 現在のリストをクリア
    additions = {
        "アイテム": [], "ブロック": [], "モブ": [], "状態": [], "実績": [], "ゲーム性": [], "その他": []
    };
    changes = {
        "アイテム": [], "ブロック": [], "モブ": [], "状態": [], "実績": [], "ゲーム性": [], "その他": []
    };
    fixes = {
        "アイテム": [], "ブロック": [], "モブ": [], "状態": [], "実績": [], "ゲーム性": [], "その他": []
    };

    lines.forEach(line => {
        line = line.trim();
        
        if (line.startsWith("> **>>")) {
            let match = line.match(/>\s\*\*>>(.+?)\*\*/);
            if (match) {
                currentCategory = match[1].trim();
            }
        } else if (line.startsWith("## 追加")) {
            currentSection = "additions";
        } else if (line.startsWith("## 変更")) {
            currentSection = "changes";
        } else if (line.startsWith("## 修正")) {
            currentSection = "fixes";
        } else if (line.startsWith("> ‣")) {
            let match = line.match(/> ‣(.+?)/);
            if (match) {
                let item = match[1].trim();
                if (currentSection === "additions") {
                    additions[currentCategory].push(item);
                }
            }
        }
    });

    // 各カテゴリごとにソート
    Object.keys(additions).forEach(category => {
        additions[category].sort(japaneseSort);
    });

    document.getElementById("output").textContent = content;
    updateCategoryCount();

});
